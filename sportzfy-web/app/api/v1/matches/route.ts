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

export async function POST(request: NextRequest) {
  try {
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

    // Default host user (Sakib Alif or first player)
    let host = await prisma.user.findFirst({
      where: { role: "CUSTOMER" },
    });

    if (!host) {
      host = await prisma.user.create({
        data: {
          email: "player@sportzfy.com",
          name: "Sakib Alif",
          role: "CUSTOMER",
        },
      });
    }

    const turf = await prisma.turf.findUnique({
      where: { id: turfId },
    });

    const matchPost = await prisma.matchPost.create({
      data: {
        hostUserId: host.id,
        turfId,
        title,
        description: description || "Casual friendly match. Looking for reliable squad members.",
        sportFormat,
        matchTime: new Date(matchTime),
        area: area || `${turf?.area || "Chattogram"}, Bangladesh`,
        totalSpots: Number(totalSpots),
        openSpots: Number(openSpots),
        costPerPlayer: Number(costPerPlayer),
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
