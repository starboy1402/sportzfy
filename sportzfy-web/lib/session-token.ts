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
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY ERROR: SESSION_SECRET environment variable is missing in production.");
    }
    return "sportzfy_dev_fallback_secret_chattogram_2026";
  }
  return secret;
}

// Encode user payload into a cryptographically signed HMAC token
export function encodeSession(user: SessionUser): string {
  const payload = {
    ...user,
    timestamp: Date.now(),
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
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

    // Verify cryptographic signature with constant-time equality
    const expectedSignature = crypto
      .createHmac("sha256", getSessionSecret())
      .update(payloadBase64)
      .digest("hex");

    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      return null;
    }

    const raw = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const parsed = JSON.parse(raw);

    // TTL Expiration Check: Tokens older than 7 days are invalid
    if (
      typeof parsed.timestamp !== "number" ||
      Date.now() - parsed.timestamp > SESSION_MAX_AGE_MS ||
      parsed.timestamp > Date.now() + 60000 // future timestamp guard (clock skew 1m)
    ) {
      return null;
    }

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
