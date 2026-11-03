import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Turf owner or administrator access required." } },
        { status: 403 }
      );
    }

    const where = currentUser.role === "ADMIN" ? {} : { ownerId: currentUser.id };

    const turfs = await prisma.turf.findMany({
      where,
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
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only registered turf owners can list new venues." } },
        { status: 403 }
      );
    }

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

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const finalCover =
      coverImage ||
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80";
    const hourlyRate = Number(basePricePerHour);

    const newTurf = await prisma.turf.create({
      data: {
        ownerId: currentUser.id,
        name,
        slug,
        city,
        area,
        address: address || `${area}, ${city}`,
        description:
          description ||
          "Modern artificial grass football and cricket pitch with floodlights.",
        pitchFormats: pitchFormats || "6v6, 7v7",
        basePricePerHour: hourlyRate,
        coverImage: finalCover,
        hasFloodlights: Boolean(hasFloodlights),
        hasParking: Boolean(hasParking),
        hasWashroom: Boolean(hasWashroom),
        hasChangingRoom: Boolean(hasChangingRoom),
        hasWater: Boolean(hasWater),
        status: "APPROVED", // Approved for immediate demonstration
        images: {
          create: [
            {
              url: finalCover,
              caption: "Main Pitch View",
              order: 0,
            },
          ],
        },
        availabilityRules: {
          create: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
            dayOfWeek,
            openHour: 16, // 4:00 PM BST
            closeHour: 25, // 1:00 AM BST
            hourlyRate,
          })),
        },
      },
      include: {
        images: true,
        availabilityRules: true,
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
