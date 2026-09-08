# AI Dynamic Pricing Model Evaluation Report
**Course:** CSE-355 Software Engineering (Sessional), CUET  
**Supervisors:** Prof. Mir Md. Saki Kowsar, Md. Refaj Hossan  
**Team Members:** Mahmudul Hasan (2204040), Sakib Alif (2204051), Ayan Barua (2204053)  
**Model Architecture:** Random Forest Regressor (`scikit-learn`, `n_estimators=100`, `max_depth=8`)  
**Serving Paradigm:** Native In-Process TypeScript Inference via Serialized Decision Trees (`lib/rf_trees.json`, < 0.1ms latency)  
**Partitioning Strategy:** Strict Chronological Temporal Split (Days 1–45 Train, Days 46–60 Test — Zero Future Leakage)

---

## 1. Executive Summary
As specified in **Section 4 & 6 of our approved Proposal** and **Chapter 5.6 of the CUET CSE-355 Final Report**, Sportzfy features an intelligent dynamic pricing and demand forecasting engine. The model predicts the probability of slot booking given time-of-week, venue characteristics, rolling occupancy density, and environmental conditions.

To resolve serverless cold starts and multi-service HTTP roundtrips on Vercel/Node.js, the model weights are exported directly into an in-process JSON tree payload, which is traversed natively in TypeScript in $< 0.1$ms.

---

## 2. Chronological Data Partitioning (Zero Data Leakage)
Unlike naive random shuffling (`train_test_split`), which leaks future market trends into past training records, Sportzfy implements a **strict chronological temporal split**:
- **Training Set (Days 1–45, ~75% of observations):** 4,500+ records used to fit tree node decision thresholds.
- **Held-Out Test Set (Days 46–60, ~25% of observations):** 1,400+ future records evaluated strictly out-of-time.

---

## 3. Quantitative Performance Comparison vs Baselines
Evaluation on the held-out future test partition (Days 46–60):

| Architecture / Model | MAE | RMSE | $R^2$ Score | Interpretation |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline 1: Historical Mean** | 0.1680 | 0.1970 | -0.0011 | Naive static mean of past bookings. |
| **Baseline 2: Static Heuristic Rules** | 0.0629 | 0.0771 | 0.8465 | Standard peak/weekend pricing heuristics. |
| **Sportzfy Random Forest (Ours)** | **0.0167** | **0.0210** | **0.9887** | Explains **98.87%** of slot demand variance. |

**Success Criteria Validation:**
- **Target $R^2 \ge 0.95$**: Achieved **0.9887** (Passed)
- **Target $\text{MAE} \le 0.035$**: Achieved **0.0167** (Passed)

---

## 4. Feature Importance Breakdown (Gini Impurity Reduction)

| Rank | Feature Index | Feature Name | Importance Ratio | Real-World Justification |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 1 | `is_weekend` | **44.19%** | Friday & Saturday leisure spikes in Bangladesh. |
| 2 | 3 | `is_prime_hour` | **25.30%** | 6:00 PM – 11:00 PM floodlight matches post-work/study. |
| 3 | 6 | `historical_density_4w` | **3.06%** | 4-week rolling occupancy consistency. |
| 4 | 7 | `is_rainy` | **13.06%** | Monsoon downpours dampen outdoor attendance. |
| 5 | 0 | `day_of_week` | **0.02%** | Thursday night anticipation vs Monday afternoon lull. |
| 6 | 2 | `hour_of_day` | **13.74%** | Diurnal curve from daytime heat to evening floodlights. |
| 7 | 5 | `venue_rating` | **0.61%** | Player sentiment and pitch quality premium. |
| 8 | 4 | `base_price` | **0.03%** | Baseline price sensitivity of amateur squads. |

---

## 5. Architectural Implementation: Native In-Process Inference
To meet production SLA requirements:
1. **Serialization:** All 100 decision trees (`children_left`, `children_right`, `feature`, `threshold`, `value`) are serialized into `sportzfy-web/lib/rf_trees.json`.
2. **In-Process Traversal:** `sportzfy-web/lib/pricing.ts` imports the JSON structure and evaluates leaf nodes in a compact 20-line loop.
3. **Guaranteed Safety:** Raw dynamic prices are constrained by hard clamps:
   $$\text{Clamped Price} = \text{round}\left(\text{clamp}\left(P_{\text{raw}}, 0.80 \times P_{\text{base}}, 1.30 \times P_{\text{base}}\right)\right)$$
