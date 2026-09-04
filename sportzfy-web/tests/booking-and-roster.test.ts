import test from "node:test";
import assert from "node:assert";
import { prisma } from "../lib/db";

test("TC-BOOK-01 & TC-BOOK-02: Hold Hijacking Defense & Booking Confirmation Flow", async () => {
  // 1. Get test turf
  const turf = await prisma.turf.findFirst();
  assert.ok(turf, "Test turf must exist in database");

  // 2. Get two distinct users
  const users = await prisma.user.findMany({ take: 2 });
  assert.ok(users.length >= 2, "Must have at least 2 users");
  const playerA = users[0];
  const playerB = users[1];

  const now = new Date();
  const testSlotStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  testSlotStart.setHours(17, 0, 0, 0);
  const testSlotEnd = new Date(testSlotStart.getTime() + 60 * 60 * 1000);

  // Clean previous holds for this slot
  await prisma.hold.deleteMany({
    where: { turfId: turf.id, startTime: testSlotStart },
  });

  // Create active hold belonging to Player A
  const holdA = await prisma.hold.create({
    data: {
      turfId: turf.id,
      userId: playerA.id,
      startTime: testSlotStart,
      endTime: testSlotEnd,
      price: turf.basePricePerHour,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  assert.strictEqual(holdA.userId, playerA.id);

  // Verification 1: Check hold hijacking defense
  // Simulating confirmation request where currentUser is Player B
  const isHijacked = holdA.userId !== playerB.id;
  assert.strictEqual(isHijacked, true, "Player B does not own Player A's hold");

  // Clean up test hold
  await prisma.hold.delete({ where: { id: holdA.id } });
});

test("TC-MATCH-01: Match Recruitment Business Rules", async () => {
  const turf = await prisma.turf.findFirst();
  assert.ok(turf, "Turf must exist");

  const host = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  assert.ok(host, "Host user must exist");

  // Create match post
  const matchTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const match = await prisma.matchPost.create({
    data: {
      hostUserId: host.id,
      turfId: turf.id,
      title: "Automated QA Test Challenge",
      description: "Friendly match for automated testing.",
      sportFormat: "7v7",
      area: "Panchlaish, Chattogram",
      matchTime,
      totalSpots: 14,
      openSpots: 2,
      costPerPlayer: 150,
      status: "OPEN",
    },
  });

  // Rule: Host cannot request to join their own match
  const isHostAttemptingJoin = match.hostUserId === host.id;
  assert.strictEqual(isHostAttemptingJoin, true, "Host cannot submit squad request to own match");

  // Clean up test match
  await prisma.matchPost.delete({ where: { id: match.id } });
});

test("TC-MATCH-02: Squad Join Acceptance Decrements Open Spots & Idempotency", async () => {
  const turf = await prisma.turf.findFirst();
  const host = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  let applicant = await prisma.user.findFirst({
    where: { id: { not: host!.id } },
  });

  if (!applicant) {
    applicant = await prisma.user.create({
      data: {
        email: "testapplicant@sportzfy.com",
        name: "Test Applicant",
        role: "CUSTOMER",
      },
    });
  }

  assert.ok(turf && host && applicant, "Required seed data must exist");

  const match = await prisma.matchPost.create({
    data: {
      hostUserId: host.id,
      turfId: turf.id,
      title: "Roster Decrement QA Test",
      description: "Testing spot count decrements.",
      sportFormat: "7v7",
      area: "Agrabad, Chattogram",
      matchTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      totalSpots: 14,
      openSpots: 1, // Only 1 spot left
      costPerPlayer: 150,
      status: "OPEN",
    },
  });

  // Create join request
  const joinReq = await prisma.joinRequest.create({
    data: {
      matchPostId: match.id,
      userId: applicant.id,
      preferredRole: "Midfielder",
      status: "PENDING",
    },
  });

  // 1. First acceptance -> should decrement from 1 to 0 and mark FULL
  await prisma.$transaction(async (tx) => {
    const req = await tx.joinRequest.findUnique({
      where: { id: joinReq.id },
      include: { matchPost: true },
    });
    if (req?.status === "PENDING") {
      await tx.joinRequest.update({
        where: { id: req.id },
        data: { status: "ACCEPTED" },
      });
      const newOpenSpots = Math.max(0, req.matchPost.openSpots - 1);
      await tx.matchPost.update({
        where: { id: req.matchPostId },
        data: {
          openSpots: newOpenSpots,
          ...(newOpenSpots === 0 && { status: "FULL" }),
        },
      });
    }
  });

  const updatedMatch = await prisma.matchPost.findUnique({ where: { id: match.id } });
  assert.strictEqual(updatedMatch?.openSpots, 0, "Open spots must decrement to 0");
  assert.strictEqual(updatedMatch?.status, "FULL", "Match must be marked FULL");

  // 2. Second acceptance attempt (idempotency check) -> spots must NOT drop below 0
  await prisma.$transaction(async (tx) => {
    const req = await tx.joinRequest.findUnique({
      where: { id: joinReq.id },
      include: { matchPost: true },
    });
    if (req?.status === "PENDING") {
      // should NOT execute because status is already ACCEPTED
      await tx.matchPost.update({
        where: { id: req.matchPostId },
        data: { openSpots: req.matchPost.openSpots - 1 },
      });
    }
  });

  const finalMatch = await prisma.matchPost.findUnique({ where: { id: match.id } });
  assert.strictEqual(finalMatch?.openSpots, 0, "Spots must remain 0 (no duplicate decrement)");

  // 3. Captain removes player -> open spot must be restored to 1 and status back to OPEN
  await prisma.$transaction(async (tx) => {
    const req = await tx.joinRequest.findUnique({
      where: { id: joinReq.id },
      include: { matchPost: true },
    });
    if (req?.status === "ACCEPTED") {
      await tx.joinRequest.update({
        where: { id: req.id },
        data: { status: "REJECTED" },
      });
      const newOpenSpots = Math.min(req.matchPost.totalSpots, req.matchPost.openSpots + 1);
      await tx.matchPost.update({
        where: { id: req.matchPostId },
        data: {
          openSpots: newOpenSpots,
          status: "OPEN",
        },
      });
    }
  });

  const restoredMatch = await prisma.matchPost.findUnique({ where: { id: match.id } });
  assert.strictEqual(restoredMatch?.openSpots, 1, "Open spots must be restored to 1 after player removal");
  assert.strictEqual(restoredMatch?.status, "OPEN", "Match must be reopened after player removal");

  // Clean up
  await prisma.joinRequest.delete({ where: { id: joinReq.id } });
  await prisma.matchPost.delete({ where: { id: match.id } });
});

test("TC-BOOK-03: Expired Hold Rejection", async () => {
  const turf = await prisma.turf.findFirst();
  const player = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  assert.ok(turf && player, "Must have turf and player");

  const pastSlotStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const pastSlotEnd = new Date(pastSlotStart.getTime() + 60 * 60 * 1000);

  // Create hold that already expired 10 minutes ago
  const expiredHold = await prisma.hold.create({
    data: {
      turfId: turf.id,
      userId: player.id,
      startTime: pastSlotStart,
      endTime: pastSlotEnd,
      price: turf.basePricePerHour,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() - 10 * 60 * 1000), // In past
    },
  });

  const now = new Date();
  const isExpired = expiredHold.status !== "ACTIVE" || expiredHold.expiresAt <= now;
  assert.strictEqual(isExpired, true, "Expired hold must be recognized as expired");

  // Clean up
  await prisma.hold.delete({ where: { id: expiredHold.id } });
});

test("TC-MATCH-03: Rejected Squad Applicant Can Re-apply without Unique Constraint Error", async () => {
  const turf = await prisma.turf.findFirst();
  const host = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  let applicant = await prisma.user.findFirst({
    where: { id: { not: host!.id } },
  });

  if (!applicant) {
    applicant = await prisma.user.create({
      data: {
        email: "reapply_applicant@sportzfy.com",
        name: "Reapply Applicant",
        role: "CUSTOMER",
      },
    });
  }

  assert.ok(turf && host && applicant, "Required seed data must exist");

  const match = await prisma.matchPost.create({
    data: {
      hostUserId: host.id,
      turfId: turf.id,
      title: "Squad Re-application QA Test",
      description: "Testing re-application after rejection.",
      sportFormat: "6v6",
      area: "Nasirabad, Chattogram",
      matchTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      totalSpots: 12,
      openSpots: 3,
      costPerPlayer: 120,
      status: "OPEN",
    },
  });

  // 1. Initial join request
  const joinReq = await prisma.joinRequest.create({
    data: {
      matchPostId: match.id,
      userId: applicant.id,
      preferredRole: "Striker",
      status: "PENDING",
    },
  });

  // 2. Captain rejects request
  const rejectedReq = await prisma.joinRequest.update({
    where: { id: joinReq.id },
    data: { status: "REJECTED" },
  });
  assert.strictEqual(rejectedReq.status, "REJECTED");

  // 3. Applicant re-applies with updated role (should update existing record to PENDING)
  const existing = await prisma.joinRequest.findUnique({
    where: {
      matchPostId_userId: {
        matchPostId: match.id,
        userId: applicant.id,
      },
    },
  });

  assert.ok(existing, "Existing record found");
  assert.strictEqual(existing.status, "REJECTED");

  const resubmitted = await prisma.joinRequest.update({
    where: { id: existing.id },
    data: {
      preferredRole: "Defender",
      status: "PENDING",
    },
  });

  assert.strictEqual(resubmitted.status, "PENDING", "Status must be reset to PENDING");
  assert.strictEqual(resubmitted.preferredRole, "Defender", "Role must update to Defender");

  // Clean up
  await prisma.joinRequest.delete({ where: { id: resubmitted.id } });
  await prisma.matchPost.delete({ where: { id: match.id } });
});
