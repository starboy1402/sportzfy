# Final Master Implementation Plan: Sportzfy ML Dynamic Pricing & Foodpanda-Style Discovery Engine

**Target System:** Sportzfy Turf Booking & Facility Governance Platform  
**Academic Affiliation:** Dept. of Computer Science & Engineering, CUET (CSE-355)  
**Methodological Standard:** Chip Huyen, *Designing Machine Learning Systems* (O'Reilly, 2022)  

---

## 1. Executive Summary & Locked Technical Decisions

Through our comprehensive design review, `/grill-me` alignment, and operational safeguards, the following foundational architecture is locked:

1. **Venue Catalog Expansion (from 6 to 20 Turfs):**
   * Expand from 6 to **20 authentic venues** across Chattogram (11), Dhaka (7), and Sylhet (2) with realistic GPS coordinates, amenities, formats (5v5, 6v6, 7v7, Cricket Box), and base prices (৳1,000 – ৳2,000/hr).
2. **Cold-Start Synthetic Seeding (Chip Huyen Ch. 4):**
   * Backfill **5,000+ historical bookings** across 60 days using conditional probabilities matching Bangladesh football habits (Friday/Saturday 85% peak, 8–11 PM prime floodlights, weekday afternoon lulls, monsoon rain cancellations).
   * **Safeguard:** Insert in memory-managed chunks of 500 to 1,000 via `prisma.booking.createMany({ data: chunk, skipDuplicates: true })` to eliminate transaction timeouts.
3. **Data Leakage Defense & Baseline Comparison (Chip Huyen Ch. 5 & 6):**
   * Zero future information leakage. Strict temporal split (first 45 days train / last 15 days test).
   * Evaluate Scikit-Learn `RandomForestRegressor` against two heuristic baselines (Historical Average & If-Else Rules) in `ml/model_evaluation_report.md` ($R^2 \ge 0.95$, $\text{MAE} \le 0.035$).
4. **The Python-to-TypeScript Model Bridge (Chip Huyen Ch. 7, pp. 240–267):**
   * `ml/train_demand_model.py` serializes the trained trees into a compact, lightweight JSON payload (`sportzfy-web/lib/rf_trees.json`).
   * `sportzfy-web/lib/pricing.ts` imports `rf_trees.json` and implements an in-process, iterative tree traversal loop (< 0.1ms latency) for 100% Vercel serverless compatibility.
5. **Human-Centric Safety Clamping (Chip Huyen Ch. 11, pp. 394–398):**
   * Prices strictly clamped between **Floor: $0.80\times$** (covers venue electricity) and **Ceiling: $1.30\times$** (protects player trust).
6. **Schema Consistency & Price Freeze:**
   * Verified: `Hold.price Float` and `Booking.totalAmount Float` are locked in `schema.prisma`. Atomic holds freeze quoted dynamic prices during serializable transactions.
7. **Foodpanda-Style Curated Discovery Shelves:**
   * New API `/api/v1/turfs/shelves` feeding 5 horizontal carousel shelves (*Near You*, *Best Deals*, *Community Favorites*, *Top Picks For You*, *Squads Needing Players*).
8. **5-Layer Pre-Flight Testing:**
   * Offline evaluation &rarr; Unit clamp tests &rarr; Concurrency price freeze test &rarr; Bot simulator &rarr; Local `npm run build`.
9. **No Git Commits:** All changes remain local for user manual testing.

---

## 2. Proposed Changes (Component by Component)

### Component 1: Schema Updates, Expanded Venue Catalog & Fast Batch Seeding

#### [MODIFY] [prisma/schema.prisma](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/prisma/schema.prisma)
- Add `latitude Float?` and `longitude Float?` to `model Turf` to support Haversine distance calculations for Shelf 1 ("Near You").
- **Database Push Requirement:** Run `npx prisma db push && npx prisma generate` to alter the Neon PostgreSQL database table before seeding, ensuring `column "latitude"` exists in the live database.

#### [MODIFY] [prisma/seed.ts](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/prisma/seed.ts)
- Preserve all existing demo accounts (`player@sportzfy.com`, `owner@sportzfy.com`, `admin@sportzfy.com`, `adiba@cuet.com`).
- Seed **20 realistic venues** with GPS coordinates:
  * **Chattogram (11 venues):** Eco Sports Halishahar, Apollo Kazir Dewri, Chandgaon Turf Zone, Khulshi Arena, GEC Circle Futsal, Agrabad Commercial Arena, Nasirabad Green Field, Bayezid Kickoff, Panchlaish Elite, Patenga Coastal Cricket & Turf, CUET Campus Gate Sports Turf.
  * **Dhaka (7 venues):** Dhanmondi Champions, Bashundhara Sports Hub, Uttara Sector 11 Arena, Banani Skyline Rooftop, Mirpur Stadium Turf Club, Mohammadpur Green Pitch, Gulshan Lakeview Ground.
  * **Sylhet (2 venues):** Shahjalal Upashahar Turf, Zindabazar Premier Pitch.
- Generate **5,000+ realistic confirmed bookings** across 60 days.
- **Operational Safeguard:** Batch insert using `prisma.booking.createMany({ data: chunk, skipDuplicates: true })` in chunks of 1,000 records.

---

### Component 2: Python ML Pipeline & Automated Tree Export

#### [MODIFY] [ml/train_demand_model.py](file:///c:/Users/alifs/Downloads/swe_project/ml/train_demand_model.py)
- Features: `day_of_week`, `is_weekend`, `hour_of_day`, `is_prime_hour`, `base_price`, `venue_rating`, `historical_density_4w`, `is_rainy`.
- Split: Temporal train (Days 1–45) / holdout test (Days 46–60).
- Model: `RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)`.
- Evaluation Report (`ml/model_evaluation_report.md`):
  * Compare Random Forest against Baseline 1 (Historical Average) and Baseline 2 (Static Rules).
  * Require $R^2 \ge 0.95$, $\text{MAE} \le 0.035$.
- Model Artifact: Save `ml/models/demand_pricing_rf.joblib`.
- **The Bridge (Tree Export):**
  ```python
  import json
  tree_payload = []
  for estimator in model.estimators_:
      tree = estimator.tree_
      tree_payload.append({
          "left": tree.children_left.tolist(),
          "right": tree.children_right.tolist(),
          "feature": tree.feature.tolist(),
          "threshold": [round(float(t), 4) for t in tree.threshold.tolist()],
          "value": [round(float(v[0][0]), 4) for v in tree.value]
      })
  with open("sportzfy-web/lib/rf_trees.json", "w") as f:
      json.dump(tree_payload, f)
  ```

---

### Component 3: Production In-Process Pricing Engine

#### [NEW] [sportzfy-web/lib/rf_trees.json](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/lib/rf_trees.json)
- Lightweight serialized decision trees generated by `ml/train_demand_model.py`.

#### [MODIFY] [sportzfy-web/lib/pricing.ts](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/lib/pricing.ts)
- Implement in-process tree traversal:
  ```typescript
  import rfTrees from "./rf_trees.json";

  export function predictDemandScore(features: number[]): number {
    let totalScore = 0;
    for (const tree of rfTrees) {
      let node = 0;
      while (tree.feature[node] !== -2) {
        if (features[tree.feature[node]] <= tree.threshold[node]) {
          node = tree.left[node];
        } else {
          node = tree.right[node];
        }
      }
      totalScore += tree.value[node];
    }
    return totalScore / rfTrees.length;
  }
  ```
- Implement `calculateDynamicSlotPrice(basePrice, demandScore, leadTimeHours, weather)`:
  * High demand ($> 0.80$) &rarr; $+৳200$ surge.
  * Low demand ($< 0.45$) &rarr; $-৳200$ off-peak discount.
  * Last-minute incentive ($\le 3$ hrs lead time & unbooked) &rarr; extra $-৳100$ discount.
  * Safety Clamps:
    $$\text{Floor} = \text{round}(\text{basePrice} \times 0.80)$$
    $$\text{Ceiling} = \text{round}(\text{basePrice} \times 1.30)$$
    $$\text{Final Price} = \min(\max(\text{rawPrice}, \text{Floor}), \text{Ceiling})$$
- Export `DynamicPriceResult` containing `basePrice`, `finalPrice`, `demandProbability`, `isSurge`, `isDiscount`, `adjustmentBDT`.

---

### Component 4: Atomic Slot Locking with Dynamic Pricing

#### [MODIFY] [sportzfy-web/app/api/v1/holds/route.ts](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/app/api/v1/holds/route.ts)
- Query `calculateDynamicSlotPrice` during hold creation.
- Persist the locked dynamic rate to `Hold.price` (verified existing `Float` column in `prisma/schema.prisma`).
- Ensure confirmation into `Booking` copies `Hold.price` to `Booking.totalAmount` (price freeze guarantee).

---

### Component 5: Foodpanda-Style Discovery Shelves (API & Web UI)

#### [NEW] [sportzfy-web/app/api/v1/turfs/shelves/route.ts](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/app/api/v1/turfs/shelves/route.ts)
Create unified discovery endpoint returning 5 curated shelves:
1. `"Near You"`: Sorted by Haversine distance from player coordinates.
2. `"Best Deals & Off-Peak Value"`: Pitches with active dynamic discounts (up to 20% off).
3. `"Community Favorites"`: Venues with $\ge 4.7$ stars and top booking counts.
4. `"Top Picks For You"`: Matched against player profile's `preferredFormat` (e.g., 7v7).
5. `"Squads Needing Players"`: Open matchmaking squads with available player slots.

#### [MODIFY] [sportzfy-web/app/page.tsx](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/app/page.tsx) & [components/TurfCatalog.tsx](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/components/TurfCatalog.tsx)
- Render horizontal swipeable/scrollable carousel shelves with visual value badges:
  * Green badge: `🏷️ Best Deal (-৳200 off)`
  * Amber badge: `⚡ High Demand`
  * Format tags: `5v5`, `6v6`, `7v7`, `Cricket`
  * City selector: **Chattogram (11)**, **Dhaka (7)**, **Sylhet (2)**.

---

### Component 6: Turf Owner AI Forecasting Dashboard

#### [MODIFY] [sportzfy-web/app/api/v1/owner/stats/route.ts](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/app/api/v1/owner/stats/route.ts)
- Compute 7-day forward projected occupancy from actual historical distribution.
- Expose actionable recommendations (Surge alert, Discount opportunity).

#### [MODIFY] [sportzfy-web/app/owner/page.tsx](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/app/owner/page.tsx)
- Render the **AI Demand Insight Card** on the Owner Dashboard with one-click *"Apply Surge"* / *"Apply Discount"* action buttons.

---

### Component 7: Automated Bot Traffic Simulator

#### [NEW] [sportzfy-web/scripts/traffic_simulator.ts](file:///c:/Users/alifs/Downloads/swe_project/sportzfy-web/scripts/traffic_simulator.ts)
- Autonomous daemon that authenticates dummy players, queries shelves, locks slots with dynamic pricing, and confirms bookings under simulated concurrency.

---

## 3. 5-Layer Verification & Testing Plan

```
┌──────────────────────────────────────────────────────────┐
│              5-LAYER VERIFICATION PIPELINE               │
├─────────┬────────────────────────────────────────────────┤
│ Layer 1 │ Python Offline Eval: R² ≥ 0.95, MAE ≤ 0.035   │
│ Layer 2 │ Unit Tests: 1,000-input clamp invariance test  │
│ Layer 3 │ Concurrency: Serializable price freeze verify  │
│ Layer 4 │ Traffic Bot: 50 automated simulated sessions   │
│ Layer 5 │ Pre-Flight: npm run build (0 type/bundle errs) │
└─────────┴────────────────────────────────────────────────┘
```

1. **Layer 1: Offline Model Evaluation (`ml/train_demand_model.py`):**
   * Run script; verify $R^2 \ge 0.95$ and $\text{MAE} \le 0.035$ in `ml/model_evaluation_report.md`.
2. **Layer 2: Automated Unit & Invariant Tests (`npm test`):**
   * Test pricing clamps across 1,000 random inputs ($0.80\times \le P \le 1.30\times$).
   * Test shelf API sorting and response structures.
   * Verify all 22 existing tests pass.
3. **Layer 3: Concurrency & Lock Consistency (`npm run test:concurrency`):**
   * Concurrent players competing for dynamic slot &rarr; verify 409 conflict and frozen rate.
4. **Layer 4: Bot Simulator Run:**
   * Run `npx tsx scripts/traffic_simulator.ts` on `http://localhost:3000`. Verify zero 500 errors.
5. **Layer 5: Local Production Build (`npm run build`):**
   * Validate TypeScript types, Prisma client bindings, and Next.js bundle generation.
