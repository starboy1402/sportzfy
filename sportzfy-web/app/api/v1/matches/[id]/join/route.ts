import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { preferredRole = "Goalkeeper" } = body;

    const match = await prisma.matchPost.findUnique({
      where: { id },
    });

    if (!match) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Match not found." } },
        { status: 404 }
      );
    }

    if (match.status !== "OPEN" || match.openSpots <= 0) {
      return NextResponse.json(
        { error: { code: "MATCH_FULL", message: "This match roster is already full." } },
        { status: 400 }
      );
    }

    // Require authenticated player
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Please log in to submit a squad join request." } },
        { status: 401 }
      );
    }

    // Prevent match host from requesting to join their own match
    if (match.hostUserId === currentUser.id) {
      return NextResponse.json(
        { error: { code: "HOST_CANNOT_JOIN", message: "You are the captain of this match and already in the squad." } },
        { status: 400 }
      );
    }

    const player = await prisma.user.findUnique({ where: { id: currentUser.id } });
    if (!player) {
      return NextResponse.json(
        { error: { code: "USER_NOT_FOUND", message: "User account not found." } },
        { status: 404 }
      );
    }

    // Check duplicate request
    const existing = await prisma.joinRequest.findUnique({
      where: {
        matchPostId_userId: {
          matchPostId: id,
          userId: player.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: { code: "ALREADY_REQUESTED", message: "You have already submitted a join request for this match." } },
        { status: 409 }
      );
    }

    const joinRequest = await prisma.joinRequest.create({
      data: {
        matchPostId: id,
        userId: player.id,
        preferredRole,
        status: "PENDING",
      },
      include: {
        user: {
          select: { name: true, phone: true },
        },
      },
    });

    return NextResponse.json(
      {
        data: joinRequest,
        message: "Your join request has been sent to the captain!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Join request error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to submit join request." } },
      { status: 500 }
    );
  }
}
