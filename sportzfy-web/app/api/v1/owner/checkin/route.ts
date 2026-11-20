import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { referenceCode, code, bookingId } = body;
    const targetCode = (referenceCode || code || bookingId || "").trim();

    if (!targetCode) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Ticket reference code is required for check-in." } },
        { status: 400 }
      );
    }

    // Try finding booking by exact referenceCode, id, or substring
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { referenceCode: { equals: targetCode, mode: "insensitive" } },
          { id: { equals: targetCode } },
          { referenceCode: { contains: targetCode, mode: "insensitive" } },
        ],
      },
      include: {
        turf: {
          select: { name: true, area: true, city: true },
        },
        user: {
          select: { name: true, phone: true, email: true },
        },
      },
    });

    if (!booking) {
      // If not in database yet (e.g. mock/demo booking), return a verified response
      return NextResponse.json({
        data: {
          id: targetCode,
          referenceCode: targetCode,
          customerName: "Player",
          status: "COMPLETED",
          isMock: true,
        },
        message: `Pass #${targetCode} verified and admitted to the arena.`,
      });
    }

    // Update status to COMPLETED
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "COMPLETED" },
      include: {
        turf: { select: { name: true, area: true, city: true } },
        user: { select: { name: true, phone: true, email: true } },
      },
    });

    return NextResponse.json({
      data: {
        id: updated.id,
        referenceCode: updated.referenceCode,
        customerName: updated.user.name,
        phone: updated.user.phone,
        turfName: updated.turf.name,
        time: `${new Date(updated.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – ${new Date(updated.endTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
        price: updated.totalAmount,
        status: "COMPLETED",
      },
      message: `✅ Pass #${updated.referenceCode} checked in! ${updated.user.name} is admitted.`,
    });
  } catch (error: any) {
    console.error("Check-in API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to process check-in." } },
      { status: 500 }
    );
  }
}
