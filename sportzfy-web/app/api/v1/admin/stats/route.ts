import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Platform administrator access required." } },
        { status: 403 }
      );
    }
    const totalTurfs = await prisma.turf.count();
    const approvedTurfs = await prisma.turf.count({ where: { status: "APPROVED" } });
    const pendingTurfs = await prisma.turf.count({ where: { status: "PENDING_REVIEW" } });
    const totalUsers = await prisma.user.count();
    const totalMatchPosts = await prisma.matchPost.count();

    const allBookings = await prisma.booking.findMany({
      where: { status: "CONFIRMED" },
      select: { totalAmount: true, createdAt: true },
    });

    const totalGMV = allBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const platformCommission = Math.round(totalGMV * 0.05); // 5% platform take-rate

    // Recent system activities
    const recentBookings = await prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        turf: { select: { name: true, area: true } },
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      data: {
        stats: {
          totalGMV,
          platformCommission,
          totalBookings: allBookings.length,
          totalTurfs,
          approvedTurfs,
          pendingTurfs,
          totalUsers,
          totalMatchPosts,
        },
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch platform metrics." } },
      { status: 500 }
    );
  }
}
