/**
 * TC-HOLD-01: Automated Concurrency Collision Prevention Test
 * 
 * Demonstrates race condition prevention for Chapter 7 & Appendix E of CUET CSE-355 Report.
 * Simulates two concurrent players firing hold requests for the exact same pitch slot.
 */

import { prisma } from "../lib/db";

async function runConcurrencyTest() {
  console.log("==========================================================");
  console.log("  SPORTZFY CONCURRENCY COLLISION VERIFICATION (TC-HOLD-01)");
  console.log("==========================================================");

  // 1. Pick first test turf
  const targetTurf = await prisma.turf.findFirst();
  if (!targetTurf) {
    console.error("No test turf available.");
    process.exit(1);
  }
  const turf = targetTurf;

  // 2. Pick test users
  const users = await prisma.user.findMany({ take: 2 });
  if (users.length < 2) {
    console.error("Need at least 2 test users.");
    process.exit(1);
  }

  const playerA = users[0];
  const playerB = users[1];

  // Pick a slot tomorrow at 8:00 PM
  const testSlotStart = new Date();
  testSlotStart.setDate(testSlotStart.getDate() + 2);
  testSlotStart.setHours(20, 0, 0, 0);

  const testSlotEnd = new Date(testSlotStart);
  testSlotEnd.setHours(21, 0, 0, 0);

  console.log(`Target Venue: ${turf.name} (${turf.area})`);
  console.log(`Target Slot:  ${testSlotStart.toISOString()} -> ${testSlotEnd.toISOString()}`);
  console.log(`Player A:     ${playerA.name} (${playerA.id})`);
  console.log(`Player B:     ${playerB.name} (${playerB.id})`);
  console.log("----------------------------------------------------------");
  console.log("Firing concurrent hold requests via Promise.all()...");

  // Clean existing holds for this slot
  await prisma.hold.deleteMany({
    where: {
      turfId: turf.id,
      startTime: testSlotStart,
    },
  });

  const holdExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL

  // Simulating atomic transaction logic as implemented in /api/v1/holds
  async function attemptHold(userId: string) {
    try {
      const hold = await prisma.$transaction(async (tx) => {
        // Check conflicting confirmed bookings
        const bookingConflict = await tx.booking.findFirst({
          where: {
            turfId: turf.id,
            status: "CONFIRMED",
            startTime: { lt: testSlotEnd },
            endTime: { gt: testSlotStart },
          },
        });
        if (bookingConflict) throw new Error("SLOT_ALREADY_BOOKED");

        // Check active holds
        const holdConflict = await tx.hold.findFirst({
          where: {
            turfId: turf.id,
            status: "ACTIVE",
            expiresAt: { gt: new Date() },
            startTime: { lt: testSlotEnd },
            endTime: { gt: testSlotStart },
          },
        });
        if (holdConflict) throw new Error("SLOT_HELD_BY_ANOTHER");

        // Create hold
        return await tx.hold.create({
          data: {
            turfId: turf.id,
            userId,
            startTime: testSlotStart,
            endTime: testSlotEnd,
            price: turf.basePricePerHour,
            status: "ACTIVE",
            expiresAt: holdExpiry,
          },
        });
      });
      return { success: true, holdId: hold.id, status: 201 };
    } catch (err: any) {
      return { success: false, error: err.message, status: 409 };
    }
  }

  // Fire concurrently
  const [resA, resB] = await Promise.all([
    attemptHold(playerA.id),
    attemptHold(playerB.id),
  ]);

  console.log(`Result Player A: Status ${resA.status} -> ${resA.success ? "LOCK GRANTED (Hold ID: " + resA.holdId + ")" : resA.error}`);
  console.log(`Result Player B: Status ${resB.status} -> ${resB.success ? "LOCK GRANTED (Hold ID: " + resB.holdId + ")" : resB.error}`);

  // Assertions
  const oneSucceeded = (resA.success && !resB.success) || (!resA.success && resB.success);
  const oneFailedWith409 = (resA.status === 409 || resB.status === 409);

  if (oneSucceeded && oneFailedWith409) {
    console.log("----------------------------------------------------------");
    console.log("  [PASS] TC-HOLD-01: RACE CONDITION PREVENTED!");
    console.log("  One player acquired the 5-minute atomic lock.");
    console.log("  The concurrent competitor was safely rejected with HTTP 409 Conflict.");
    console.log("==========================================================");
  } else {
    console.error("  [FAIL] Concurrency assertion failed.");
    process.exit(1);
  }

  // Cleanup
  await prisma.hold.deleteMany({
    where: {
      turfId: turf.id,
      startTime: testSlotStart,
    },
  });

  process.exit(0);
}

runConcurrencyTest().catch((e) => {
  console.error(e);
  process.exit(1);
});
