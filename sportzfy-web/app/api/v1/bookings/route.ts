import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import QRCode from "qrcode";

const ALLOWED_PAYMENT_METHODS = ["BKASH", "NAGAD", "ROCKET", "CARD"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { holdId, paymentMethod = "BKASH", accountNumber = "01812345678", transactionId } = body;

    if (!holdId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Hold ID is required to confirm booking." } },
        { status: 400 }
      );
    }

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: { code: "INVALID_PAYMENT", message: "Unsupported payment method selected." } },
        { status: 400 }
      );
    }

    // Require authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Please log in to confirm your booking.",
          },
        },
        { status: 401 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify hold
      const hold = await tx.hold.findUnique({
        where: { id: holdId },
        include: { turf: true, user: true },
      });

      if (!hold) {
        throw new Error("HOLD_NOT_FOUND");
      }

      // Security: Ensure confirming player is the one who acquired the hold (or admin)
      if (hold.userId !== currentUser.id && currentUser.role !== "ADMIN") {
        throw new Error("UNAUTHORIZED_HOLD_ACCESS");
      }

      if (hold.status !== "ACTIVE" || hold.expiresAt <= now) {
        throw new Error("HOLD_EXPIRED");
      }

      // 2. Generate unique match ticket reference
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const referenceCode = `SPZ-2026-${randomSuffix}`;
      const generatedTxId = transactionId || `TXN${Date.now().toString().slice(-8)}`;

      // 3. Create confirmed booking
      const booking = await tx.booking.create({
        data: {
          referenceCode,
          turfId: hold.turfId,
          userId: hold.userId,
          holdId: hold.id,
          startTime: hold.startTime,
          endTime: hold.endTime,
          totalAmount: hold.price,
          status: "CONFIRMED",
          paymentMethod,
          transactionId: generatedTxId,
        },
        include: {
          turf: {
            select: {
              name: true,
              area: true,
              city: true,
              address: true,
              pitchFormats: true,
            },
          },
          user: {
            select: {
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      });

      // 4. Update hold status
      await tx.hold.update({
        where: { id: hold.id },
        data: { status: "CONSUMED" },
      });

      // 5. Record payment attempt
      await tx.paymentAttempt.create({
        data: {
          bookingId: booking.id,
          holdId: hold.id,
          provider: paymentMethod,
          accountNumber,
          amount: hold.price,
          status: "SUCCEEDED",
          idempotencyKey: `idemp_${booking.id}_${Date.now()}`,
        },
      });

      return booking;
    });

    // Generate real QR code for match entry
    const qrData = JSON.stringify({
      ref: result.referenceCode,
      turf: result.turf.name,
      time: result.startTime,
      player: result.user.name,
      status: "VERIFIED",
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 250,
      margin: 2,
      color: { dark: "#064E3B", light: "#FFFFFF" },
    });

    return NextResponse.json(
      {
        data: {
          ...result,
          qrCode: qrCodeDataUrl,
        },
        message: "Match slot booked successfully! Your pass is ready.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "HOLD_NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Hold reservation was not found." } },
        { status: 404 }
      );
    }
    if (err.message === "HOLD_EXPIRED") {
      return NextResponse.json(
        {
          error: {
            code: "HOLD_EXPIRED",
            message: "Your 5-minute hold expired before payment. Please select the slot again.",
          },
        },
        { status: 410 }
      );
    }
    if (err.message === "UNAUTHORIZED_HOLD_ACCESS") {
      return NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Unauthorized. You cannot confirm a booking for a hold belonging to another user.",
          },
        },
        { status: 403 }
      );
    }

    console.error("Booking confirmation error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to confirm booking." } },
      { status: 500 }
    );
  }
}
