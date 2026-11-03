import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const turf = await prisma.turf.findUnique({
      where: { id },
      include: {
        images: true,
        availabilityRules: {
          orderBy: { dayOfWeek: "asc" },
        },
        blockedIntervals: true,
      },
    });

    if (!turf) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Venue not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: turf });
  } catch (error) {
    console.error("Error fetching turf:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch venue." } },
      { status: 500 }
    );
  }
}

async function handleUpdateTurf(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Owner or administrator access required." } },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify ownership
    const existingTurf = await prisma.turf.findUnique({
      where: { id },
      select: { id: true, ownerId: true, basePricePerHour: true },
    });

    if (!existingTurf) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Venue not found." } },
        { status: 404 }
      );
    }

    if (currentUser.role === "OWNER" && existingTurf.ownerId !== currentUser.id) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You do not have permission to edit another owner's venue." } },
        { status: 403 }
      );
    }

    const body = await request.json();

    const priceChanged =
      body.basePricePerHour !== undefined &&
      Number(body.basePricePerHour) !== existingTurf.basePricePerHour;

    const newBasePrice =
      body.basePricePerHour !== undefined ? Number(body.basePricePerHour) : undefined;

    const updated = await prisma.turf.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.city && { city: body.city }),
        ...(body.area && { area: body.area }),
        ...(body.address && { address: body.address }),
        ...(body.description && { description: body.description }),
        ...(body.pitchFormats && { pitchFormats: body.pitchFormats }),
        ...(newBasePrice !== undefined && { basePricePerHour: newBasePrice }),
        ...(body.coverImage && { coverImage: body.coverImage }),
        ...(body.hasFloodlights !== undefined && { hasFloodlights: Boolean(body.hasFloodlights) }),
        ...(body.hasParking !== undefined && { hasParking: Boolean(body.hasParking) }),
        ...(body.hasWashroom !== undefined && { hasWashroom: Boolean(body.hasWashroom) }),
        ...(body.hasChangingRoom !== undefined && { hasChangingRoom: Boolean(body.hasChangingRoom) }),
        ...(body.hasWater !== undefined && { hasWater: Boolean(body.hasWater) }),
      },
      include: {
        images: true,
        availabilityRules: true,
      },
    });

    // If base price changed, synchronize availability rules for this turf
    if (priceChanged && newBasePrice !== undefined) {
      await prisma.availabilityRule.updateMany({
        where: { turfId: id },
        data: { hourlyRate: newBasePrice },
      });
    }

    // If coverImage updated, update or insert the primary TurfImage
    if (body.coverImage) {
      const firstImage = await prisma.turfImage.findFirst({
        where: { turfId: id, order: 0 },
      });

      if (firstImage) {
        await prisma.turfImage.update({
          where: { id: firstImage.id },
          data: { url: body.coverImage },
        });
      } else {
        await prisma.turfImage.create({
          data: {
            turfId: id,
            url: body.coverImage,
            caption: "Main Pitch View",
            order: 0,
          },
        });
      }
    }

    return NextResponse.json({
      data: updated,
      message: "Venue and slot rates updated successfully.",
    });
  } catch (error) {
    console.error("Error updating turf:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update venue." } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdateTurf(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdateTurf(request, params);
}
