import test from "node:test";
import assert from "node:assert";
import { encodeSession, decodeSession, SessionUser } from "../lib/auth";

test("TC-AUTH-01: Session encodes and decodes accurately for authenticated user", () => {
  const user: SessionUser = {
    id: "user_test_123",
    email: "player@sportzfy.com",
    name: "Sakib Alif",
    role: "CUSTOMER",
    phone: "+8801700112233",
  };

  const token = encodeSession(user);
  assert.ok(token, "Token should be generated");
  assert.ok(token.includes("."), "Signed token should contain payload and HMAC signature separated by a dot");

  const decoded = decodeSession(token);
  assert.ok(decoded, "Decoded session must exist");
  assert.strictEqual(decoded.id, user.id);
  assert.strictEqual(decoded.email, user.email);
  assert.strictEqual(decoded.role, user.role);
});

test("TC-AUTH-02: Tampered payload fails signature verification (Anti-forgery)", () => {
  const legitimateUser: SessionUser = {
    id: "user_regular_456",
    email: "regular@sportzfy.com",
    name: "Regular Player",
    role: "CUSTOMER",
  };

  const token = encodeSession(legitimateUser);
  const [payloadBase64, signature] = token.split(".");

  // Attacker attempts privilege escalation by modifying role to ADMIN in payload
  const rawPayload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
  rawPayload.role = "ADMIN";
  const forgedPayloadBase64 = Buffer.from(JSON.stringify(rawPayload)).toString("base64");

  const forgedToken = `${forgedPayloadBase64}.${signature}`;

  const decoded = decodeSession(forgedToken);
  assert.strictEqual(decoded, null, "Tampered token must be rejected with null");
});

import { verifyEdgeSession } from "../lib/edge-auth";

test("TC-AUTH-04: Edge Web Crypto verification verifies valid tokens and rejects tampered ones", async () => {
  const user: SessionUser = {
    id: "edge_user_99",
    email: "edge@sportzfy.com",
    name: "Edge Tester",
    role: "OWNER",
  };

  const token = encodeSession(user);
  const edgeDecoded = await verifyEdgeSession(token);
  assert.ok(edgeDecoded, "Edge session verification must succeed");
  assert.strictEqual(edgeDecoded.id, user.id);
  assert.strictEqual(edgeDecoded.role, "OWNER");

  // Tampered token test in Edge
  const [payloadBase64, signature] = token.split(".");
  const raw = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
  raw.role = "ADMIN";
  const forgedBase64 = Buffer.from(JSON.stringify(raw)).toString("base64");
  const forgedToken = `${forgedBase64}.${signature}`;

  const forgedDecoded = await verifyEdgeSession(forgedToken);
  assert.strictEqual(forgedDecoded, null, "Edge verification must reject forged signature");
});

test("TC-AUTH-03: Session token older than 7 days is rejected as expired", async () => {
  const user: SessionUser = {
    id: "user_expired_77",
    email: "expired@sportzfy.com",
    name: "Expired User",
    role: "CUSTOMER",
  };

  // Create token with timestamp 8 days ago
  const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
  const payload = {
    ...user,
    timestamp: eightDaysAgo,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const crypto = await import("crypto");
  const secret = process.env.SESSION_SECRET || "sportzfy_dev_fallback_secret_chattogram_2026";
  const signature = crypto.default
    .createHmac("sha256", secret)
    .update(payloadBase64)
    .digest("hex");
  const expiredToken = `${payloadBase64}.${signature}`;

  const decodedNode = decodeSession(expiredToken);
  assert.strictEqual(decodedNode, null, "Node decodeSession must reject tokens older than 7 days");

  const decodedEdge = await verifyEdgeSession(expiredToken);
  assert.strictEqual(decodedEdge, null, "Edge verifyEdgeSession must reject tokens older than 7 days");
});

import bcrypt from "bcryptjs";

test("TC-AUTH-05: Bcrypt password hashing and verification", async () => {
  const plainPassword = "strongPassword#2026";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  assert.ok(hashedPassword.startsWith("$2a$") || hashedPassword.startsWith("$2b$"), "Must be a valid bcrypt hash");
  assert.notStrictEqual(hashedPassword, plainPassword, "Password must not be stored in plaintext");

  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  assert.strictEqual(isMatch, true, "Bcrypt compare must verify matching password");

  const isWrong = await bcrypt.compare("wrongPassword", hashedPassword);
  assert.strictEqual(isWrong, false, "Bcrypt compare must reject invalid password");
});
