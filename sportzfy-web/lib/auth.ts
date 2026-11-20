import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";

import {
  SessionUser,
  SESSION_COOKIE_NAME,
  encodeSession,
  decodeSession,
} from "./session-token";

export type { SessionUser };
export { SESSION_COOKIE_NAME, encodeSession, decodeSession };

// Server helper to get current logged-in user from headers (Bearer) or cookies
export async function getCurrentUser(): Promise<SessionUser | null> {
  let sessionToken: string | undefined;

  // 1. Support Authorization: Bearer <token> header (Mobile & API clients)
  try {
    const headerList = await headers();
    const authHeader = headerList.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      sessionToken = authHeader.substring(7).trim();
    }
  } catch {
    // headers() might fail in unsupported contexts
  }

  // 2. Fall back to HTTP-only cookie (Web clients)
  if (!sessionToken) {
    try {
      const cookieStore = await cookies();
      sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // cookies() might fail in unsupported contexts
    }
  }

  if (!sessionToken) return null;

  const decoded = decodeSession(sessionToken);
  if (!decoded) return null;

  // Verify in database to ensure account is active and role is fresh
  const dbUser = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      avatarUrl: true,
    },
  });

  if (!dbUser) return null;

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as SessionUser["role"],
    phone: dbUser.phone,
    avatarUrl: dbUser.avatarUrl,
  };
}
