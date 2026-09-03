import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await prisma.matchPost.findUnique({
      where: { id },
      include: {
        turf: true,
        hostUser: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            phone: true,
          },
        },
        joinRequests: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                phone: true,
                profile: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Match post not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: match });
  } catch (error) {
    console.error("Error fetching match detail:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch match details." } },
      { status: 500 }
    );
  }
}
