import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    // 1. Matches this user is hosting
    const hosting = await prisma.matchPost.findMany({
      where: { hostUserId: currentUser.id },
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
          select: { id: true, name: true, phone: true },
        },
        joinRequests: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { matchTime: "asc" },
    });

    // 2. Matches this user has requested to join or is accepted in
    const userRequests = await prisma.joinRequest.findMany({
      where: { userId: currentUser.id },
      include: {
        matchPost: {
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
              select: { id: true, name: true, phone: true },
            },
            joinRequests: {
              where: { status: "ACCEPTED" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      data: {
        hosting,
        joined: userRequests.map((r) => ({
          requestId: r.id,
          requestStatus: r.status,
          preferredRole: r.preferredRole,
          appliedAt: r.createdAt,
          match: r.matchPost,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching my matches:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load squad matches." } },
      { status: 500 }
    );
  }
}
