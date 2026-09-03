import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Platform administrator access required." } },
        { status: 403 }
      );
    }
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || (status !== "APPROVED" && status !== "REJECTED" && status !== "PENDING_REVIEW")) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Invalid approval status." } },
        { status: 400 }
      );
    }

    const updatedTurf = await prisma.turf.update({
      where: { id },
      data: { status },
      include: { owner: true },
    });

    return NextResponse.json({
      data: updatedTurf,
      message: `Venue '${updatedTurf.name}' status has been set to ${status}.`,
    });
  } catch (error) {
    console.error("Turf review error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update venue status." } },
      { status: 500 }
    );
  }
}
