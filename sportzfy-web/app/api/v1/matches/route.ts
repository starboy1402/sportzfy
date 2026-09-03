import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const format = searchParams.get("format");
    const area = searchParams.get("area");

    const where: Record<string, unknown> = {
      status: "OPEN",
    };

    if (role && role !== "All") {
      where.requiredRole = role;
    }

    if (format && format !== "All") {
      where.sportFormat = format;
    }

    if (area && area !== "All") {
      where.area = { contains: area };
    }

    const matches = await prisma.matchPost.findMany({
      where,
      include: {
        turf: {
          select: {
            id: true,
            name: true,
            area: true,
            city: true,
            coverImage: true,
          },
        },
        hostUser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            phone: true,
          },
        },
        joinRequests: {
          where: { status: "ACCEPTED" },
          include: {
            user: { select: { name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { matchTime: "asc" },
    });

    return NextResponse.json({ data: matches, count: matches.length });
  } catch (error) {
    console.error("Error fetching match posts:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch matchmaking posts." } },
      { status: 500 }
    );
  }
}

import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Please log in to host a match recruitment challenge." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      turfId,
      sportFormat = "7v7",
      matchTime,
      area,
      totalSpots = 14,
      openSpots = 1,
      costPerPlayer = 150,
      requiredRole = "Goalkeeper",
    } = body;

    if (!title || !turfId || !matchTime) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing required match parameters." } },
        { status: 400 }
      );
    }

    const mDate = new Date(matchTime);
    if (isNaN(mDate.getTime()) || mDate <= new Date()) {
      return NextResponse.json(
        { error: { code: "INVALID_MATCH_TIME", message: "Match must be scheduled for a future date and time." } },
        { status: 400 }
      );
    }

    const tSpots = Number(totalSpots);
    const oSpots = Number(openSpots);
    if (isNaN(tSpots) || isNaN(oSpots) || oSpots <= 0 || oSpots > tSpots) {
      return NextResponse.json(
        { error: { code: "INVALID_SPOTS", message: "Open spots must be at least 1 and cannot exceed total spots." } },
        { status: 400 }
      );
    }

    const cost = Number(costPerPlayer);
    if (isNaN(cost) || cost < 0) {
      return NextResponse.json(
        { error: { code: "INVALID_COST", message: "Cost per player cannot be negative." } },
        { status: 400 }
      );
    }

    const turf = await prisma.turf.findUnique({
      where: { id: turfId },
    });

    if (!turf) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Target turf venue not found." } },
        { status: 404 }
      );
    }

    const matchPost = await prisma.matchPost.create({
      data: {
        hostUserId: currentUser.id,
        turfId,
        title,
        description: description || "Casual friendly match. Looking for reliable squad members.",
        sportFormat,
        matchTime: mDate,
        area: area || `${turf.area}, ${turf.city}`,
        totalSpots: tSpots,
        openSpots: oSpots,
        costPerPlayer: cost,
        requiredRole,
        status: "OPEN",
      },
      include: {
        turf: true,
        hostUser: true,
      },
    });

    return NextResponse.json(
      { data: matchPost, message: "Match recruitment post created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating match post:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to create match post." } },
      { status: 500 }
    );
  }
}
