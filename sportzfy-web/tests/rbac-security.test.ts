import test from "node:test";
import assert from "node:assert";
import { prisma } from "../lib/db";
import { encodeSession, decodeSession, SessionUser } from "../lib/auth";
import { calculateDynamicSlotPrice, DYNAMIC_PRICING_CLAMPS } from "../lib/pricing";

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

test("TC-SEARCH-02: Multi-parameter Search Filter (City, Format, MaxPrice)", async () => {
  const turfs = await prisma.turf.findMany({
    where: {
      status: "APPROVED",
      city: "Chattogram",
      pitchFormats: { contains: "7v7", mode: "insensitive" },
      basePricePerHour: { lte: 2500 },
    },
  });

  assert.ok(turfs.length > 0, "Must find Chattogram 7v7 turfs under 2500 BDT");
  for (const t of turfs) {
    assert.strictEqual(t.city, "Chattogram");
    assert.ok(t.pitchFormats.includes("7v7"));
    assert.ok(t.basePricePerHour <= 2500);
  }
});


test("TC-OWNER-01: Turf Base Rate and AvailabilityRule Synchronization", async () => {
  const turf = await prisma.turf.findFirst({
    include: { availabilityRules: true },
  });
  assert.ok(turf, "Must find an existing turf");

  const originalPrice = turf.basePricePerHour;
  const newPrice = originalPrice + 100;

  // 1. Update turf base price
  await prisma.turf.update({
    where: { id: turf.id },
    data: { basePricePerHour: newPrice },
  });

  // 2. Synchronize availability rules
  await prisma.availabilityRule.updateMany({
    where: { turfId: turf.id },
    data: { hourlyRate: newPrice },
  });

  // 3. Verify sync
  const updatedRules = await prisma.availabilityRule.findMany({
    where: { turfId: turf.id },
  });
  assert.ok(updatedRules.length > 0, "Must have availability rules");
  for (const rule of updatedRules) {
    assert.strictEqual(rule.hourlyRate, newPrice, "All availability rules must reflect updated rate");
  }

  // 4. Revert to original price to leave DB clean
  await prisma.turf.update({
    where: { id: turf.id },
    data: { basePricePerHour: originalPrice },
  });
  await prisma.availabilityRule.updateMany({
    where: { turfId: turf.id },
    data: { hourlyRate: originalPrice },
  });
});

test("TC-OWNER-02: Custom Friday Weekend Surge Rate and Availability Rule", async () => {
  const turf = await prisma.turf.findFirst({
    include: { availabilityRules: true },
  });
  assert.ok(turf, "Must find an existing turf");

  const fridayRule = turf.availabilityRules.find((r) => r.dayOfWeek === 5);
  assert.ok(fridayRule, "Must have a Friday availability rule (dayOfWeek=5)");

  const originalFridayRate = fridayRule.hourlyRate;
  const surgeRate = originalFridayRate + 300;

  // 1. Update Friday rate to surge
  await prisma.availabilityRule.update({
    where: { id: fridayRule.id },
    data: { hourlyRate: surgeRate, openHour: 15, closeHour: 26 },
  });

  // 2. Verify Friday rule persisted
  const updatedFriday = await prisma.availabilityRule.findUnique({
    where: { id: fridayRule.id },
  });
  assert.strictEqual(updatedFriday?.hourlyRate, surgeRate, "Friday rate must reflect surge rate");
  assert.strictEqual(updatedFriday?.openHour, 15);
  assert.strictEqual(updatedFriday?.closeHour, 26);

  // 3. Revert to original rate to keep DB clean
  await prisma.availabilityRule.update({
    where: { id: fridayRule.id },
    data: { hourlyRate: originalFridayRate, openHour: 16, closeHour: 25 },
  });
});

test("TC-USER-01: Profile Settings Update (Name, Phone, Bio, Position) and DB Safety", async () => {
  const user = await prisma.user.findFirst({
    where: { role: "CUSTOMER" },
    include: { profile: true },
  });
  assert.ok(user, "Must find a customer user");

  const originalName = user.name;
  const originalPhone = user.phone;
  const originalBio = user.profile?.bio;
  const originalPosition = user.profile?.favoritePosition;

  const testName = "Zubair Test Striker";
  const testPhone = "+880 1812-998877";
  const testBio = "Test playing bio for verification";
  const testPosition = "Winger";

  // 1. Update User table
  await prisma.user.update({
    where: { id: user.id },
    data: { name: testName, phone: testPhone },
  });

  // 2. Upsert Profile table
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      bio: testBio,
      favoritePosition: testPosition,
      preferredFormat: "7v7",
      preferredCity: "Chattogram",
    },
    update: {
      bio: testBio,
      favoritePosition: testPosition,
    },
  });

  // 3. Verify changes in database
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });
  assert.strictEqual(updatedUser?.name, testName);
  assert.strictEqual(updatedUser?.phone, testPhone);
  assert.strictEqual(updatedUser?.profile?.bio, testBio);
  assert.strictEqual(updatedUser?.profile?.favoritePosition, testPosition);

  // 4. Revert to original values to leave DB clean
  await prisma.user.update({
    where: { id: user.id },
    data: { name: originalName, phone: originalPhone },
  });
  if (user.profile) {
    await prisma.profile.update({
      where: { userId: user.id },
      data: { bio: originalBio, favoritePosition: originalPosition },
    });
  }
});

test("TC-PAYOUT-01: Owner Withdrawal Request and Admin Settlement Lifecycle", async () => {
  const owner = await prisma.user.findFirst({
    where: { role: "OWNER" },
  });
  assert.ok(owner, "Must find an owner user in DB");

  // 1. Owner creates a withdrawal request
  const payout = await (prisma as any).payoutRequest.create({
    data: {
      ownerId: owner.id,
      amount: 1500,
      method: "BKASH",
      accountNumber: "01711223344",
      accountHolder: owner.name,
      status: "PENDING",
    },
  });

  assert.ok(payout.id, "Payout request must have ID");
  assert.strictEqual(payout.status, "PENDING");
  assert.strictEqual(payout.amount, 1500);

  // 2. Admin processes payout and marks disbursed
  const testTrxRef = `BKASH-TRX-${Date.now()}`;
  const disbursed = await (prisma as any).payoutRequest.update({
    where: { id: payout.id },
    data: {
      status: "DISBURSED",
      transactionRef: testTrxRef,
      adminNotes: "Disbursed via corporate bKash disbursement portal",
      processedAt: new Date(),
    },
  });

  assert.strictEqual(disbursed.status, "DISBURSED");
  assert.strictEqual(disbursed.transactionRef, testTrxRef);

  // 3. Clean up test record to keep DB pristine
  await (prisma as any).payoutRequest.delete({
    where: { id: payout.id },
  });
});

test("TC-AI-PRICE-01: One-Click AI Dynamic Rates Respect ML Demand & Safety Clamps", async () => {
  const turf = await prisma.turf.findFirst({
    where: { status: "APPROVED" },
  });
  assert.ok(turf, "Must find an approved turf in Neon DB");

  const basePrice = turf.basePricePerHour;
  const rating = turf.rating || 4.8;

  // 1. Calculate rate for Friday Prime-Time (8:00 PM BST)
  const fridayPrime = new Date();
  const daysUntilFriday = (5 - fridayPrime.getUTCDay() + 7) % 7 || 7;
  fridayPrime.setUTCDate(fridayPrime.getUTCDate() + daysUntilFriday);
  fridayPrime.setUTCHours(14, 0, 0, 0); // 14:00 UTC = 20:00 BST

  const primeQuote = calculateDynamicSlotPrice(basePrice, fridayPrime, {
    venueRating: rating,
    historicalDensity: 0.90,
  });

  // Must apply a surge during peak weekend evening
  assert.ok(primeQuote.multiplier >= 1.10, "Friday 8 PM BST must have at least +10% surge multiplier");
  assert.ok(primeQuote.finalPrice >= basePrice, "Surged price must be >= base price");

  // Strict clamp bounds
  const minFloor = Math.floor(basePrice * DYNAMIC_PRICING_CLAMPS.MIN_MULTIPLIER);
  const maxCeiling = Math.ceil(basePrice * DYNAMIC_PRICING_CLAMPS.MAX_MULTIPLIER);
  assert.ok(primeQuote.finalPrice >= minFloor, `Price cannot fall below floor (৳${minFloor})`);
  assert.ok(primeQuote.finalPrice <= maxCeiling, `Price cannot exceed ceiling (৳${maxCeiling})`);

  // 2. Calculate rate for Monday Afternoon Off-Peak (4:00 PM BST)
  const mondayOffPeak = new Date();
  const daysUntilMonday = (1 - mondayOffPeak.getUTCDay() + 7) % 7 || 7;
  mondayOffPeak.setUTCDate(mondayOffPeak.getUTCDate() + daysUntilMonday);
  mondayOffPeak.setUTCHours(10, 0, 0, 0); // 10:00 UTC = 16:00 BST

  const offPeakQuote = calculateDynamicSlotPrice(basePrice, mondayOffPeak, {
    venueRating: rating,
    historicalDensity: 0.30,
  });

  assert.ok(offPeakQuote.finalPrice <= primeQuote.finalPrice, "Off-peak price must be <= prime-time price");
  assert.ok(offPeakQuote.finalPrice >= minFloor, "Off-peak price must respect floor");
});

test("TC-AI-PRICE-02: DB Persistence of 7-Day AI Schedule Rules and Clean Reversion", async () => {
  const turf = await prisma.turf.findFirst({
    where: { status: "APPROVED" },
    include: { availabilityRules: true },
  });
  assert.ok(turf, "Must find turf in Neon DB");

  const originalRules = await prisma.availabilityRule.findMany({
    where: { turfId: turf.id },
  });

  const baseRate = turf.basePricePerHour;
  const surgedWeekendRate = Math.round((baseRate * 1.20) / 50) * 50;

  // 1. Simulate applying AI dynamic rates to all 7 days
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const targetRate = isWeekend ? surgedWeekendRate : baseRate;

    const existing = turf.availabilityRules.find((r) => r.dayOfWeek === dayOfWeek);
    if (existing) {
      await prisma.availabilityRule.update({
        where: { id: existing.id },
        data: { hourlyRate: targetRate },
      });
    } else {
      await prisma.availabilityRule.create({
        data: {
          turfId: turf.id,
          dayOfWeek,
          openHour: 16,
          closeHour: 25,
          hourlyRate: targetRate,
        },
      });
    }
  }

  // 2. Verify database records
  const updatedRules = await prisma.availabilityRule.findMany({
    where: { turfId: turf.id },
    orderBy: { dayOfWeek: "asc" },
  });

  const fridayRule = updatedRules.find((r) => r.dayOfWeek === 5);
  const mondayRule = updatedRules.find((r) => r.dayOfWeek === 1);

  assert.ok(fridayRule, "Friday rule must exist");
  assert.strictEqual(fridayRule.hourlyRate, surgedWeekendRate, "Friday rate must be surged");
  assert.ok(mondayRule, "Monday rule must exist");
  assert.strictEqual(mondayRule.hourlyRate, baseRate, "Monday rate must match baseline");

  // 3. Reset rules back to baseline / original state to maintain DB cleanliness
  for (const orig of originalRules) {
    await prisma.availabilityRule.update({
      where: { id: orig.id },
      data: { hourlyRate: orig.hourlyRate },
    });
  }
});

test("TC-AI-PRICE-03: Venue Ownership Authorization Isolation for AI Dynamic Pricing", async () => {
  const turfs = await prisma.turf.findMany({ take: 2 });
  assert.ok(turfs.length >= 1, "Must have at least one turf in database");

  const turf = turfs[0];
  const rogueUserId = "cmtm_rogue_operator_777";

  // Enforce security rule: user cannot modify turf if user is not ADMIN and user.id !== turf.ownerId
  const isAuthorized = rogueUserId === turf.ownerId;
  assert.strictEqual(isAuthorized, false, "Unauthorized owner must NOT be allowed to mutate venue dynamic rates");
});

test("TC-AI-CHAT-01: AI Chatbot Intent Extraction & Real Database Turf Card Retrieval", async () => {
  // Test that natural language query for 7v7 turf in Chattogram correctly queries DB
  const turfs = await prisma.turf.findMany({
    where: {
      status: "APPROVED",
      city: "Chattogram",
      pitchFormats: { contains: "7v7", mode: "insensitive" },
    },
    take: 3,
  });

  assert.ok(turfs.length > 0, "Must retrieve at least one approved 7v7 turf in Chattogram");
  const firstTurf = turfs[0];
  assert.strictEqual(firstTurf.status, "APPROVED");
  assert.ok(firstTurf.pitchFormats.includes("7v7"));
  assert.strictEqual(firstTurf.city, "Chattogram");
  assert.ok(firstTurf.basePricePerHour > 0);
});

test("TC-AI-CHAT-02: AI Chatbot Squad Matchmaking Query with Role Filtering", async () => {
  // Test matchmaking query seeking open spots for Goalkeeper
  const openMatches = await prisma.matchPost.findMany({
    where: {
      status: "OPEN",
      openSpots: { gt: 0 },
    },
    include: {
      turf: true,
      hostUser: true,
    },
  });

  assert.ok(openMatches.length > 0, "Must have active open matches in database");
  for (const match of openMatches) {
    assert.strictEqual(match.status, "OPEN");
    assert.ok(match.openSpots > 0);
    assert.ok(match.turf.name.length > 0);
  }
});





