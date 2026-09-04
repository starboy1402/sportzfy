import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required to manage squad." } },
        { status: 401 }
      );
    }

    const { id, requestId } = await params;
    const body = await request.json();
    const { decision } = body; // "ACCEPTED" | "REJECTED"

    if (!decision || (decision !== "ACCEPTED" && decision !== "REJECTED")) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Decision must be ACCEPTED or REJECTED." } },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const joinReq = await tx.joinRequest.findUnique({
        where: { id: requestId },
        include: { matchPost: true, user: true },
      });

      if (!joinReq) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      // Security: Ensure join request actually belongs to the match specified in the URL
      if (joinReq.matchPostId !== id) {
        throw new Error("MISMATCHED_MATCH_ID");
      }

      // Security: Only the match host or admin can make roster decisions
      if (joinReq.matchPost.hostUserId !== currentUser.id && currentUser.role !== "ADMIN") {
        throw new Error("FORBIDDEN_HOST_ONLY");
      }

      // If already decided as requested, return existing state (idempotency)
      if (joinReq.status === decision) {
        return joinReq;
      }

      if (decision === "ACCEPTED" && joinReq.matchPost.openSpots <= 0) {
        throw new Error("MATCH_FULL");
      }

      // Update request status
      const updatedReq = await tx.joinRequest.update({
        where: { id: requestId },
        data: { status: decision },
        include: { user: { select: { name: true, phone: true } } },
      });

      // If newly accepted (from PENDING or REJECTED), decrement open spots atomically
      if (decision === "ACCEPTED" && joinReq.status !== "ACCEPTED") {
        const newOpenSpots = Math.max(0, joinReq.matchPost.openSpots - 1);
        await tx.matchPost.update({
          where: { id: joinReq.matchPostId },
          data: {
            openSpots: newOpenSpots,
            ...(newOpenSpots === 0 && { status: "FULL" }),
          },
        });
      }

      // If an ACCEPTED player is removed/rejected, restore open spot and reopen match
      if (decision === "REJECTED" && joinReq.status === "ACCEPTED") {
        const newOpenSpots = Math.min(joinReq.matchPost.totalSpots, joinReq.matchPost.openSpots + 1);
        await tx.matchPost.update({
          where: { id: joinReq.matchPostId },
          data: {
            openSpots: newOpenSpots,
            status: "OPEN",
          },
        });
      }

      return updatedReq;
    });

    return NextResponse.json({
      data: result,
      message:
        decision === "ACCEPTED"
          ? "Player added to squad! Open spots updated."
          : "Player removed from squad and open slot restored.",
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === "REQUEST_NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Join request not found." } },
        { status: 404 }
      );
    }
    if (err.message === "MISMATCHED_MATCH_ID") {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "This join request does not belong to the specified match." } },
        { status: 400 }
      );
    }
    if (err.message === "MATCH_FULL") {
      return NextResponse.json(
        { error: { code: "MATCH_FULL", message: "Match roster is already full." } },
        { status: 400 }
      );
    }
    if (err.message === "FORBIDDEN_HOST_ONLY") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only the match captain or platform administrator can manage squad requests." } },
        { status: 403 }
      );
    }

    console.error("Decision error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to process roster decision." } },
      { status: 500 }
    );
  }
}
