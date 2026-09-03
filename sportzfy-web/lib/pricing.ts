/**
 * Domain Pricing and Slot Validation Engine for Sportzfy
 */

export const PEAK_HOURLY_SURCHARGE = 150; // BDT
export const MAX_ADVANCE_BOOKING_DAYS = 14;

/**
 * Calculates slot price with dynamic peak hour surcharge (8 PM - 11 PM)
 */
export function calculateSlotPrice(basePricePerHour: number, startTime: Date): number {
  const hour = startTime.getHours();
  // Peak hours: 20:00 (8 PM) through 23:00 (11 PM)
  const isPeakHour = hour >= 20 && hour <= 23;
  return basePricePerHour + (isPeakHour ? PEAK_HOURLY_SURCHARGE : 0);
}

export interface SlotValidationResult {
  valid: boolean;
  errorCode?: "SLOT_IN_PAST" | "SLOT_TOO_FAR" | "INVALID_INTERVAL" | "INVALID_DURATION";
  errorMessage?: string;
}

/**
 * Validates slot time constraints
 */
export function validateSlotTimes(
  startTime: Date,
  endTime: Date,
  now: Date = new Date()
): SlotValidationResult {
  // 1. Check end > start
  if (endTime <= startTime) {
    return {
      valid: false,
      errorCode: "INVALID_INTERVAL",
      errorMessage: "Slot end time must be after start time.",
    };
  }

  // 2. Check not in past
  if (startTime <= now) {
    return {
      valid: false,
      errorCode: "SLOT_IN_PAST",
      errorMessage: "Cannot reserve a slot that has already elapsed.",
    };
  }

  // 3. Check 14-day upper boundary
  const maxFuture = new Date(now.getTime() + MAX_ADVANCE_BOOKING_DAYS * 24 * 60 * 60 * 1000);
  if (startTime > maxFuture) {
    return {
      valid: false,
      errorCode: "SLOT_TOO_FAR",
      errorMessage: `Slots can only be reserved up to ${MAX_ADVANCE_BOOKING_DAYS} days in advance.`,
    };
  }

  return { valid: true };
}
