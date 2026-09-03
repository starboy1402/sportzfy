import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    // Identify or create joining player (Ayan Barua or Mahmudul Hasan from team)
    let player = await prisma.user.findFirst({
      where: { email: "ayan@sportzfy.com" },
    });

    if (!player) {
      player = await prisma.user.create({
        data: {
          email: "ayan@sportzfy.com",
          name: "Ayan Barua",
          phone: "+8801700998877",
          role: "CUSTOMER",
          profile: {
            create: {
              bio: "Reliable goalkeeper with 3 years turf experience. Quick reflexes.",
              favoritePosition: "Goalkeeper",
              preferredCity: "Chattogram",
            },
          },
        },
      });
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
