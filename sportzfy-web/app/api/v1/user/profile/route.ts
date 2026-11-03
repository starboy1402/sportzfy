import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getCurrentUser,
  encodeSession,
  SESSION_COOKIE_NAME,
  SessionUser,
} from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Please sign in to view your profile." } },
        { status: 401 }
      );
    }

    const userWithProfile = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        profile: true,
        _count: {
          select: {
            bookings: true,
            matchPosts: true,
            reviews: true,
            turfs: true,
          },
        },
      },
    });

    if (!userWithProfile) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User account not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: userWithProfile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch user profile." } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Please sign in to update your profile." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      phone,
      avatarUrl,
      bio,
      preferredFormat,
      favoritePosition,
      preferredCity,
    } = body;

    if (name !== undefined && (!name.trim() || name.trim().length < 2)) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Full Name must be at least 2 characters." } },
        { status: 400 }
      );
    }

    // 1. Update User Table
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl?.trim() || null }),
      },
    });

    // 2. Upsert Profile Table
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: currentUser.id },
      create: {
        userId: currentUser.id,
        bio: bio?.trim() || null,
        preferredFormat: preferredFormat || "7v7",
        favoritePosition: favoritePosition || "Goalkeeper",
        preferredCity: preferredCity || "Chattogram",
      },
      update: {
        ...(bio !== undefined && { bio: bio?.trim() || null }),
        ...(preferredFormat !== undefined && { preferredFormat }),
        ...(favoritePosition !== undefined && { favoritePosition }),
        ...(preferredCity !== undefined && { preferredCity }),
      },
    });

    // 3. Re-encode and refresh session cookie
    const updatedSessionUser: SessionUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as SessionUser["role"],
      phone: updatedUser.phone,
      avatarUrl: updatedUser.avatarUrl,
    };

    const newSessionToken = encodeSession(updatedSessionUser);

    const response = NextResponse.json({
      data: {
        user: updatedUser,
        profile: updatedProfile,
      },
      message: "Profile updated successfully.",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: newSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update profile." } },
      { status: 500 }
    );
  }
}
