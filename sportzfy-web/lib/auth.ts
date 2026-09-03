import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "OWNER" | "ADMIN";
  phone?: string | null;
  avatarUrl?: string | null;
}

const SESSION_COOKIE_NAME = "sportzfy_session";

// Encode user payload into a secure base64 token
export function encodeSession(user: SessionUser): string {
  const payload = {
    ...user,
    timestamp: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// Decode and verify session token
export function decodeSession(token: string): SessionUser | null {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.id || !parsed.email || !parsed.role) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
      phone: parsed.phone,
      avatarUrl: parsed.avatarUrl,
    };
  } catch {
    return null;
  }
}

// Server helper to get current logged-in user from cookies
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
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

export { SESSION_COOKIE_NAME };
