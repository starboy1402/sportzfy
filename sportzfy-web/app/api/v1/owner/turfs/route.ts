import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const owner = await prisma.user.findFirst({
      where: { role: "OWNER" },
    });

    if (!owner) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Owner profile not found." } },
        { status: 404 }
      );
    }

    const turfs = await prisma.turf.findMany({
      where: { ownerId: owner.id },
      include: {
        bookings: { select: { id: true, totalAmount: true } },
        blockedIntervals: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: turfs });
  } catch (error) {
    console.error("Error fetching owner turfs:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch owner venues." } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      city,
      area,
      address,
      description,
      pitchFormats,
      basePricePerHour,
      coverImage,
      hasFloodlights = true,
      hasParking = true,
      hasWashroom = true,
      hasChangingRoom = true,
      hasWater = true,
    } = body;

    if (!name || !city || !area || !basePricePerHour) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing required venue information." } },
        { status: 400 }
      );
    }

    let owner = await prisma.user.findFirst({
      where: { role: "OWNER" },
    });

    if (!owner) {
      owner = await prisma.user.create({
        data: {
          email: "owner@sportzfy.com",
          name: "Tariqul Islam (Eco Sports)",
          role: "OWNER",
        },
      });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newTurf = await prisma.turf.create({
      data: {
        ownerId: owner.id,
        name,
        slug,
        city,
        area,
        address: address || `${area}, ${city}`,
        description: description || "Modern artificial grass football and cricket pitch with floodlights.",
        pitchFormats: pitchFormats || "6v6, 7v7",
        basePricePerHour: Number(basePricePerHour),
        coverImage: coverImage || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80",
        hasFloodlights: Boolean(hasFloodlights),
        hasParking: Boolean(hasParking),
        hasWashroom: Boolean(hasWashroom),
        hasChangingRoom: Boolean(hasChangingRoom),
        hasWater: Boolean(hasWater),
        status: "APPROVED", // Approved for immediate demonstration
      },
    });

    return NextResponse.json(
      { data: newTurf, message: "Venue listing created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating turf listing:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to create venue listing." } },
      { status: 500 }
    );
  }
}
