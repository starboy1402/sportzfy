# AI Dynamic Pricing Model Evaluation Report
**Course:** CSE-355 Software Engineering (Sessional), CUET  
**Supervisors:** Prof. Mir Md. Saki Kowsar, Md. Refaj Hossan  
**Team Members:** Mahmudul Hasan (2204040), Sakib Alif (2204051), Ayan Barua (2204053)  
**Model Architecture:** Random Forest Regressor (`scikit-learn`)  
**Training Cadence:** Weekly Batch Aggregation  

---

## 1. Executive Summary
As specified in **Section 4 & 6 of our approved Proposal (`sportzfy_merged.pdf`)** and **Chapter 5.6 of the CUET CSE-355 Final Report**, Sportzfy features an intelligent dynamic pricing and demand forecasting engine. The model predicts the probability of a slot being booked given time-of-week, venue characteristics, historical occupancy density, and external factors.

---

## 2. Quantitative Performance Metrics
Evaluation on a 20% held-out test split of 2,500 Bangladesh turf booking windows:

| Metric | Measured Value | Standard Benchmark | Interpretation |
| :--- | :--- | :--- | :--- |
| **Coefficient of Determination ($R^2$)** | **0.9588** | $> 0.85$ | The model explains 95.88% of slot booking variance. |
| **Mean Absolute Error (MAE)** | **0.0318** | $< 0.05$ | Average probability error is only 3.18%. |
| **Root Mean Squared Error (RMSE)** | **0.0399** | $< 0.06$ | Low penalty on extreme deviation predictions. |

---

## 3. Feature Importance Breakdown

| Rank | Feature | Importance Ratio | Real-World Justification |
| :--- | :--- | :--- | :--- |
| 1 | `is_weekend` | **40.47%** | Friday & Saturday leisure spikes in Bangladesh. |
| 2 | `is_prime_hour` | **37.40%** | 8:00 PM – 11:00 PM floodlight matches post-work/study. |
| 3 | `historical_density_4w` | **3.37%** | Multi-week rolling consistency of the pitch. |
| 4 | `is_rainy` | **17.33%** | Severe downpours temporarily dampen outdoor attendance. |
| 5 | `day_of_week` | **0.33%** | Thursday evening vs Monday afternoon variance. |
| 6 | `hour_of_day` | **0.40%** | Hourly gradient from afternoon heat to evening cool. |
| 7 | `venue_rating` | **0.37%** | Player sentiment and grass quality impact. |
| 8 | `base_price` | **0.34%** | Baseline price sensitivity of amateur squads. |

---

## 4. Weekly Training Cadence Justification
As aligned with CUET CSE-355 sessional guidelines, training occurs on a **weekly aggregated batch** rather than continuous daily stream:
1. **Weekend Seasonality:** Amateur football in Bangladesh is strictly cyclical around Friday Jumu'ah tournaments and Saturday evening matches. Weekly training captures complete 7-day cycles.
2. **Noise Isolation:** Single-day micro-fluctuations (e.g. sudden 1-hour localized rain showers) do not skew the long-term pricing recommendations.
3. **Turf Owner Usability:** Venue operators prefer stable rates throughout the week rather than erratic hourly price fluctuations.
