import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { turfId, startTime, endTime, price } = body;

    if (!turfId || !startTime || !endTime || price === undefined) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing required booking slot details." } },
        { status: 400 }
      );
    }

    const slotStart = new Date(startTime);
    const slotEnd = new Date(endTime);
    const now = new Date();

    // Fetch synthetic player user (Sakib Alif from seed) or create if not present
    let player = await prisma.user.findFirst({
      where: { role: "CUSTOMER" },
    });

    if (!player) {
      player = await prisma.user.create({
        data: {
          email: "player@sportzfy.com",
          name: "Sakib Alif",
          role: "CUSTOMER",
        },
      });
    }

    // Atomic Transaction for hold acquisition
    const hold = await prisma.$transaction(async (tx) => {
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

      // 3. Check for blocked intervals
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
          price: Number(price),
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
        },
      });

      return newHold;
    });

    return NextResponse.json(
      {
        data: hold,
        message: "Slot held successfully for 5 minutes.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "SLOT_ALREADY_BOOKED" || err.message === "SLOT_HELD_BY_ANOTHER" || err.message === "SLOT_BLOCKED") {
      return NextResponse.json(
        {
          error: {
            code: "SLOT_CONFLICT",
            message: "This slot is no longer available. Another player has reserved or held it.",
          },
        },
        { status: 409 }
      );
    }

    console.error("Hold acquisition error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to acquire slot hold." } },
      { status: 500 }
    );
  }
}
