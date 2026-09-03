import test from "node:test";
import assert from "node:assert";
import { calculateSlotPrice, validateSlotTimes } from "../lib/pricing";

test("TC-PRICE-01: Standard daytime slot computes base price without surcharge", () => {
  const basePrice = 2000;
  // 4:00 PM slot (16:00)
  const slotDate = new Date("2026-09-10T16:00:00.000Z");
  // Set local hours to 16
  slotDate.setHours(16, 0, 0, 0);

  const price = calculateSlotPrice(basePrice, slotDate);
  assert.strictEqual(price, 2000, "Daytime slot should equal base price");
});

test("TC-PRICE-02: Peak evening slot (8 PM - 11 PM) adds dynamic 150 BDT surcharge", () => {
  const basePrice = 2500;

  // 8:00 PM (20:00)
  const slot20 = new Date("2026-09-10T20:00:00.000Z");
  slot20.setHours(20, 0, 0, 0);
  assert.strictEqual(calculateSlotPrice(basePrice, slot20), 2650, "8 PM must have +150 BDT surcharge");

  // 9:00 PM (21:00)
  const slot21 = new Date("2026-09-10T21:00:00.000Z");
  slot21.setHours(21, 0, 0, 0);
  assert.strictEqual(calculateSlotPrice(basePrice, slot21), 2650, "9 PM must have +150 BDT surcharge");

  // 10:00 PM (22:00)
  const slot22 = new Date("2026-09-10T22:00:00.000Z");
  slot22.setHours(22, 0, 0, 0);
  assert.strictEqual(calculateSlotPrice(basePrice, slot22), 2650, "10 PM must have +150 BDT surcharge");
});

test("TC-SLOT-01: Rejects slot in the past with SLOT_IN_PAST", () => {
  const now = new Date("2026-09-04T12:00:00.000Z");
  const pastStart = new Date("2026-09-04T10:00:00.000Z");
  const pastEnd = new Date("2026-09-04T11:00:00.000Z");

  const validation = validateSlotTimes(pastStart, pastEnd, now);
  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.errorCode, "SLOT_IN_PAST");
});

test("TC-SLOT-02: Rejects slot more than 14 days in advance with SLOT_TOO_FAR", () => {
  const now = new Date("2026-09-04T12:00:00.000Z");
  const farFutureStart = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const farFutureEnd = new Date(farFutureStart.getTime() + 60 * 60 * 1000);

  const validation = validateSlotTimes(farFutureStart, farFutureEnd, now);
  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.errorCode, "SLOT_TOO_FAR");
});

test("TC-SLOT-03: Rejects inverted time intervals with INVALID_INTERVAL", () => {
  const now = new Date("2026-09-04T12:00:00.000Z");
  const start = new Date("2026-09-05T18:00:00.000Z");
  const end = new Date("2026-09-05T17:00:00.000Z"); // end before start

  const validation = validateSlotTimes(start, end, now);
  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.errorCode, "INVALID_INTERVAL");
});

test("TC-SLOT-04: Accepts valid upcoming 1-hour slot", () => {
  const now = new Date("2026-09-04T12:00:00.000Z");
  const start = new Date("2026-09-05T18:00:00.000Z");
  const end = new Date("2026-09-05T19:00:00.000Z");

  const validation = validateSlotTimes(start, end, now);
  assert.strictEqual(validation.valid, true);
  assert.strictEqual(validation.errorCode, undefined);
});
