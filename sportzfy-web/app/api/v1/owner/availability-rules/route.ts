import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Owner or administrator access required." } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const turfId = searchParams.get("turfId");

    if (!turfId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "turfId parameter is required." } },
        { status: 400 }
      );
    }

    // Verify ownership
    const turf = await prisma.turf.findUnique({
      where: { id: turfId },
      select: { id: true, ownerId: true, basePricePerHour: true, name: true },
    });

    if (!turf) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Venue not found." } },
        { status: 404 }
      );
    }

    if (currentUser.role === "OWNER" && turf.ownerId !== currentUser.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You do not own this venue." } },
        { status: 403 }
      );
    }

    let rules = await prisma.availabilityRule.findMany({
      where: { turfId },
      orderBy: { dayOfWeek: "asc" },
    });

    // Ensure all 7 days (0 to 6) exist
    if (rules.length < 7) {
      const existingDays = new Set(rules.map((r) => r.dayOfWeek));
      const missingDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => !existingDays.has(d));

      if (missingDays.length > 0) {
        await prisma.availabilityRule.createMany({
          data: missingDays.map((dayOfWeek) => ({
            turfId,
            dayOfWeek,
            openHour: 16,
            closeHour: 25,
            hourlyRate: turf.basePricePerHour,
          })),
        });

        rules = await prisma.availabilityRule.findMany({
          where: { turfId },
          orderBy: { dayOfWeek: "asc" },
        });
      }
    }

    return NextResponse.json({
      data: {
        turfId: turf.id,
        turfName: turf.name,
        basePricePerHour: turf.basePricePerHour,
        rules,
      },
    });
  } catch (error) {
    console.error("Error fetching availability rules:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch schedule rules." } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Owner or administrator access required." } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { turfId, rules } = body;

    if (!turfId || !Array.isArray(rules)) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "turfId and rules array are required." } },
        { status: 400 }
      );
    }

    // Verify ownership
    const turf = await prisma.turf.findUnique({
      where: { id: turfId },
      select: { id: true, ownerId: true },
    });

    if (!turf) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Venue not found." } },
        { status: 404 }
      );
    }

    if (currentUser.role === "OWNER" && turf.ownerId !== currentUser.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You do not own this venue." } },
        { status: 403 }
      );
    }

    // Update or upsert each rule
    for (const rule of rules) {
      const dayOfWeek = Number(rule.dayOfWeek);
      const openHour = Number(rule.openHour ?? 16);
      const closeHour = Number(rule.closeHour ?? 25);
      const hourlyRate = Number(rule.hourlyRate);

      if (isNaN(hourlyRate) || hourlyRate <= 0) {
        continue;
      }

      const existing = await prisma.availabilityRule.findFirst({
        where: { turfId, dayOfWeek },
      });

      if (existing) {
        await prisma.availabilityRule.update({
          where: { id: existing.id },
          data: {
            openHour,
            closeHour,
            hourlyRate,
          },
        });
      } else {
        await prisma.availabilityRule.create({
          data: {
            turfId,
            dayOfWeek,
            openHour,
            closeHour,
            hourlyRate,
          },
        });
      }
    }

    const updatedRules = await prisma.availabilityRule.findMany({
      where: { turfId },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({
      data: updatedRules,
      message: "7-day rate & schedule grid saved successfully.",
    });
  } catch (error) {
    console.error("Error updating availability rules:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update schedule rules." } },
      { status: 500 }
    );
  }
}
