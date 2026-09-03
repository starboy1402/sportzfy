import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const turf = await prisma.turf.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        images: { orderBy: { order: "asc" } },
        reviews: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!turf) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Turf not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: turf });
  } catch (error) {
    console.error("Error fetching turf details:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch turf details" } },
      { status: 500 }
    );
  }
}
