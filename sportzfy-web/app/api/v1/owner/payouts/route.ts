import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Owner or administrator access required." } },
        { status: 403 }
      );
    }

    // 1. Get all turfs owned by this user
    const ownerTurfs = await prisma.turf.findMany({
      where: currentUser.role === "ADMIN" ? {} : { ownerId: currentUser.id },
      select: { id: true, name: true },
    });

    const turfIds = ownerTurfs.map((t) => t.id);

    // 2. Compute gross revenue from confirmed bookings
    const bookings = await prisma.booking.findMany({
      where: {
        turfId: { in: turfIds },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      select: { totalAmount: true },
    });

    const grossRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const platformCommissionRate = 0.05; // 5% platform fee
    const platformFee = Math.round(grossRevenue * platformCommissionRate);
    const netRevenue = grossRevenue - platformFee;

    // 3. Fetch payout history for this owner
    let payoutHistory: any[] = [];
    try {
      if ((prisma as any).payoutRequest) {
        payoutHistory = await (prisma as any).payoutRequest.findMany({
          where: currentUser.role === "ADMIN" ? {} : { ownerId: currentUser.id },
          orderBy: { createdAt: "desc" },
        });
      } else {
        throw new Error("Client model not cached");
      }
    } catch {
      try {
        payoutHistory = (await prisma.$queryRawUnsafe(
          `SELECT * FROM "PayoutRequest" ${currentUser.role === "ADMIN" ? "" : `WHERE "ownerId" = '${currentUser.id}'`} ORDER BY "createdAt" DESC`
        )) as any[];
      } catch {
        payoutHistory = [];
      }
    }

    const disbursedAmount = payoutHistory
      .filter((p: any) => p.status === "DISBURSED")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const pendingAmount = payoutHistory
      .filter((p: any) => p.status === "PENDING")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const availableBalance = Math.max(0, netRevenue - disbursedAmount - pendingAmount);

    return NextResponse.json({
      data: {
        financialSummary: {
          grossRevenue,
          platformFee,
          netRevenue,
          disbursedAmount,
          pendingAmount,
          availableBalance,
        },
        payoutHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching owner payouts:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch payout records." } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only registered turf owners can request payouts." } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, method, accountNumber, accountHolder } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 500) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Minimum withdrawal amount is ৳500." } },
        { status: 400 }
      );
    }

    if (!accountNumber || accountNumber.trim().length < 8) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Please provide a valid account or wallet number." } },
        { status: 400 }
      );
    }

    const validMethods = ["BKASH", "NAGAD", "BANK_TRANSFER"];
    const payoutMethod = validMethods.includes(method) ? method : "BKASH";

    // Compute available balance
    const ownerTurfs = await prisma.turf.findMany({
      where: { ownerId: currentUser.id },
      select: { id: true },
    });
    const turfIds = ownerTurfs.map((t) => t.id);

    const bookings = await prisma.booking.findMany({
      where: {
        turfId: { in: turfIds },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      select: { totalAmount: true },
    });

    const grossRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const platformFee = Math.round(grossRevenue * 0.05);
    const netRevenue = grossRevenue - platformFee;

    let payoutHistory: any[] = [];
    try {
      payoutHistory = await (prisma as any).payoutRequest.findMany({
        where: { ownerId: currentUser.id },
      });
    } catch {
      payoutHistory = [];
    }

    const disbursedAmount = payoutHistory
      .filter((p: any) => p.status === "DISBURSED")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const pendingAmount = payoutHistory
      .filter((p: any) => p.status === "PENDING")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const availableBalance = Math.max(0, netRevenue - disbursedAmount - pendingAmount);

    if (numAmount > availableBalance) {
      return NextResponse.json(
        {
          error: {
            code: "INSUFFICIENT_BALANCE",
            message: `Requested amount (৳${numAmount}) exceeds available balance (৳${availableBalance}).`,
          },
        },
        { status: 400 }
      );
    }

    // Create PayoutRequest with fallback resilience
    let newPayout: any;
    try {
      if ((prisma as any).payoutRequest) {
        newPayout = await (prisma as any).payoutRequest.create({
          data: {
            ownerId: currentUser.id,
            amount: numAmount,
            method: payoutMethod,
            accountNumber: accountNumber.trim(),
            accountHolder: accountHolder?.trim() || currentUser.name,
            status: "PENDING",
          },
        });
      } else {
        throw new Error("Client model not cached");
      }
    } catch {
      const newId = `cmu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "PayoutRequest" ("id", "ownerId", "amount", "method", "accountNumber", "accountHolder", "status", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        newId,
        currentUser.id,
        numAmount,
        payoutMethod,
        accountNumber.trim(),
        accountHolder?.trim() || currentUser.name,
        "PENDING"
      );
      newPayout = {
        id: newId,
        ownerId: currentUser.id,
        amount: numAmount,
        method: payoutMethod,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder?.trim() || currentUser.name,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json(
      {
        data: newPayout,
        message: "Payout request submitted successfully. Processing time is usually 2-6 hours.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payout request:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to submit payout request." } },
      { status: 500 }
    );
  }
}
