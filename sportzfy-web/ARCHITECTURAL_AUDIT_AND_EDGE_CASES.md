# Sportzfy System Readiness & Architectural Audit
**Sub-title:** Pre-Implementation Edge Cases, Schema Discrepancies & Production Traps  
**Course:** CSE-355 Software Engineering Sessional, CUET  
**Supervisors:** Prof. Mir Md. Saki Kowsar, Md. Refaj Hossan  
**Authors:** Mahmudul Hasan (2204040), Sakib Alif (2204051), Ayan Barua (2204053)  
**Methodological Reference:** Chip Huyen, *Designing Machine Learning Systems* (O'Reilly, 2022)  
**Audit Date:** September 8, 2026  

---

## 1. Executive Summary

Prior to implementing the **Machine Learning Dynamic Pricing Engine**, the **20-Venue Catalog Expansion**, and the **Foodpanda-Style Discovery Shelves**, an exhaustive read-only inspection was executed across the entire Sportzfy platform.

The audit verified that the core transaction pipeline (atomic holds, serializable isolation, and bKash mock confirmations) is healthy and that all **22 automated tests pass** (`npm test`). However, the inspection revealed **7 critical architectural gaps and edge cases** across schema definitions, timezone normalization, feature vector serialization, and UI synchronization.

Resolving these issues proactively prevents runtime crashes, silent ML inference degradation, and cart abandonment during live deployment on Vercel and Neon PostgreSQL.

---

## 2. Baseline System Health Verification

The pre-audit health check established the following operational baselines:

| Verification Layer | Target Component | Measured Status | Notes |
| :--- | :--- | :--- | :--- |
| **Unit & Integration Suite** | `tests/*.test.ts` | **22 / 22 Passed (100%)** | Ran against live Neon DB pool in ~17.8s. |
| **Concurrency Isolation** | `tests/verify-concurrency.ts` | **Passed (TC-HOLD-01)** | Concurrent requests yield 1 lock (`201`) and 1 conflict (`409`). |
| **Database Resilience** | `lib/db.ts` | **Active** | Prisma `$extends` query hook catches dead sockets and retries once. |
| **Python ML Runtime** | Python 3.x System Env | **Verified** | Scikit-Learn `1.9.0`, NumPy `2.3.5`, Pandas `3.0.2`, Joblib `1.5.3`. |
| **Next.js Compilation** | `sportzfy-web` (Next 16) | **Healthy** | Dev server running locally; TypeScript strict mode enabled. |

---

## 3. The 7 Critical Architectural Problems & Solutions

```
┌─────────────────────────────────────────────────────────────────────────┐
│              SPORTZFY ARCHITECTURAL READINESS AUDIT MAP                │
├────────────────────────────────┬────────────────────────────────────────┤
│ 1. Schema Coordinate Gap       │ Missing latitude/longitude on Turf     │
│ 2. UTC vs BST Timezone Trap    │ Vercel UTC shifts Sunday 01:00 to Sat  │
│ 3. Feature Order Skew Risk     │ Tree array index mismatch in TS vs Py  │
│ 4. Price Quote Inconsistency   │ Microsecond lead time drift in Holds   │
│ 5. Postgres 65K Parameter Cap  │ 5,000-row insert crashes Neon pool     │
│ 6. Test Suite Invariance       │ Breaking legacy calculateSlotPrice     │
│ 7. UI Filter Hardcoding        │ Missing Sylhet and Cricket Box filters │
└────────────────────────────────┴────────────────────────────────────────┘
```

---

### Problem 1: Missing GPS Coordinates on `Turf` Model

* **Location:** [`prisma/schema.prisma`](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/prisma/schema.prisma#L41-L72)
* **The Gap:**
  `model Turf` defines `city`, `area`, and `address`, but contains **no geographic coordinates (`latitude` or `longitude`)**.
* **Impact on Discovery Engine:**
  Shelf 1 of the Foodpanda discovery engine is **"Near You"**, which must sort venues by true Haversine spherical distance from the user's location and estimate driving/walking time. Without coordinates, distance sorting is impossible or reduces to a coarse area string match.
* **Production Solution:**
  1. Add optional coordinate fields to `model Turf` in `prisma/schema.prisma`:
     ```prisma
     model Turf {
       // ... existing fields ...
       latitude         Float?
       longitude        Float?
       // ... relations ...
     }
     ```
  2. Populate exact coordinates for all 20 venues during seeding (e.g., Eco Sports Halishahar: `22.3372, 91.7832`; Apollo Kazir Dewri: `22.3475, 91.8282`; Dhanmondi Champions: `23.7465, 90.3760`).
  3. Expose Haversine formula calculation in `/api/v1/turfs/shelves` using player latitude and longitude query params.

---

### Problem 2: The UTC vs. BST Date & Time Boundary Trap

* **Location:** [`lib/pricing.ts`](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/lib/pricing.ts#L10-L29) and [`app/api/v1/turfs/[id]/availability/route.ts`](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/app/api/v1/turfs/%5Bid%5D/availability/route.ts#L27-L37)
* **The Gap:**
  Vercel serverless functions run in UTC (`process.env.TZ = 'UTC'`). Bangladesh Standard Time (BST) is **UTC+6**.
* **The Edge Case:**
  * A late-night match slot at **1:00 AM BST on Sunday morning** is **19:00 UTC on Saturday**.
  * If feature extraction naively calls `slotStart.getUTCDay()`, it returns `6` (Saturday) instead of `0` (Sunday).
  * If the model relies on `is_weekend` (Friday/Saturday in Bangladesh), a Sunday morning slot could be misclassified as Saturday peak demand, distorting the dynamic price.
* **Production Solution:**
  Implement a deterministic timezone normalization utility in `lib/pricing.ts`:
  ```typescript
  export function getBangladeshDateTimeParts(date: Date) {
    // Exactly +6 hours (+21,600,000 ms) offset
    const bstDate = new Date(date.getTime() + 6 * 60 * 60 * 1000);
    const dayOfWeek = bstDate.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    const hourOfDay = bstDate.getUTCHours(); // 0 to 23

    return {
      dayOfWeek,
      hourOfDay,
      isWeekend: dayOfWeek === 5 || dayOfWeek === 6 ? 1 : 0, // Friday & Saturday in BD
      isPrimeHour: hourOfDay >= 20 && hourOfDay <= 23 ? 1 : 0, // 8 PM - 11 PM prime lights
    };
  }
  ```
  This guarantees that features generated in Vercel serverless match the Python training distribution 100%.

---

### Problem 3: Feature Array Order Skew (Python $\leftrightarrow$ TypeScript)

* **Location:** [`ml/train_demand_model.py`](file:///c:/Users/alifs/Downloads/swe_project/ml/train_demand_model.py#L95-L104) and [`lib/pricing.ts`](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/lib/pricing.ts)
* **The Gap:**
  Scikit-Learn's `RandomForestRegressor` exports decision tree structures where internal split nodes index features by numerical position (`tree.feature[node]`), rather than by string column name.
* **The Silent Bug:**
  If Python trains on:
  ```python
  feature_cols = [
      "day_of_week", "is_weekend", "hour_of_day", "is_prime_hour",
      "base_price", "venue_rating", "historical_density_4w", "is_rainy"
  ]
  ```
  ...and TypeScript constructs the array in a different sequence (e.g., placing `base_price` before `is_prime_hour`), the tree traversal will test `is_prime_hour` thresholds against `base_price` values! No runtime error will be thrown, but the output demand scores will be nonsensical.
* **Production Solution:**
  Define and export an immutable canonical order in both languages:
  ```typescript
  export const FEATURE_INDEX = {
    DAY_OF_WEEK: 0,
    IS_WEEKEND: 1,
    HOUR_OF_DAY: 2,
    IS_PRIME_HOUR: 3,
    BASE_PRICE: 4,
    VENUE_RATING: 5,
    HISTORICAL_DENSITY_4W: 6,
    IS_RAINY: 7,
  } as const;
  ```

---

### Problem 4: Dynamic Price Quote Stability & Anti-Tampering

* **Location:** [`app/turfs/[id]/page.tsx`](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/app/turfs/%5Bid%5D/page.tsx#L139) and [`app/api/v1/holds/route.ts`](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/app/api/v1/holds/route.ts#L67)
* **The Gap:**
  When a player views a turf timetable, the UI calls `/api/v1/turfs/[id]/availability` to show slot cards with prices. When the player clicks a slot, the client sends `{ turfId, startTime, endTime, price }` to `/api/v1/holds`. To prevent client price tampering, `/api/v1/holds` recalculates the authentic price server-side.
* **The Cart Abandonment Risk:**
  If the dynamic pricing algorithm uses un-binned continuous millisecond lead times, the calculated price in `/holds` could differ from what the player saw on the timetable 10 seconds earlier (e.g. ৳1,400 jumping to ৳1,500 due to a minute crossing).
* **Production Solution (Chip Huyen Ch. 11 - Pricing Fairness):**
  1. Base features (`dayOfWeek`, `hourOfDay`, `basePrice`, `venueRating`) are fixed to the target slot interval.
  2. The online feature `leadTimeHours` is quantized into coarse tiers:
     * `LAST_MINUTE`: $\le 3$ hours (promotional discount)
     * `STANDARD`: $4 - 24$ hours
     * `ADVANCE`: $> 24$ hours
  3. Both `availability/route.ts` and `holds/route.ts` call the exact same `calculateDynamicSlotPrice()` function, guaranteeing identical quotes.
  4. Once `Hold.price` is written, `Booking.totalAmount` strictly inherits `Hold.price`, freezing the quote through checkout.

---

### Problem 5: PostgreSQL 65,535 Parameter Limit During 5,000+ Record Seeding

* **Location:** [`prisma/seed.ts`](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/prisma/seed.ts)
* **The Gap:**
  Generating 5,000+ historical bookings across 60 days to seed the cold-start baseline is essential for realistic 4-week density metrics. However, inserting 5,000 records in a single Prisma call will generate:
  $$5{,}000 \text{ rows} \times 11 \text{ columns} = 55{,}000 \text{ SQL parameters}$$
  This approaches PostgreSQL's hard limit of 65,535 parameters and causes statement timeouts on Neon serverless pooled connections.
* **Production Solution:**
  1. Chunk synthetic bookings into batches of **1,000 records**:
     ```typescript
     const CHUNK_SIZE = 1000;
     for (let i = 0; i < bookings.length; i += CHUNK_SIZE) {
       const chunk = bookings.slice(i, i + CHUNK_SIZE);
       await prisma.booking.createMany({
         data: chunk,
         skipDuplicates: true,
       });
     }
     ```
  2. Historical bookings do not need `holdId` (since `holdId` is nullable in `schema.prisma`), saving 5,000 redundant hold insertions.
  3. Use CSPRNG-based deterministic unique codes: `SPZ-HIST-${i.toString().padStart(5, '0')}-${randHex}` to guarantee zero unique key collisions on `referenceCode`.

---

### Problem 6: Preserving Existing Test Suite Invariants

* **Location:** [`tests/pricing-and-holds.test.ts`](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/tests/pricing-and-holds.test.ts#L5-L72)
* **The Gap:**
  Existing unit tests `TC-PRICE-01` through `TC-PRICE-04` directly test the legacy function `calculateSlotPrice(basePrice, slotDate)`. If `calculateSlotPrice` is modified with breaking parameter signatures, the test suite will break.
* **Production Solution:**
  1. Preserve `calculateSlotPrice` as the deterministic baseline/fallback rule engine.
  2. Introduce `calculateDynamicSlotPrice(options)` as an enhanced engine that uses the Random Forest tree weights.
  3. Add new dedicated tests in `tests/pricing-and-holds.test.ts`:
     * `TC-PRICE-05`: Tree traversal produces valid demand score $\in [0.05, 0.98]$.
     * `TC-PRICE-06`: 1,000-random-input safety clamp invariance:
       $$\text{Floor} (0.80\times) \le \text{finalPrice} \le \text{Ceiling} (1.30\times)$$
     * `TC-PRICE-07`: Last-minute off-peak discount applies only within $\le 3$ hours of kickoff.

---

### Problem 7: UI Filter Hardcoding in Turf Catalog

* **Location:** [`components/TurfCatalog.tsx`](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/components/TurfCatalog.tsx#L91-L129) and [`app/owner/turfs/new/page.tsx`](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/app/owner/turfs/new/page.tsx#L146-L148)
* **The Gap:**
  The filter pills in `TurfCatalog.tsx` hardcode:
  * Cities: `["All", "Chattogram", "Dhaka"]`
  * Formats: `["All", "7v7", "6v6", "5v5"]`
  The turf creation form in `app/owner/turfs/new/page.tsx` similarly hardcodes only Chattogram and Dhaka.
* **Impact:**
  When expanding to **Sylhet** (venues 19 & 20: Shahjalal Upashahar and Zindabazar) or adding **Cricket Box** pitches, users will be unable to filter for them, and owners cannot register venues in Sylhet.
* **Production Solution:**
  1. Dynamically derive city and format pills from the loaded turfs array, or expand the list to include Sylhet and Cricket:
     ```typescript
     const cities = ["All", "Chattogram", "Dhaka", "Sylhet"];
     const formats = ["All", "7v7", "6v6", "5v5", "Cricket Box"];
     ```
  2. Add `<option value="Sylhet">Sylhet</option>` to `app/owner/turfs/new/page.tsx`.

---

## 4. Implementation Readiness Checklist

When you are ready to approve execution, the implementation should proceed in this strict chronological order:

- [ ] **Step 1 (Database Migration & Client Types):** Add `latitude Float?` and `longitude Float?` to `model Turf` in `prisma/schema.prisma`. Execute `npx prisma db push && npx prisma generate` to alter the Neon PostgreSQL table before seeding and regenerate the Prisma Client types.
- [ ] **Step 2 (Fast Batch Seeding):** Update `prisma/seed.ts` with 20 authentic venues (11 Chattogram, 7 Dhaka, 2 Sylhet) with GPS coordinates and 5,000+ bookings in 1,000-record chunks (`skipDuplicates: true`). Run `npx prisma db seed`.
- [ ] **Step 3 (ML Training & Tree Export):** Update `ml/train_demand_model.py` with strict chronological split (Days 1–45 train / 46–60 test), export `sportzfy-web/lib/rf_trees.json`, and output `ml/model_evaluation_report.md` comparing against baselines.
- [ ] **Step 4 (In-Process Pricing Engine):** Confirm `"resolveJsonModule": true` in `sportzfy-web/tsconfig.json` (already verified active). Implement `getBangladeshDateTimeParts`, `predictDemandScore`, and `calculateDynamicSlotPrice` in `lib/pricing.ts` with safety clamps ($0.80\times - 1.30\times$).
- [ ] **Step 5:** Connect dynamic pricing into `availability/route.ts` and `holds/route.ts`.
- [ ] **Step 6:** Create `app/api/v1/turfs/shelves/route.ts` and render the Foodpanda carousel shelves on `app/page.tsx` and `components/TurfCatalog.tsx`.
- [ ] **Step 7:** Update Owner Dashboard (`app/api/v1/owner/stats/route.ts` & `app/owner/page.tsx`) with dynamic surge/discount suggestions.
- [ ] **Step 8:** Run the 5-layer verification suite:
  1. Python offline evaluation ($R^2 \ge 0.95$, $\text{MAE} \le 0.035$).
  2. `npm test` (all 22 existing + new pricing clamp tests).
  3. `npm run test:concurrency` (hold race condition check).
  4. Bot traffic simulator (`npx tsx scripts/traffic_simulator.ts`).
  5. Production build check (`npm run build`).
