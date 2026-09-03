import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const area = searchParams.get("area");
    const format = searchParams.get("format");
    const query = searchParams.get("q");

    const where: Record<string, unknown> = {
      status: "APPROVED",
    };

    if (city && city !== "All") {
      where.city = city;
    }

    if (area && area !== "All") {
      where.area = area;
    }

    if (format && format !== "All") {
      where.pitchFormats = {
        contains: format,
      };
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { area: { contains: query } },
        { address: { contains: query } },
      ];
    }

    const turfs = await prisma.turf.findMany({
      where,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { rating: "desc" },
    });

    return NextResponse.json({
      data: turfs,
      count: turfs.length,
    });
  } catch (error) {
    console.error("Error fetching turfs:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch turfs" } },
      { status: 500 }
    );
  }
}
