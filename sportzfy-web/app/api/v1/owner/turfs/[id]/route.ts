import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
        availabilityRules: true,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.turf.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.city && { city: body.city }),
        ...(body.area && { area: body.area }),
        ...(body.address && { address: body.address }),
        ...(body.description && { description: body.description }),
        ...(body.pitchFormats && { pitchFormats: body.pitchFormats }),
        ...(body.basePricePerHour !== undefined && { basePricePerHour: Number(body.basePricePerHour) }),
        ...(body.coverImage && { coverImage: body.coverImage }),
        ...(body.hasFloodlights !== undefined && { hasFloodlights: Boolean(body.hasFloodlights) }),
        ...(body.hasParking !== undefined && { hasParking: Boolean(body.hasParking) }),
        ...(body.hasWashroom !== undefined && { hasWashroom: Boolean(body.hasWashroom) }),
        ...(body.hasChangingRoom !== undefined && { hasChangingRoom: Boolean(body.hasChangingRoom) }),
        ...(body.hasWater !== undefined && { hasWater: Boolean(body.hasWater) }),
      },
    });

    return NextResponse.json({ data: updated, message: "Venue updated successfully." });
  } catch (error) {
    console.error("Error updating turf:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update venue." } },
      { status: 500 }
    );
  }
}
