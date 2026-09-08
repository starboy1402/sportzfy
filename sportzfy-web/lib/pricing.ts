/**
 * Domain Pricing, Slot Validation, and Machine Learning Dynamic Pricing Engine
 * CSE-355 Software Engineering Sessional, CUET
 * 
 * Features:
 * 1. Deterministic legacy calculateSlotPrice (backward compatibility with tests TC-PRICE-01 to 04)
 * 2. In-process RandomForest inference traversing serialized rf_trees.json (< 0.1ms latency)
 * 3. Strict chronological invariant Bangladesh Standard Time (UTC+6)
 * 4. Hard safety clamps: [0.80x, 1.30x] with rounded currency increments
 */

import rfTreesData from "./rf_trees.json";

export const PEAK_HOURLY_SURCHARGE = 150; // BDT
export const MAX_ADVANCE_BOOKING_DAYS = 14;
export const MAX_BOOKING_DURATION_HOURS = 4;

export const DYNAMIC_PRICING_CLAMPS = {
  MIN_MULTIPLIER: 0.80, // -20% off-peak floor
  MAX_MULTIPLIER: 1.30, // +30% surge ceiling
} as const;

/**
 * Canonical Feature Indices matching Python training script (ml/train_demand_model.py)
 */
export const FEATURE_INDEX = {
  DAY_OF_WEEK: 0,           // 0: 0=Mon ... 4=Fri, 5=Sat, 6=Sun
  IS_WEEKEND: 1,            // 1: 1 if Fri/Sat in Bangladesh, else 0
  HOUR_OF_DAY: 2,           // 2: 6 to 23
  IS_PRIME_HOUR: 3,         // 3: 1 if 18 <= hour <= 23, else 0
  BASE_PRICE: 4,            // 4: Base price in BDT
  VENUE_RATING: 5,          // 5: Rating 4.0 - 5.0
  HISTORICAL_DENSITY_4W: 6, // 6: Rolling occupancy density [0.0 - 1.0]
  IS_RAINY: 7,              // 7: 1 if rainy, else 0
} as const;

interface DecisionTreeNode {
  left: number[];
  right: number[];
  feature: number[];
  threshold: number[];
  value: number[];
}

interface RfModelSchema {
  model_type: string;
  n_estimators: number;
  max_depth: number;
  features: string[];
  trees: DecisionTreeNode[];
}

const parsedModel = rfTreesData as unknown as RfModelSchema;

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
 * Retrieves full Bangladesh Standard Time (Asia/Dhaka, UTC+6) components
 * for consistent ML feature derivation across serverless environments.
 */
export function getBangladeshDateTimeParts(date: Date): {
  hour: number;
  dayOfWeek: number; // 0=Mon, 1=Tue, ..., 4=Fri, 5=Sat, 6=Sun (matching Python model)
  isWeekend: number; // 1 if Fri (4) or Sat (5), else 0
  isPrimeHour: number; // 1 if 18 <= hour <= 23, else 0
} {
  // Asia/Dhaka is fixed at UTC+6 with no daylight saving shifts
  const bstEpoch = date.getTime() + 6 * 60 * 60 * 1000;
  const bstDate = new Date(bstEpoch);
  const hour = bstDate.getUTCHours();
  
  // JS getUTCDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // Map to Python 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  const jsDay = bstDate.getUTCDay();
  const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;
  const isWeekend = (dayOfWeek === 4 || dayOfWeek === 5) ? 1 : 0;
  const isPrimeHour = (hour >= 18 && hour <= 23) ? 1 : 0;

  return {
    hour,
    dayOfWeek,
    isWeekend,
    isPrimeHour,
  };
}

/**
 * Performs sub-millisecond in-process inference by traversing the 100 serialized
 * Random Forest decision trees exported from scikit-learn.
 */
export function predictDemandScore(features: number[]): number {
  const trees = parsedModel?.trees;
  if (!trees || trees.length === 0) {
    // Fallback heuristic if trees are absent
    const isWeekend = features[FEATURE_INDEX.IS_WEEKEND] || 0;
    const isPrime = features[FEATURE_INDEX.IS_PRIME_HOUR] || 0;
    return Math.min(0.95, Math.max(0.10, 0.35 + 0.30 * isWeekend + 0.25 * isPrime));
  }

  let totalScore = 0;
  const nTrees = trees.length;

  for (let t = 0; t < nTrees; t++) {
    const tree = trees[t];
    let node = 0;
    // -2 is the scikit-learn convention for leaf nodes
    while (tree.feature[node] !== -2 && node < tree.feature.length) {
      const featIdx = tree.feature[node];
      const featVal = features[featIdx] ?? 0;
      if (featVal <= tree.threshold[node]) {
        node = tree.left[node];
      } else {
        node = tree.right[node];
      }
    }
    totalScore += tree.value[node] ?? 0.5;
  }

  const avgScore = totalScore / nTrees;
  return Math.min(0.98, Math.max(0.05, avgScore));
}

export interface DynamicPricingQuote {
  finalPrice: number;
  basePrice: number;
  demandScore: number;
  multiplier: number;
  isPeak: boolean;
  isDiscounted: boolean;
  adjustmentAmount: number;
  badgeText: string;
  explanation: string;
}

/**
 * Calculates dynamic slot pricing using the Random Forest demand prediction model
 * with strict safety clamps [0.80x, 1.30x].
 */
export function calculateDynamicSlotPrice(
  basePricePerHour: number,
  startTime: Date,
  options?: {
    venueRating?: number;
    historicalDensity?: number;
    isRainy?: boolean;
    endTime?: Date;
  }
): DynamicPricingQuote {
  const { hour, dayOfWeek, isWeekend, isPrimeHour } = getBangladeshDateTimeParts(startTime);

  const venueRating = options?.venueRating ?? 4.7;
  const historicalDensity = options?.historicalDensity ?? 0.55;
  const isRainy = options?.isRainy ? 1 : 0;

  // Build canonical feature vector
  const features: number[] = new Array(8);
  features[FEATURE_INDEX.DAY_OF_WEEK] = dayOfWeek;
  features[FEATURE_INDEX.IS_WEEKEND] = isWeekend;
  features[FEATURE_INDEX.HOUR_OF_DAY] = hour;
  features[FEATURE_INDEX.IS_PRIME_HOUR] = isPrimeHour;
  features[FEATURE_INDEX.BASE_PRICE] = basePricePerHour;
  features[FEATURE_INDEX.VENUE_RATING] = venueRating;
  features[FEATURE_INDEX.HISTORICAL_DENSITY_4W] = historicalDensity;
  features[FEATURE_INDEX.IS_RAINY] = isRainy;

  const demandScore = predictDemandScore(features);

  // Linear scaling from demand probability to price multiplier:
  // Base demand ~ 0.46 yields 1.00x multiplier
  // Off-peak demand ~ 0.20 yields 0.83x multiplier
  // Peak demand ~ 0.85 yields 1.25x multiplier
  const rawMultiplier = 0.70 + demandScore * 0.65;

  // Strictly clamp between [0.80x, 1.30x]
  const clampedMultiplier = Math.min(
    DYNAMIC_PRICING_CLAMPS.MAX_MULTIPLIER,
    Math.max(DYNAMIC_PRICING_CLAMPS.MIN_MULTIPLIER, rawMultiplier)
  );

  // Hourly rate rounded to nearest 50 BDT for clean consumer pricing
  const rawPrice = basePricePerHour * clampedMultiplier;
  let finalHourlyRate = Math.round(rawPrice / 50) * 50;

  // Ensure rounded rate still strictly respects hard clamps
  const minFloor = Math.floor(basePricePerHour * DYNAMIC_PRICING_CLAMPS.MIN_MULTIPLIER);
  const maxCeiling = Math.ceil(basePricePerHour * DYNAMIC_PRICING_CLAMPS.MAX_MULTIPLIER);
  finalHourlyRate = Math.min(maxCeiling, Math.max(minFloor, finalHourlyRate));

  // Multi-hour scaling if endTime is provided
  let finalPrice = finalHourlyRate;
  if (options?.endTime && options.endTime > startTime) {
    const durationHours = (options.endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    finalPrice = Math.round(finalHourlyRate * Math.max(0.5, durationHours));
  }

  const adjustmentAmount = finalHourlyRate - basePricePerHour;
  const isDiscounted = adjustmentAmount < 0;
  const isPeak = adjustmentAmount > 0;

  let badgeText = "Standard Rate";
  let explanation = "Regular daytime slot rate";

  if (isDiscounted) {
    const pct = Math.round(Math.abs(adjustmentAmount) / basePricePerHour * 100);
    badgeText = `Off-Peak (${pct}% OFF)`;
    explanation = `Off-peak saver discount applied. Save ৳${Math.abs(adjustmentAmount)}!`;
  } else if (isPeak) {
    const pct = Math.round(adjustmentAmount / basePricePerHour * 100);
    badgeText = `Surge (+${pct}%)`;
    explanation = isPrimeHour
      ? `High prime-floodlight demand slot (+৳${adjustmentAmount}).`
      : `High demand slot (+৳${adjustmentAmount}).`;
  }

  return {
    finalPrice,
    basePrice: basePricePerHour,
    demandScore: Math.round(demandScore * 100) / 100,
    multiplier: Math.round((finalHourlyRate / basePricePerHour) * 100) / 100,
    isPeak,
    isDiscounted,
    adjustmentAmount,
    badgeText,
    explanation,
  };
}

/**
 * Calculates slot price with dynamic peak hour surcharge (8 PM - 11 PM Bangladesh Time)
 * and optional multi-hour duration scaling.
 * 
 * NOTE: Kept strictly unchanged for backward compatibility with existing unit tests (TC-PRICE-01 to 04).
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
