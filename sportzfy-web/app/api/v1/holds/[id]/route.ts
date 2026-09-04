import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hold = await prisma.hold.findUnique({
      where: { id },
      include: {
        turf: {
          select: {
            id: true,
            name: true,
            area: true,
            city: true,
            address: true,
            coverImage: true,
            pitchFormats: true,
          },
        },
      },
    });

    if (!hold) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Hold reservation not found." } },
        { status: 404 }
      );
    }

    const now = new Date();
    const isExpired = hold.expiresAt <= now;
    const remainingSeconds = Math.max(0, Math.floor((hold.expiresAt.getTime() - now.getTime()) / 1000));

    if (isExpired && hold.status === "ACTIVE") {
      await prisma.hold.update({
        where: { id },
        data: { status: "EXPIRED" },
      });
      hold.status = "EXPIRED";
    }

    return NextResponse.json({
      data: {
        ...hold,
        remainingSeconds,
        isExpired,
      },
    });
  } catch (error) {
    console.error("Error inspecting hold:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to inspect hold." } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required to release hold." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const hold = await prisma.hold.findUnique({
      where: { id },
    });

    if (!hold) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Hold reservation not found." } },
        { status: 404 }
      );
    }

    if (hold.userId !== currentUser.id && currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You can only release your own slot holds." } },
        { status: 403 }
      );
    }

    await prisma.hold.updateMany({
      where: { id, status: "ACTIVE" },
      data: { status: "RELEASED" },
    });

    return NextResponse.json({ message: "Hold released successfully." });
  } catch (error) {
    console.error("Error releasing hold:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to release hold." } },
      { status: 500 }
    );
  }
}
