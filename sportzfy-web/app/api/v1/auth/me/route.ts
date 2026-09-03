import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({
      data: { user },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to retrieve session." } },
      { status: 500 }
    );
  }
}
