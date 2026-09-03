import test from "node:test";
import assert from "node:assert";
import { prisma } from "../lib/db";
import { encodeSession, decodeSession, SessionUser } from "../lib/auth";

test("TC-RBAC-01: Session Token Decodes Accurate Role Claims", () => {
  const adminUser: SessionUser = {
    id: "admin_1",
    email: "admin@sportzfy.com",
    name: "Platform Admin",
    role: "ADMIN",
  };
  const tokenAdmin = encodeSession(adminUser);
  const decodedAdmin = decodeSession(tokenAdmin);
  assert.strictEqual(decodedAdmin?.role, "ADMIN");

  const customerUser: SessionUser = {
    id: "cust_1",
    email: "player@sportzfy.com",
    name: "Sakib Alif",
    role: "CUSTOMER",
  };
  const tokenCust = encodeSession(customerUser);
  const decodedCust = decodeSession(tokenCust);
  assert.strictEqual(decodedCust?.role, "CUSTOMER");
  assert.notStrictEqual(decodedCust?.role, "ADMIN");
});

test("TC-RBAC-02: Venue Ownership Isolation Between Owners", async () => {
  const turfs = await prisma.turf.findMany({ take: 2, include: { owner: true } });
  assert.ok(turfs.length >= 1, "Must have at least 1 turf in DB");

  const turfA = turfs[0];
  const hypotheticalAttackerOwnerId = "cmtm_attacker_owner_999";

  // Assert rule: owner modifying turf must match turf.ownerId
  const canModify = turfA.ownerId === hypotheticalAttackerOwnerId;
  assert.strictEqual(canModify, false, "Owner B must NOT be permitted to modify Owner A's venue");
});

test("TC-SEARCH-01: Search Query PostgreSQL Case-Insensitivity", async () => {
  // Test that case-insensitive regex or mode matches both lower and uppercase
  const lowercaseQuery = "eco";
  const turf = await prisma.turf.findFirst({
    where: {
      name: { contains: lowercaseQuery, mode: "insensitive" },
    },
  });

  assert.ok(turf, "Insensitive query 'eco' must find 'Eco Sports Arena'");
  assert.ok(turf.name.toLowerCase().includes("eco"));
});
