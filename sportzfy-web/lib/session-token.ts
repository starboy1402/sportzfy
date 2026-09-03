import crypto from "crypto";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "OWNER" | "ADMIN";
  phone?: string | null;
  avatarUrl?: string | null;
}

export const SESSION_COOKIE_NAME = "sportzfy_session";

const SESSION_SECRET = process.env.SESSION_SECRET || "sportzfy_super_secret_hmac_key_chattogram_2026";

// Encode user payload into a cryptographically signed HMAC token
export function encodeSession(user: SessionUser): string {
  const payload = {
    ...user,
    timestamp: Date.now(),
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadBase64)
    .digest("hex");
  return `${payloadBase64}.${signature}`;
}

// Decode and cryptographically verify session token
export function decodeSession(token: string): SessionUser | null {
  try {
    if (!token || typeof token !== "string" || !token.includes(".")) {
      return null;
    }

    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    // Verify cryptographic signature
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadBase64)
      .digest("hex");

    if (signature !== expectedSignature) {
      return null;
    }

    const raw = Buffer.from(payloadBase64, "base64").toString("utf-8");
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
