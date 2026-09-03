# Sportzfy: Comprehensive Requirement Analysis & Market Validation Report

**Course:** Software Engineering (Sessional) [CSE-355]  
**Department:** Department of Computer Science and Engineering (CSE), CUET  
**Team Members:** Mahmudul Hasan (2204040), Sakib Alif (2204051), Ayan Barua (2204053)  
**Supervisors:** Prof. Mir Md. Saki Kowsar, Md. Refaj Hossan  

---

## 1. Executive Summary & Problem Overview

In Bangladesh, five-a-side and seven-a-side football turfs have become the default venue for casual and competitive matches among students, office groups, and local clubs, especially in cities like Chittagong and Dhaka. Despite high demand, the current booking workflow is manual, fragmented, and plagued by coordination friction.

This report evaluates and validates the requirements for **Sportzfy**—an on-demand real-time turf booking marketplace—by cross-referencing:
1. **22 Social Media Community Screenshots** (`photos/`) from groups such as *Chittagong Turf Zone*, *Chittagong Turf Community*, and *Chittagong Turf Society*.
2. **25-Respondent Quantitative Survey** (`Turf Booking App Feature Survey (Responses).xlsx`) from the CUET community and local players.
3. **The Requirement Analysis Document** (`Sportzfy_Requirement_Analysis.pdf`) and initial proposal (`sportzfy_merged.pdf`).

---

## 2. Ground-Truth Evidence: Qualitative Photo Analysis

Analysis of the 22 community screenshots reveals repetitive, severe bottlenecks that players and turf owners face daily:

| Screenshot | Source Post / Interaction | Real Problem Identified | Validated Sportzfy Feature |
| :--- | :--- | :--- | :--- |
| `10.26.03 PM.jpeg` | *"Ajk rat 8 tai chittagong e kono turf khali hbe football er jonnoh"* *(Is any turf free in CTG tonight at 8 PM?)* | Players have no live visibility into open slots. | **Live Real-Time Slot Availability Grid** |
| `10.26.05 PM (1).jpeg` | *"6 tarik rate 12 am ai time or 1 am ai time ctg er modda kono truf available acha ki ?? 7@7 hole valo hoi !"* | High demand for late-night (12 AM–1 AM) slots and specific formats (7v7). | **Time Slot Filters (Evening/Night) & Pitch Format Filters (6v6 / 7v7)** |
| `10.26.04 PM (1).jpeg`<br>`10.26.04 PM (2).jpeg` | *"any solid liable goalkeeper out there? we have a match tomorrow"*, *"6-7 pm turf e khelar jonno ekjon gk lagbe... chandgaon, tk 150"* | Squads are incomplete (often missing a Goalkeeper) and must recruit strangers via FB. | **Solo Player Matchmaking / Open Roster Hub** |
| `10.26.04 PM (3).jpeg`<br>`10.26.06 PM (3).jpeg` | *"position--GOALKeeper"*, *"Goalkeeper, No age limit"* | Individual players want to play casual football but lack a full team. | **"Join a Match" Player Discovery Board** |
| `10.26.06 PM (1).jpeg` | *"Dominatrix Fc Team Match khelbaa?"* | Teams looking for rival amateur teams to split the turf cost and play. | **Team vs Team Matchmaking Module** |
| `10.26.06 PM (2).jpeg` | *"Kazir dewri apollo turf ty 7v7 khela jai?"* → *"max 6-6"*, *"slot price koto?"* | Turf specs and pricing are hidden, forcing users to ask in comment threads. | **Transparent Turf Specification & Pricing Card** |
| `10.26.05 PM.jpeg` | Eco Sports: *"Pls call or send whatsapp sms for booking... PG 1: 07v07, PG 2: 06v06"* | Venue owners spend all day answering manual phone calls and WhatsApp messages. | **Owner Self-Service Management Dashboard** |
| `10.26.06 PM.jpeg` | *"Chittagong e kothai valo qualityr (master grade) turf pawa jabe? TIA"* | Players are skeptical of artificial grass quality and turf conditions. | **Verified Player Reviews & Quality Badges** |

---

## 3. Quantitative Market Validation: Survey Analysis (25 Respondents)

### Key Metrics & Statistical Distribution

- **Current Booking Behavior (Q3):**
  - Always book via phone call: **60.0% (15/25)**
  - Sometimes book via phone call: **16.0% (4/25)**
  - Visit in person: **16.0% (4/25)**
  - Use other apps: **8.0% (2/25)**
  - *Result:* Over **76%** of players are currently trapped in manual phone booking workflows.

- **Primary Selection Factors (Q2):**
  - Availability / Timing: **40.0% (10/25)**
  - Price: **32.0% (8/25)**
  - Turf Quality: **24.0% (6/25)**
  - Location: **4.0% (1/25)**

- **Preferred Time of Day (Q4):**
  - Night (8 PM onwards): **52.0% (13/25)**
  - Evening (5 PM – 8 PM): **36.0% (9/25)**
  - Afternoon: **12.0% (3/25)**
  - *Result:* **88%** of all turf demand is concentrated in the evening and night.

- **Payment Security & Refund Hesitancy (Q5 & Q15):**
  - **72.0% (18/25)** stated that an automated, transparent refund policy is **"Crucial – I won't pay upfront without an easy refund guarantee"**.
  - **52.0% (13/25)** are willing to pay upfront *only if* the cancellation policy is clear.
  - *Result:* User hesitation regarding upfront payment is tied directly to fears of losing money if games are canceled due to weather or scheduling conflicts.

- **In-App Split Payment (Q6):**
  - Extremely useful – we always split the bill: **76.0% (19/25)**
  - Somewhat useful – nice to have: **16.0% (4/25)**
  - *Result:* **92%** positive response. Essential feature for team sports.

- **Matchmaking & Opponent Finding (Q7):**
  - Yes, frequently look for other teams to play against: **48.0% (12/25)**
  - Maybe occasionally: **32.0% (8/25)**
  - Established friends only: **20.0% (5/25)**
  - *Result:* **80%** addressable user base for matchmaking.

- **1-Click Share Invites (Q11):**
  - Very important – makes coordination much easier: **76.0% (19/25)**
  - Somewhat important: **20.0% (5/25)**
  - *Result:* **96%** critical demand for WhatsApp/Messenger match invite sharing.

- **Equipment Rental Direct via App (Q8):**
  - Yes, often forget or need extra gear: **60.0% (15/25)**
  - Only for specific items like bibs: **20.0% (5/25)**
  - Bring own: **20.0% (5/25)**
  - *Result:* **80%** willingness to rent gear (bibs, balls, goalkeeper gloves) during checkout.

- **AI Weather Forecasts & Rain Alerts (Q13):**
  - Yes, weather ruins our plans frequently: **60.0% (15/25)**
  - Nice to have: **28.0% (7/25)**
  - Not needed: **12.0% (3/25)**

- **Must-Have Facility Filters (Q14):**
  - Clean washrooms and changing rooms: **48.0% (12/25)**
  - Drinking water availability: **32.0% (8/25)**
  - Spectator gallery: **12.0% (3/25)**
  - Parking space: **4.0% (1/25)**

---

## 4. Evaluation of `Sportzfy_Requirement_Analysis.pdf`

The requirement analysis document accurately captured all survey statistics and established high-priority pillars. Key validations and refinements include:

1. **Validation of Pillars:** Core Availability Engine, Split Payments, Matchmaking, Automated Refunds, and Amenities Filters are all verified with high statistical support.
2. **Refinement on Equipment Rental:** The original proposal excluded equipment rentals from the course scope. However, survey data shows 80% demand. The recommended compromise is a **lightweight digital POS selector** inside the booking workflow, leaving physical fulfillment to the venue.
3. **Refinement on Matchmaking:** In addition to team vs team matches, the system should allow **role-based recruitment** (specifically for Goalkeepers).

---

## 5. Feature Prioritization Matrix (MoSCoW Framework)

| Category | Features |
| :--- | :--- |
| **MUST HAVE** | • Real-time slot locking engine (Hold & Release timer)<br>• Search & Filter (Location, 6v6/7v7 format, Price, Time)<br>• Digital Wallet Integration (bKash, Nagad) with Automated Refund Workflow<br>• Turf Owner Management Dashboard (Slot pricing & booking calendar) |
| **SHOULD HAVE** | • In-App Split Payment (Divides total bill among players via payment links)<br>• Matchmaking Hub (Find Opponents & Recruit Goalkeepers/Solo Players)<br>• 1-Click WhatsApp / Messenger Share Invite (Match time, location, split cost)<br>• Equipment Rental Add-ons (Checkboxes for Bibs, Match Ball, Gloves)<br>• Facility Amenities Filter (Washrooms, Drinking Water, Seating) |
| **COULD HAVE** | • AI Weather Forecast & Rain Cancellation Alerts<br>• Loyalty Points & Repeat Booking Discount System<br>• AI Demand Prediction & Dynamic Pricing Suggestions for Owners |
| **WON'T HAVE (Scope Exclusions)** | • Physical gear inventory maintenance (managed on-site by turf owners)<br>• Native mobile app (Android/iOS) — Next.js responsive web app for initial scope |

---

## 6. Proposed Entity-Relationship & Backend Updates

To accommodate the validated features, the PostgreSQL backend schema should include:

1. **`Bookings` Table Extensions:**
   - `split_payment_status`: `ENUM('none', 'pending', 'completed')`
   - `equipment_rented`: `JSONB` (e.g., `{"bibs": 2, "ball": 1}`)
   - `cancellation_reason` & `refund_status`: `ENUM('none', 'requested', 'refunded')`
2. **`Turfs` Table Extensions:**
   - `amenities`: `TEXT[]` (e.g., `['Washroom', 'Water', 'Parking', 'Seating']`)
   - `pitch_formats`: `TEXT[]` (e.g., `['6v6', '7v7']`)
   - `quality_rating`: `DECIMAL(3, 2)`
3. **`SplitPayments` Table (New):**
   - `split_id`, `booking_id`, `player_phone`, `amount_due`, `payment_status`
4. **`MatchRequests` Table (New):**
   - `match_id`, `host_user_id`, `turf_id`, `match_type` (`TeamVsTeam` / `PlayerRecruitment`), `required_role` (`Goalkeeper`, `Any`), `status` (`open`, `filled`)

## 7. What Needs to Be Implemented & Technical Details

Based on the validated requirements and real-world user bottlenecks, here is the complete implementation breakdown across frontend, backend, database, and system workflows:

---

### Module 1: Real-Time Turf Discovery & Dynamic Filtering Engine
- **What to Implement:**
  - **Live Availability Timetable Grid:** An interactive visual matrix showing turf schedules hour-by-hour (e.g., 4 PM to 2 AM), color-coded in real time: 🟢 *Available*, 🟡 *Locked / Pending Payment*, 🔴 *Booked*.
  - **Multi-Parameter Search & Filter Bar:**
    - **Location / Area:** Filter by local zones (e.g., Halishahar, Chandgaon, Kazir Dewri, Khulshi).
    - **Pitch Format:** 5v5, 6v6, 7v7 format toggles.
    - **Time Window Filter:** Afternoon (12 PM–5 PM), Evening (5 PM–8 PM), Night (8 PM–12 AM), Late Night (12 AM–2 AM).
    - **Amenities Checklist Filter:** Clean Washrooms/Changing Rooms, Drinking Water, Spectator Seating, Parking.
    - **Price Range Slider:** Min/Max hourly rate filter.
  - **Turf Detail Profile Page:** High-resolution photo gallery, turf grass specifications (e.g., Master Grade Artificial Turf), Google Maps embed, amenity badges, and verified customer reviews.

---

### Module 2: Concurrency Control & Instant Slot Locking (Hold & Release)
- **What to Implement:**
  - **5-Minute Slot Reservation Lock:** When a user clicks "Book Now", a temporary lock is acquired in Redis / PostgreSQL for 5 minutes (`lock_expires_at = NOW() + 5 minutes`).
  - **Real-Time WebSocket Sync (`/ws/turfs/{turf_id}/slots`):** The instant User A selects a slot, all other users currently viewing that turf grid see the slot switch from 🟢 *Available* to 🟡 *Locked* without refreshing the page.
  - **Automated Celery / Background Release Worker:** If the booking is not completed/paid within 300 seconds, the worker automatically frees the slot back to 🟢 *Available* for other players.

---

### Module 3: Digital Payment Gateway & Automated Refund Policy Engine
- **What to Implement:**
  - **Sandbox Mobile Wallet Integration:** Direct checkout integration with **bKash**, **Nagad**, and **Rocket** payment APIs.
  - **Transparent Automated Refund System:**
    - **100% Refund:** Cancelled > 12 hours prior to the match slot.
    - **50% Refund:** Cancelled between 6 to 12 hours prior to kickoff.
    - **0% Refund:** Cancelled < 6 hours prior to kickoff.
    - **Severe Weather / Rainout Guarantee:** If adverse weather is flagged or verified by the turf owner, an instant 100% refund credit or wallet refund is processed automatically.
  - **Digital Receipt & QR Code Confirmation:** A digital booking pass with a verifiable QR code for venue check-in.

---

### Module 4: In-App Split Payment & 1-Click WhatsApp Invite Sharing
- **What to Implement:**
  - **Bill Split Calculator:** The captain enters the team size (e.g., 10 players) during checkout. The system computes the individual share (e.g., Total 3,000 BDT ÷ 10 = 300 BDT/player) and creates unique payment sub-links.
  - **1-Click WhatsApp / Messenger Share Button:** Formats and copies a match invitation template:
    > *"⚽ **Match Confirmed at Royal Sports Arena!**"*  
    > *"📅 Date: Friday, 8th Aug | ⏰ Time: 8:00 PM – 9:00 PM"*  
    > *"📍 Location: Halishahar (Google Maps: https://maps.google.com/...)"*  
    > *"💰 Your Share: 300 BDT — Pay directly here: https://sportzfy.app/pay/split/xyz123"*
  - **Live Split Tracking Dashboard:** Shows the captain who has paid and who is pending in real time.

---

### Module 5: Matchmaking Hub & Role-Based Player Recruitment
- **What to Implement:**
  - **Team vs Team (Rival Match) Board:** Teams that booked a pitch but have no opponent can post an open challenge for their slot, allowing another amateur team to accept and split the booking fee.
  - **Solo Player & Goalkeeper Recruitment Board:**
    - Captains can post vacant spots with specific role tags (e.g., *Looking for 1 Goalkeeper*, *Looking for 2 Midfielders/Attackers*), stating time, pitch, and cost share.
    - Solo players can set their player profile (Preferred Role: *GK/Defender/Striker*, Skill Level, Availability) and click "Request to Join".
  - **Instant Push & WhatsApp Notifications:** Alert players when an opponent accepts a challenge or when a squad member joins.

---

### Module 6: Equipment Rental Checkout Selector (Digital POS)
- **What to Implement:**
  - **Gear Checkbox Add-ons in Checkout:**
    - Match Ball (+150 BDT)
    - Bibs Set / Colors (+100 BDT)
    - Goalkeeper Gloves (+100 BDT)
  - **Turf Owner Equipment Management:** Turf owners configure available inventory counts and item prices from their dashboard. Gear rented is attached to the booking ticket.

---

### Module 7: Turf Owner & Platform Admin Portals
- **What to Implement:**
  - **Turf Owner Portal:**
    - Self-service turf listing (upload pitch dimensions, photos, format 6v6/7v7, amenities).
    - Custom Slot Pricing Matrix: Set peak pricing (8 PM–12 AM) vs off-peak morning/afternoon pricing.
    - Manual Walk-in Booking Override: Mark slots booked for walk-in/phone customers to keep online inventory accurate.
    - Revenue & Payout Ledger: View earnings, withdrawal requests, and daily occupancy rates.
  - **Super Admin Portal:**
    - Verification and approval of newly registered turfs.
    - User management, dispute resolution, and platform transaction analytics.

---

### Module 8: AI Weather Alert & Intelligent Recommendation Layer
- **What to Implement:**
  - **AI / Weather Forecast API Integration:** Connect with OpenWeatherMap API using the turf's geolocation. Displays real-time rain probability tags on slot cards.
  - **Proactive 3-Hour Rain Warning:** Sends pre-match alerts if rain probability exceeds 70%, suggesting indoor alternatives or initiating cancellation refund options.
  - **Smart Slot Recommendation Engine:** Machine learning / heuristic model analyzing a player’s previous booking hours, favorite pitches, and team sizes to recommend optimal match times and available venues.

