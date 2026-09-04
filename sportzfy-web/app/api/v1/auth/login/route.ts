import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { encodeSession, SESSION_COOKIE_NAME, SessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, requestedRole } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Email and password are required." } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } },
        { status: 401 }
      );
    }

    // Verify user password using bcrypt or constant-time comparison
    let isValidPassword = false;
    let shouldMigrateToHash = false;

    if (user.password) {
      const isBcryptHash = user.password.startsWith("$2a$") || user.password.startsWith("$2b$");
      if (isBcryptHash) {
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        // Legacy plaintext verification using constant-time comparison (timing attack defense)
        const userPassBuf = Buffer.from(user.password);
        const inputPassBuf = Buffer.from(password);
        if (
          userPassBuf.length === inputPassBuf.length &&
          crypto.timingSafeEqual(userPassBuf, inputPassBuf)
        ) {
          isValidPassword = true;
          shouldMigrateToHash = true;
        }
      }
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } },
        { status: 401 }
      );
    }

    // Auto-migrate legacy plaintext password to bcrypt hash on successful login
    if (shouldMigrateToHash) {
      const newHash = await bcrypt.hash(password, 10);
      await prisma.user
        .update({
          where: { id: user.id },
          data: { password: newHash },
        })
        .catch((err) => console.error("Failed to auto-migrate password hash:", err));
    }

    // Role validation: if requestedRole is provided, verify user has authorization
    if (requestedRole) {
      if (requestedRole === "ADMIN" && user.role !== "ADMIN") {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Access denied. This account does not have Admin privileges." } },
          { status: 403 }
        );
      }
      if (requestedRole === "OWNER" && user.role !== "OWNER" && user.role !== "ADMIN") {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Access denied. This account does not have Turf Owner privileges." } },
          { status: 403 }
        );
      }
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as SessionUser["role"],
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    };

    const token = encodeSession(sessionUser);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      data: { user: sessionUser },
      message: `Welcome back, ${user.name}! Logged in as ${user.role}.`,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to authenticate." } },
      { status: 500 }
    );
  }
}
