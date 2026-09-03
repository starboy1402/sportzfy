import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const turfId = searchParams.get("turfId");

    const where = turfId ? { turfId } : {};
    const intervals = await prisma.blockedInterval.findMany({
      where,
      include: {
        turf: { select: { name: true, area: true } },
      },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json({ data: intervals });
  } catch (error) {
    console.error("Error fetching blocked intervals:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch blocked intervals." } },
      { status: 500 }
    );
  }
}

import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Turf owner or administrator access required." } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { turfId, startTime, endTime, reason = "Walk-in reservation" } = body;

    if (!turfId || !startTime || !endTime) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing required slot interval parameters." } },
        { status: 400 }
      );
    }

    // Verify turf ownership
    if (currentUser.role === "OWNER") {
      const turf = await prisma.turf.findUnique({
        where: { id: turfId },
        select: { ownerId: true },
      });
      if (!turf || turf.ownerId !== currentUser.id) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "You can only block intervals for your own venues." } },
          { status: 403 }
        );
      }
    }

    const slotStart = new Date(startTime);
    const slotEnd = new Date(endTime);

    // Check if slot already has confirmed booking
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        turfId,
        status: "CONFIRMED",
        startTime: { lt: slotEnd },
        endTime: { gt: slotStart },
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        {
          error: {
            code: "BOOKING_EXISTS",
            message: "Cannot block slot: an online player has already confirmed a booking for this interval.",
          },
        },
        { status: 409 }
      );
    }

    const blocked = await prisma.blockedInterval.create({
      data: {
        turfId,
        startTime: slotStart,
        endTime: slotEnd,
        reason,
      },
    });

    return NextResponse.json(
      { data: blocked, message: "Slot successfully locked for walk-in / maintenance." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blocked interval:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to block interval." } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Turf owner or administrator access required." } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "ID is required to unblock slot." } },
        { status: 400 }
      );
    }

    // Verify ownership
    if (currentUser.role === "OWNER") {
      const interval = await prisma.blockedInterval.findUnique({
        where: { id },
        include: { turf: { select: { ownerId: true } } },
      });
      if (!interval || interval.turf.ownerId !== currentUser.id) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "You can only unblock intervals for your own venues." } },
          { status: 403 }
        );
      }
    }

    await prisma.blockedInterval.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Slot unblocked successfully. Now bookable online." });
  } catch (error) {
    console.error("Error deleting blocked interval:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to delete blocked interval." } },
      { status: 500 }
    );
  }
}
