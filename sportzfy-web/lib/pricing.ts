/**
 * Domain Pricing and Slot Validation Engine for Sportzfy
 */

export const PEAK_HOURLY_SURCHARGE = 150; // BDT
export const MAX_ADVANCE_BOOKING_DAYS = 14;
export const MAX_BOOKING_DURATION_HOURS = 4;

/**
 * Retrieves the hour of the day in Bangladesh Standard Time (Asia/Dhaka, UTC+6)
 */
export function getBangladeshHour(date: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      hour: "numeric",
      hourCycle: "h23",
    });
    const parts = formatter.formatToParts(date);
    const hourPart = parts.find((p) => p.type === "hour");
    if (hourPart) {
      return parseInt(hourPart.value, 10);
    }
  } catch {
    // Fallback: UTC+6
    return (date.getUTCHours() + 6) % 24;
  }
  return (date.getUTCHours() + 6) % 24;
}

/**
 * Calculates slot price with dynamic peak hour surcharge (8 PM - 11 PM Bangladesh Time)
 * and optional multi-hour duration scaling.
 */
export function calculateSlotPrice(
  basePricePerHour: number,
  startTime: Date,
  endTime?: Date
): number {
  const bstHour = getBangladeshHour(startTime);
  // Peak hours in Bangladesh: 20:00 (8 PM) through 23:00 (11 PM) BST
  const isPeakHour = bstHour >= 20 && bstHour <= 23;
  const hourlyRate = basePricePerHour + (isPeakHour ? PEAK_HOURLY_SURCHARGE : 0);

  if (endTime && endTime > startTime) {
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return Math.round(hourlyRate * Math.max(0.5, durationHours));
  }

  return hourlyRate;
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

  // 4. Check maximum booking duration cap (e.g., max 4 hours per reservation)
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  if (durationHours > MAX_BOOKING_DURATION_HOURS) {
    return {
      valid: false,
      errorCode: "INVALID_DURATION",
      errorMessage: `Maximum booking duration is ${MAX_BOOKING_DURATION_HOURS} hours per reservation.`,
    };
  }

  return { valid: true };
}
