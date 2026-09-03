import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const turf = await prisma.turf.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!turf) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Turf not found" } },
        { status: 404 }
      );
    }

    // Define target date bounds in local/Dhaka timezone
    const selectedDate = new Date(dateParam);
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(selectedDate);
    dayEnd.setDate(dayEnd.getDate() + 1);
    dayEnd.setHours(3, 0, 0, 0); // Include past midnight slots up to 3 AM

    // Fetch existing bookings for this turf and date range
    const bookings = await prisma.booking.findMany({
      where: {
        turfId: turf.id,
        status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
        startTime: { gte: dayStart, lt: dayEnd },
      },
    });

    // Fetch active holds (where expiresAt > now and status is ACTIVE)
    const now = new Date();
    const activeHolds = await prisma.hold.findMany({
      where: {
        turfId: turf.id,
        status: "ACTIVE",
        expiresAt: { gt: now },
        startTime: { gte: dayStart, lt: dayEnd },
      },
    });

    // Fetch blocked intervals
    const blockedIntervals = await prisma.blockedInterval.findMany({
      where: {
        turfId: turf.id,
        startTime: { gte: dayStart, lt: dayEnd },
      },
    });

    // Build standard evening/night timetable: 4 PM (16:00) through 12 AM (24:00)
    // 16:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00, 23:00, 24:00 (00:00)
    const slots = [];
    const hours = [16, 17, 18, 19, 20, 21, 22, 23, 24];

    for (const h of hours) {
      const slotStart = new Date(selectedDate);
      if (h === 24) {
        slotStart.setDate(slotStart.getDate() + 1);
        slotStart.setHours(0, 0, 0, 0);
      } else {
        slotStart.setHours(h, 0, 0, 0);
      }

      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotStart.getHours() + 1);

      // Check collisions
      const isBooked = bookings.some(
        (b) => slotStart < b.endTime && slotEnd > b.startTime
      );

      const activeHold = activeHolds.find(
        (hd) => slotStart < hd.endTime && slotEnd > hd.startTime
      );

      const isBlocked = blockedIntervals.some(
        (bl) => slotStart < bl.endTime && slotEnd > bl.startTime
      );

      let status = "AVAILABLE";
      if (isBooked) {
        status = "BOOKED";
      } else if (activeHold) {
        status = "HELD";
      } else if (isBlocked) {
        status = "BLOCKED";
      }

      // Calculate hourly price with peak window adjustment (8 PM - 11 PM)
      let price = turf.basePricePerHour;
      const isPeakHour = h >= 20 && h <= 23;
      if (isPeakHour) {
        price += 150; // Dynamic peak hour addition
      }

      // Format human-readable time label
      const startHourNum = h === 24 ? 12 : h > 12 ? h - 12 : h;
      const startPeriod = h >= 12 && h < 24 ? "PM" : "AM";
      const endH = (h + 1) === 24 ? 12 : (h + 1) > 12 ? (h + 1) - 12 : (h + 1);
      const endPeriod = (h + 1) >= 12 && (h + 1) < 24 ? "PM" : "AM";
      const label = `${startHourNum}:00 ${startPeriod} - ${endH}:00 ${endPeriod}`;

      slots.push({
        slotId: `${turf.id}_${slotStart.getTime()}`,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        timeLabel: label,
        isPeakHour,
        price,
        status, // "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED"
        holdExpiresAt: activeHold ? activeHold.expiresAt.toISOString() : null,
      });
    }

    return NextResponse.json({
      data: {
        turfId: turf.id,
        turfName: turf.name,
        date: dateParam,
        slots,
      },
    });
  } catch (error) {
    console.error("Error computing availability:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to compute availability" } },
      { status: 500 }
    );
  }
}
