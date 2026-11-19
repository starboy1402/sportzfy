# Pillar 3: Machine Learning Dynamic Pricing & Yield Management

**Project:** Sportzfy — Real-Time Sports Turf Booking & Squad Matchmaking Marketplace  
**Course:** CSE-356 Software Engineering Sessional, CUET  
**Supervisors:** Prof. Mir Md. Saki Kowsar, Md. Refaj Hossan  
**Authors:** Mohammad Sakib Hasan (2204051), Mahmudul Hasan (2204040), Ayan Barua (2204053)  

---

## 1. Pillar Overview & Executive Summary

Pillar 3 equips Sportzfy with an intelligent yield optimization engine adapted from modern airline and hospitality revenue management, but tailored specifically to the cultural and environmental realities of Bangladesh sports turf facilities.

### The Real-World Problem Solved
1. **The Perishable Inventory Dilemma:** A sports turf operates on fixed hourly capacity ($24\text{ hours} \times 7\text{ days} = 168\text{ slots/week}$). Unlike manufactured goods, an unbooked hour (e.g., Monday 11:00 AM) represents **perishable inventory that generates 0 BDT and is lost forever**.
2. **Extreme Demand Asymmetry:** On Friday and Saturday evenings (8:00 PM – 11:00 PM BST), facilities experience up to 300% booking oversubscription under floodlights. Conversely, weekday morning and midday slots sit 85% vacant.
3. **Price-Gouging Vulnerability:** Unconstrained algorithmic pricing (like ride-sharing surge algorithms) can alienate amateur student athletes with astronomical rates (e.g., ৳4000/hr).

### The Engineering Solution
Sportzfy deploys a **100-Tree Random Forest Regressor** with deterministic safety guardrails:
- Features capture Bangladesh Standard Time (UTC+6), Friday/Saturday weekends, 6:00 PM–11:00 PM floodlight windows, and 4-week rolling occupancy density.
- **In-Process Edge Traversal:** Model decision trees are serialized into JSON and evaluated directly inside the Next.js runtime in **$<0.1\text{ ms}$** without external Python microservice overhead.
- **Ethical Anti-Gouging Guardrails:** Raw multipliers are strictly clamped to $[0.80\times, 1.30\times]$ (maximum 20% discount floor; maximum 30% surge ceiling) and rounded to the nearest 50 BDT note.

---

## 2. Machine Learning Architecture & Feature Engineering

### The 8-Element Canonical Feature Vector ($\mathbf{X}$)

$$\mathbf{X} = \begin{bmatrix}
\text{Index 0: } \text{day\_of\_week} & [0 = \text{Monday}, \dots, 4 = \text{Friday}, 5 = \text{Saturday}, 6 = \text{Sunday}] \\
\text{Index 1: } \text{is\_weekend} & [1 \text{ if Friday (4) or Saturday (5) in Bangladesh, else } 0] \\
\text{Index 2: } \text{hour\_of\_day} & [6 \text{ to } 23 \text{ in Bangladesh Standard Time (Asia/Dhaka, UTC+6)}] \\
\text{Index 3: } \text{is\_prime\_hour} & [1 \text{ if } 18 \le \text{hour} \le 23 \text{ floodlight hours, else } 0] \\
\text{Index 4: } \text{base\_price} & [\text{Owner base hourly rate in BDT, e.g., } 1200 - 2500] \\
\text{Index 5: } \text{venue\_rating} & [4.0 \text{ to } 5.0 \text{ based on user verified reviews}] \\
\text{Index 6: } \text{historical\_density\_4w} & [\text{Rolling 4-week occupancy density: } 0.10 - 0.95] \\
\text{Index 7: } \text{is\_rainy} & [1 \text{ if precipitation detected, else } 0 \text{ (weather penalty)}]
\end{bmatrix}$$

### Strict Chronological Partitioning (Zero Data Leakage)
Unlike naive random cross-validation which mixes future booking trends into past training records, the training pipeline (`ml/train_demand_model.py`) enforces a strict temporal split:
- **Training Set (Days 1 to 45):** 4,500 historical observations.
- **Held-Out Test Set (Days 46 to 60):** 1,500 future observations evaluated strictly out-of-time.

```
Days 1 — 45 (75% Train Partition)           Days 46 — 60 (25% Held-Out Test Partition)
[========================================]   [============]
Fits Tree Node Decision Thresholds           Evaluates Out-of-Time Generalization (Zero Leakage)
```

### Quantitative Performance vs Baselines (Held-out Days 46–60):
| Architecture / Model | MAE | RMSE | $R^2$ Score | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Baseline 1: Historical Mean** | 0.1741 | 0.2085 | -0.002 | Failed |
| **Baseline 2: Static Heuristic Rules** | 0.0520 | 0.0682 | 0.891 | Sub-optimal |
| **Sportzfy Random Forest (Ours)** | **0.0163** | **0.0214** | **0.988** | **Exceeds Target ($R^2 \ge 0.95$)** |

---

## 3. The In-Process Serialization Breakthrough (`<0.1 ms`)

Instead of hosting a slow Python FastAPI microservice that incurs 150–300ms network roundtrips and 3-second serverless cold starts, `ml/train_demand_model.py` serializes all 100 decision trees into `sportzfy-web/lib/rf_trees.json`:

```json
{
  "model_type": "RandomForestRegressor",
  "n_estimators": 100,
  "max_depth": 8,
  "trees": [
    {
      "left": [1, 2, -1, ...],
      "right": [4, 3, -1, ...],
      "feature": [1, 3, -2, ...],
      "threshold": [0.5, 0.5, -2.0, ...],
      "value": [0.45, 0.82, 0.91, ...]
    }
  ]
}
```

### Native TypeScript Tree Traversal (`sportzfy-web/lib/pricing.ts`)
```typescript
export function predictDemandScore(features: number[]): number {
  const trees = parsedModel.trees;
  let totalScore = 0;
  const nTrees = trees.length;

  // Traverse all 100 decision trees in memory
  for (let t = 0; t < nTrees; t++) {
    const tree = trees[t];
    let node = 0;
    // -2 is scikit-learn convention for leaf node
    while (tree.feature[node] !== -2 && node < tree.feature.length) {
      const featIdx = tree.feature[node];
      const featVal = features[featIdx] ?? 0;
      node = featVal <= tree.threshold[node] ? tree.left[node] : tree.right[node];
    }
    totalScore += tree.value[node] ?? 0.5;
  }

  const avgScore = totalScore / nTrees;
  return Math.min(0.98, Math.max(0.05, avgScore));
}
```

---

## 4. Mathematical Anti-Gouging Clamping & Quantization

The demand probability score is linearly mapped to a price multiplier:
$$\text{Multiplier}_{\text{raw}} = 0.70 + (\text{demandScore} \times 0.65)$$

### The Hard Guardrail
```typescript
export const DYNAMIC_PRICING_CLAMPS = {
  MIN_MULTIPLIER: 0.80, // -20% off-peak saver discount
  MAX_MULTIPLIER: 1.30, // +30% peak surge cap
} as const;

// Deterministic Clamping
const clampedMultiplier = Math.min(
  DYNAMIC_PRICING_CLAMPS.MAX_MULTIPLIER,
  Math.max(DYNAMIC_PRICING_CLAMPS.MIN_MULTIPLIER, rawMultiplier)
);

// BDT Currency Quantization (Nearest ৳50 note)
const rawPrice = basePricePerHour * clampedMultiplier;
let finalHourlyRate = Math.round(rawPrice / 50) * 50;

// Clamp Assertion after rounding
const minFloor = Math.floor(basePricePerHour * DYNAMIC_PRICING_CLAMPS.MIN_MULTIPLIER);
const maxCeiling = Math.ceil(basePricePerHour * DYNAMIC_PRICING_CLAMPS.MAX_MULTIPLIER);
finalHourlyRate = Math.min(maxCeiling, Math.max(minFloor, finalHourlyRate));
```

---

## 5. Turf Owner Dynamic Yield Dashboard (`/api/v1/owner/ai-pricing`)

1. **Simulation (`GET /api/v1/owner/ai-pricing`)**:
   - Calculates 7-day hourly rates.
   - Computes **Projected Monthly Uplift** (e.g., $+18\%$ revenue, $+\text{৳}25,000$ BDT/month).
   - Generates human-readable strategic insights:
     - *"Friday & Saturday Prime Floodlight: Surge to ৳1800/hr (+20%) captures untapped willingness-to-pay."*
     - *"Sunday to Thursday Baseline: ৳1400/hr discount maintains steady student booking volume."*
2. **One-Click Timetable Synchronization (`POST /api/v1/owner/ai-pricing`)**:
   - `action === "APPLY"`: Upserts the 7-day `AvailabilityRule` table in PostgreSQL.
   - `action === "RESET"`: Reverts all 7 days to the flat `basePricePerHour`.

---

## 6. Viva Voce Defense Cheat Sheet

> **Q: Why didn't you use an external Python microservice (Flask/FastAPI) to serve the model?**  
> **A:** *"An external Python server creates network latency (150–300 ms round trip) and cold starts (2–5 seconds) on every price quote. By serializing our Scikit-Learn tree weights into JSON, our Next.js edge handler traverses all 100 trees natively in memory in $<0.08\text{ ms}$ (verified by test `TC-ML-PRICE-01`), guaranteeing zero network latency and zero infrastructure overhead."*

> **Q: How do you prevent daylight saving time or UTC server offsets from corrupting price calculations?**  
> **A:** *"Our function `getBangladeshDateTimeParts()` applies a fixed $+6\text{ hour}$ epoch shift (`Asia/Dhaka`, UTC+6). Because Bangladesh does not observe daylight saving time, the offset is permanently fixed. Tested in `TC-PRICE-03` and `TC-ML-PRICE-04`, 14:00 UTC is reliably evaluated as 20:00 BST (8 PM peak floodlight hour), regardless of whether the server is hosted in Singapore, London, or the US."*
