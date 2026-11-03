import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Administrator access required." } },
        { status: 403 }
      );
    }

    let payouts: any[] = [];
    try {
      if ((prisma as any).payoutRequest) {
        payouts = await (prisma as any).payoutRequest.findMany({
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      } else {
        throw new Error("Client model not cached");
      }
    } catch {
      try {
        payouts = await prisma.$queryRawUnsafe(`
          SELECT p.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'phone', u.phone) as owner
          FROM "PayoutRequest" p
          JOIN "User" u ON p."ownerId" = u.id
          ORDER BY p."createdAt" DESC
        `);
      } catch {
        payouts = [];
      }
    }

    return NextResponse.json({ data: payouts });
  } catch (error) {
    console.error("Error fetching admin payouts:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch payout requests." } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Administrator access required." } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { payoutId, action, transactionRef, adminNotes } = body;

    if (!payoutId || !action) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "payoutId and action are required." } },
        { status: 400 }
      );
    }

    const newStatus = action === "APPROVE" ? "DISBURSED" : "REJECTED";
    let existing: any;
    try {
      if ((prisma as any).payoutRequest) {
        existing = await (prisma as any).payoutRequest.findUnique({
          where: { id: payoutId },
        });
      }
    } catch {
      // fallback to raw
    }

    if (!existing) {
      try {
        const rows: any[] = (await prisma.$queryRawUnsafe(
          `SELECT * FROM "PayoutRequest" WHERE "id" = '${payoutId}' LIMIT 1`
        )) as any[];
        existing = rows[0];
      } catch {
        // ignore
      }
    }

    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Payout request not found." } },
        { status: 404 }
      );
    }

    let updated: any;

    try {
      if ((prisma as any).payoutRequest) {
        updated = await (prisma as any).payoutRequest.update({
          where: { id: payoutId },
          data: {
            status: newStatus,
            transactionRef: transactionRef?.trim() || null,
            adminNotes: adminNotes?.trim() || null,
            processedAt: new Date(),
          },
          include: {
            owner: {
              select: { name: true, email: true },
            },
          },
        });
      } else {
        throw new Error("Client model not cached");
      }
    } catch {
      await prisma.$executeRawUnsafe(
        `UPDATE "PayoutRequest" SET "status" = $1, "transactionRef" = $2, "adminNotes" = $3, "processedAt" = NOW() WHERE "id" = $4`,
        newStatus,
        transactionRef?.trim() || null,
        adminNotes?.trim() || null,
        payoutId
      );
      updated = { id: payoutId, status: newStatus, transactionRef, adminNotes };
    }

    return NextResponse.json({
      data: updated,
      message:
        action === "APPROVE"
          ? `Payout of ৳${existing.amount} disbursed successfully to ${existing.accountNumber} (${existing.method}).`
          : `Payout of ৳${existing.amount} was rejected.`,
    });
  } catch (error) {
    console.error("Error updating payout request:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update payout request." } },
      { status: 500 }
    );
  }
}
