import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateSlotPrice, validateSlotTimes } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { turfId, startTime, endTime } = body;

    if (!turfId || !startTime || !endTime) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing required booking slot parameters." } },
        { status: 400 }
      );
    }

    const slotStart = new Date(startTime);
    const slotEnd = new Date(endTime);
    const now = new Date();

    // Validate slot time boundaries (no past slots, within 14 days, valid interval)
    const slotValidation = validateSlotTimes(slotStart, slotEnd, now);
    if (!slotValidation.valid) {
      return NextResponse.json(
        { error: { code: slotValidation.errorCode, message: slotValidation.errorMessage } },
        { status: 400 }
      );
    }

    // Require authenticated session
    const currentUser = await getCurrentUser();
    let player = currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id } })
      : null;

    if (!player) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Please log in to your Sportzfy account to reserve a pitch.",
          },
        },
        { status: 401 }
      );
    }

    // Atomic Transaction for hold acquisition
    const hold = await prisma.$transaction(async (tx) => {
      // 0. Verify turf exists & fetch authentic base rate
      const turf = await tx.turf.findUnique({
        where: { id: turfId },
        select: { id: true, basePricePerHour: true, name: true, status: true },
      });

      if (!turf) {
        throw new Error("TURF_NOT_FOUND");
      }

      if (turf.status !== "APPROVED") {
        throw new Error("TURF_NOT_AVAILABLE");
      }

      // Compute tamper-proof authentic price server-side
      const authenticPrice = calculateSlotPrice(turf.basePricePerHour, slotStart);

      // 1. Check for overlapping confirmed booking
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          turfId,
          status: "CONFIRMED",
          startTime: { lt: slotEnd },
          endTime: { gt: slotStart },
        },
      });

      if (conflictingBooking) {
        throw new Error("SLOT_ALREADY_BOOKED");
      }

      // 2. Check for active unexpired hold
      const conflictingHold = await tx.hold.findFirst({
        where: {
          turfId,
          status: "ACTIVE",
          expiresAt: { gt: now },
          startTime: { lt: slotEnd },
          endTime: { gt: slotStart },
        },
      });

      if (conflictingHold) {
        throw new Error("SLOT_HELD_BY_ANOTHER");
      }

      // 3. Check for blocked intervals (walk-ins / maintenance)
      const blocked = await tx.blockedInterval.findFirst({
        where: {
          turfId,
          startTime: { lt: slotEnd },
          endTime: { gt: slotStart },
        },
      });

      if (blocked) {
        throw new Error("SLOT_BLOCKED");
      }

      // 4. Create new 5-minute hold (300 seconds TTL)
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

      const newHold = await tx.hold.create({
        data: {
          turfId,
          userId: player.id,
          startTime: slotStart,
          endTime: slotEnd,
          price: authenticPrice, // Server-calculated price
          expiresAt,
          status: "ACTIVE",
        },
        include: {
          turf: {
            select: {
              name: true,
              area: true,
              city: true,
              address: true,
              coverImage: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return newHold;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return NextResponse.json(
      {
        data: hold,
        message: "Slot hold acquired successfully. You have 5 minutes to complete payment.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Catch PostgreSQL serialization conflicts under heavy concurrent requests
    if (error.code === "P2034" || (error.message && error.message.includes("could not serialize access"))) {
      return NextResponse.json(
        {
          error: {
            code: "SLOT_HELD_BY_ANOTHER",
            message: "Another user is currently checking out this slot. It will become available if they do not complete payment within 5 minutes.",
          },
        },
        { status: 409 }
      );
    }

    if (error.message === "TURF_NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Turf venue not found." } },
        { status: 404 }
      );
    }

    if (error.message === "TURF_NOT_AVAILABLE") {
      return NextResponse.json(
        { error: { code: "TURF_NOT_AVAILABLE", message: "This turf is currently not available for reservations." } },
        { status: 400 }
      );
    }

    if (error.message === "SLOT_ALREADY_BOOKED") {
      return NextResponse.json(
        {
          error: {
            code: "SLOT_ALREADY_BOOKED",
            message: "This slot has already been booked by another team.",
          },
        },
        { status: 409 }
      );
    }

    if (error.message === "SLOT_HELD_BY_ANOTHER") {
      return NextResponse.json(
        {
          error: {
            code: "SLOT_HELD_BY_ANOTHER",
            message: "Another user is currently checking out this slot. It will become available if they do not complete payment within 5 minutes.",
          },
        },
        { status: 409 }
      );
    }

    if (error.message === "SLOT_BLOCKED") {
      return NextResponse.json(
        {
          error: {
            code: "SLOT_BLOCKED",
            message: "This slot has been locked for a walk-in match or pitch maintenance.",
          },
        },
        { status: 409 }
      );
    }

    console.error("Hold error:", error);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Internal server error while holding slot.",
        },
      },
      { status: 500 }
    );
  }
}
