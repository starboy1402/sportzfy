export interface EdgeSessionUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "OWNER" | "ADMIN";
}

const SESSION_SECRET = process.env.SESSION_SECRET || "sportzfy_super_secret_hmac_key_chattogram_2026";

/**
 * Edge-compatible cryptographic session verification using Web Crypto API
 */
export async function verifyEdgeSession(token: string): Promise<EdgeSessionUser | null> {
  try {
    if (!token || typeof token !== "string" || !token.includes(".")) {
      return null;
    }

    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadBase64));
    const hexBytes = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hexBytes !== signature) {
      return null;
    }

    // Decode Base64 in Edge (atob)
    const rawJson = atob(payloadBase64);
    const parsed = JSON.parse(rawJson);
    if (!parsed.id || !parsed.email || !parsed.role) return null;

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}
