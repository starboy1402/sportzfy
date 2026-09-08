import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateDynamicSlotPrice, calculateSlotPrice, getBangladeshHour } from "@/lib/pricing";

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

    // Define target date bounds deterministically in Bangladesh Standard Time (BST / UTC+6)
    const [yearStr, monthStr, dayStr] = dateParam.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-indexed
    const day = parseInt(dayStr, 10);

    // Midnight 00:00 BST on target day is 18:00 UTC of previous day (h - 6)
    const dayStart = new Date(Date.UTC(year, month, day, 0 - 6, 0, 0));
    // Day end extends to 3:00 AM BST next day (21:00 UTC of target day)
    const dayEnd = new Date(Date.UTC(year, month, day, 27 - 6, 0, 0));

    // Fetch existing bookings overlapping with target day range
    const bookings = await prisma.booking.findMany({
      where: {
        turfId: turf.id,
        status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
    });

    // Fetch active holds overlapping with target day range
    const now = new Date();
    const activeHolds = await prisma.hold.findMany({
      where: {
        turfId: turf.id,
        status: "ACTIVE",
        expiresAt: { gt: now },
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
    });

    // Fetch blocked intervals overlapping with target day range
    const blockedIntervals = await prisma.blockedInterval.findMany({
      where: {
        turfId: turf.id,
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
    });

    // Calculate 4-week rolling booking density to feed the ML model
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const recentBookingsCount = await prisma.booking.count({
      where: {
        turfId: turf.id,
        status: "CONFIRMED",
        createdAt: { gte: fourWeeksAgo },
      },
    });
    // Venue capacity across 28 days (~9 evening slots/day = 252 total slots)
    const historicalDensity = Math.min(0.95, Math.max(0.15, Math.round((recentBookingsCount / 252) * 100) / 100));

    // Build standard evening/night timetable: 4 PM (16:00) through 12 AM (24:00)
    // 16:00, 17:00, 18:00, 19:00, 20:00, 21:00, 22:00, 23:00, 24:00 (00:00)
    const slots = [];
    const hours = [16, 17, 18, 19, 20, 21, 22, 23, 24];

    for (const h of hours) {
      // In BST (UTC+6), UTC hour = h - 6
      const slotStart = new Date(Date.UTC(year, month, day, h - 6, 0, 0));
      const slotEnd = new Date(Date.UTC(year, month, day, h + 1 - 6, 0, 0));

      // Check collisions
      const isBooked = bookings.some(
        (b) => slotStart < b.endTime && slotEnd > b.startTime
      );

      const activeHold = activeHolds.find(
        (hd) => slotStart < hd.endTime && slotEnd > hd.startTime
      );

      const isBlocked = blockedIntervals.some(
        (bi) => slotStart < bi.endTime && slotEnd > bi.startTime
      );

      let status = "AVAILABLE";
      if (slotStart <= now) {
        status = "UNAVAILABLE"; // Cannot book slots in the past
      } else if (isBooked) {
        status = "BOOKED";
      } else if (activeHold) {
        status = "HELD";
      } else if (isBlocked) {
        status = "BLOCKED";
      }

      // Calculate dynamic price using native Random Forest in-process engine with live density
      const dynamicQuote = calculateDynamicSlotPrice(turf.basePricePerHour, slotStart, {
        venueRating: turf.rating || 4.7,
        historicalDensity,
      });

      // Format human-readable time label with 24-hour modulo arithmetic
      const startHour24 = h % 24;
      const endHour24 = (h + 1) % 24;
      const startHourNum = startHour24 === 0 ? 12 : startHour24 > 12 ? startHour24 - 12 : startHour24;
      const startPeriod = startHour24 >= 12 ? "PM" : "AM";
      const endHourNum = endHour24 === 0 ? 12 : endHour24 > 12 ? endHour24 - 12 : endHour24;
      const endPeriod = endHour24 >= 12 ? "PM" : "AM";
      const label = `${startHourNum}:00 ${startPeriod} - ${endHourNum}:00 ${endPeriod}`;

      slots.push({
        slotId: `${turf.id}_${slotStart.getTime()}`,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        timeLabel: label,
        isPeakHour: dynamicQuote.isPeak,
        isDiscounted: dynamicQuote.isDiscounted,
        demandScore: dynamicQuote.demandScore,
        multiplier: dynamicQuote.multiplier,
        badgeText: dynamicQuote.badgeText,
        pricingExplanation: dynamicQuote.explanation,
        price: dynamicQuote.finalPrice,
        basePrice: turf.basePricePerHour,
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
