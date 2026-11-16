# Sportzfy — Complete Engineering Diagrams Collection
**Course:** CSE-355 Software Engineering (Sessional)  
**Department:** Computer Science & Engineering, CUET  
**Supervisors:** Prof. Mir Md. Saki Kowsar, Md. Refaj Hossan  
**Authors:** Mahmudul Hasan (2204040), Sakib Alif (2204051), Ayan Barua (2204053)  
**Reference Guideline:** `SWE_Final_Report_Guidelines_v1.0.pdf`  

---

## Table of Diagram Categories

1. [System-Wide Foundation Diagrams (Master Use Case, Class Diagram, ERD)](#1-system-wide-foundation-diagrams)
2. [Pillar 1: 5-Minute Atomic Slot Hold & Hijack Defense (Use Case, Activity, Sequence)](#2-pillar-1-atomic-slot-hold--concurrency-defense)
3. [Pillar 2: Community Squad Recruitment & Matchmaking (Use Case, Activity, Sequence)](#3-pillar-2-squad-recruitment--matchmaking)
4. [Pillar 3: Random Forest ML Dynamic Pricing Engine (Use Case, Activity, Sequence)](#4-pillar-3-machine-learning-dynamic-pricing)
5. [Pillar 4: AI Conversational Booking Concierge (Use Case, Activity, Sequence)](#5-pillar-4-ai-conversational-concierge)
6. [Architectural & Pipeline Diagrams (System Architecture, AI Architecture, CI/CD, Deployment)](#6-architecture--pipeline-diagrams)
7. [Project Management & UX Flows (Gantt Schedule, GUI User Journey)](#7-project-management--ui-flow-diagrams)

---

# 1. System-Wide Foundation Diagrams

### Diagram 1: Master System Use Case Diagram (Section 3.2)
*Covers all three primary actors (`Player`, `Turf Owner`, `Platform Admin`) and core system boundary interactions.*

```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart LR
    Player(("Player / Customer"))
    Owner(("Turf Owner"))
    Admin(("Platform Admin"))

    subgraph SystemBoundary["Sportzfy Platform Boundary"]
        UC1["Browse Turfs & Filter Formats"]
        UC2["Acquire 5-Min Atomic Slot Hold"]
        UC3["Instant Checkout via bKash/Nagad"]
        UC4["Query AI Natural Language Concierge"]
        UC5["Create Squad Recruitment Post"]
        UC6["Apply to Join Match with Role"]
        UC7["Manage Turf Specs & Pricing"]
        UC8["Sync AI Dynamic Pricing Schedule"]
        UC9["Block Maintenance Intervals"]
        UC10["Request Revenue Withdrawal"]
        UC11["Review Turf Registration Submissions"]
        UC12["Settle Owner Payout Disbursements"]
        UC13["Monitor Platform Telemetry & Logs"]
    end

    Player --> UC1
    Player --> UC2
    Player --> UC3
    Player --> UC4
    Player --> UC5
    Player --> UC6

    Owner --> UC7
    Owner --> UC8
    Owner --> UC9
    Owner --> UC10

    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
```

---

### Diagram 2: Static Model — Complete Domain Class Diagram (Section 3.4)
*Complete object-oriented domain model displaying core entities, service controllers, attributes, methods, and multiplicities.*

```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
    direction TB

    class User {
        +String id
        +String email
        +String name
        +String phone
        +Role role
        +DateTime createdAt
        +register()
        +login()
    }

    class Profile {
        +String id
        +String userId
        +String preferredCity
        +String favoritePosition
        +String bio
        +updateProfile()
    }

    class Turf {
        +String id
        +String name
        +String city
        +String area
        +String pitchFormats
        +Int basePricePerHour
        +TurfStatus status
        +Float rating
        +calculateSlotRate()
    }

    class AvailabilityRule {
        +String id
        +String turfId
        +Int dayOfWeek
        +String startTime
        +String endTime
        +Int pricePerHour
        +Boolean isAvailable
    }

    class BlockedInterval {
        +String id
        +String turfId
        +DateTime startUtc
        +DateTime endUtc
        +String reason
    }

    class Hold {
        +String id
        +String turfId
        +String userId
        +DateTime startUtc
        +DateTime endUtc
        +DateTime expiresAt
        +HoldStatus status
        +isExpired() Boolean
    }

    class Booking {
        +String id
        +String turfId
        +String userId
        +DateTime startUtc
        +DateTime endUtc
        +Int totalPrice
        +PaymentStatus paymentStatus
        +String qrCodePass
    }

    class MatchPost {
        +String id
        +String turfId
        +String hostUserId
        +DateTime matchTime
        +String sportFormat
        +String requiredRole
        +Int openSpots
        +Int costPerPlayer
        +MatchStatus status
        +decrementSpots()
    }

    class MatchRequest {
        +String id
        +String matchPostId
        +String applicantId
        +String playerRole
        +RequestStatus status
        +accept()
        +reject()
    }

    class PayoutRequest {
        +String id
        +String ownerId
        +Int amount
        +PayoutMethod method
        +PayoutStatus status
        +disburse()
    }

    class PricingEngine {
        +calculateDynamicSlotPrice(turf, startUtc) Int
        +predictSurgeMultiplier(features) Float
        +applySafetyClamps(rate, base) Int
    }

    class AiChatService {
        +analyzeWithGroq(query, history) AiAnalysis
        +analyzeWithGemini(query, history) AiAnalysis
        +queryGroundedActionCards(intent, filters) ActionCard[]
    }

    User "1" -- "1" Profile : has
    User "1" -- "0..*" Turf : owns
    User "1" -- "0..*" Hold : acquires
    User "1" -- "0..*" Booking : completes
    User "1" -- "0..*" MatchPost : hosts
    User "1" -- "0..*" MatchRequest : submits
    User "1" -- "0..*" PayoutRequest : requests

    Turf "1" -- "0..*" AvailabilityRule : defines
    Turf "1" -- "0..*" BlockedInterval : blocks
    Turf "1" -- "0..*" Hold : locks
    Turf "1" -- "0..*" Booking : schedules
    Turf "1" -- "0..*" MatchPost : accommodates

    MatchPost "1" -- "0..*" MatchRequest : receives

    PricingEngine ..> Turf : evaluates
    AiChatService ..> Turf : queries
    AiChatService ..> MatchPost : queries
```

---

### Diagram 3: Database Entity-Relationship (ER) Diagram (Section 5.3)
*Crow's Foot Relational Schema covering all 11 tables in Neon PostgreSQL with primary keys, foreign keys, and cardinalities.*

```mermaid
%%{init: {'theme': 'neutral'}}%%
erDiagram
    User ||--o| Profile : "has (1:1)"
    User ||--o{ Turf : "owns (1:N)"
    User ||--o{ Hold : "acquires (1:N)"
    User ||--o{ Booking : "books (1:N)"
    User ||--o{ MatchPost : "hosts (1:N)"
    User ||--o{ MatchRequest : "submits (1:N)"
    User ||--o{ PayoutRequest : "requests (1:N)"
    User ||--o{ Review : "writes (1:N)"

    Turf ||--o{ AvailabilityRule : "defines (1:N)"
    Turf ||--o{ BlockedInterval : "schedules (1:N)"
    Turf ||--o{ Hold : "locks (1:N)"
    Turf ||--o{ Booking : "reserves (1:N)"
    Turf ||--o{ MatchPost : "hosts (1:N)"
    Turf ||--o{ Review : "receives (1:N)"

    MatchPost ||--o{ MatchRequest : "contains (1:N)"

    User {
        string id PK "cuid"
        string email UK
        string passwordHash
        string name
        string phone
        string role "PLAYER | OWNER | ADMIN"
        datetime createdAt
    }

    Profile {
        string id PK "cuid"
        string userId FK
        string preferredCity
        string favoritePosition
        string bio
    }

    Turf {
        string id PK "cuid"
        string ownerId FK
        string name
        string city
        string area
        string pitchFormats
        int basePricePerHour
        string status "PENDING | APPROVED | REJECTED"
        float rating
        string coverImage
    }

    AvailabilityRule {
        string id PK "cuid"
        string turfId FK
        int dayOfWeek "0=Sun..6=Sat"
        string startTime "HH:mm"
        string endTime "HH:mm"
        int pricePerHour
        boolean isAvailable
    }

    BlockedInterval {
        string id PK "cuid"
        string turfId FK
        datetime startUtc
        datetime endUtc
        string reason
    }

    Hold {
        string id PK "cuid"
        string turfId FK
        string userId FK
        datetime startUtc
        datetime endUtc
        datetime expiresAt
        string status "ACTIVE | RELEASED | CONVERTED"
    }

    Booking {
        string id PK "cuid"
        string turfId FK
        string userId FK
        datetime startUtc
        datetime endUtc
        int totalPrice
        string paymentStatus "PENDING | PAID | REFUNDED"
        string paymentMethod "BKASH | NAGAD | CARD"
        string transactionRef
        string qrCodePass
    }

    MatchPost {
        string id PK "cuid"
        string turfId FK
        string hostUserId FK
        datetime matchTime
        string sportFormat "5v5 | 6v6 | 7v7"
        string requiredRole "Goalkeeper | Striker | etc"
        int openSpots
        int costPerPlayer
        string status "OPEN | FILLED | CANCELLED"
    }

    MatchRequest {
        string id PK "cuid"
        string matchPostId FK
        string applicantId FK
        string playerRole
        string status "PENDING | ACCEPTED | REJECTED"
    }

    PayoutRequest {
        string id PK "cuid"
        string ownerId FK
        int amount
        string method "BKASH | NAGAD"
        string accountNumber
        string status "PENDING | DISBURSED | REJECTED"
        string transactionRef
    }

    Review {
        string id PK "cuid"
        string turfId FK
        string userId FK
        int rating
        string comment
    }
```

---

# 2. Pillar 1: Atomic Slot Hold & Concurrency Defense

### Diagram 4: Feature 1 Use Case Diagram (Section 3.2)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart LR
    Player(("Player"))
    Worker(("Auto-Release Cron"))

    subgraph Feature1Boundary["Pillar 1: Atomic Slot Hold & Hijacking Defense"]
        UC101["Inspect Turf Timetable Grid"]
        UC102["Request 5-Minute Slot Hold Lock"]
        UC103["Reject Concurrent Collision (HTTP 409)"]
        UC104["Track Real-Time 5-Min Countdown"]
        UC105["Complete Checkout Payment"]
        UC106["Auto-Release Expired Hold to Pool"]
    end

    Player --> UC101
    Player --> UC102
    UC102 -.->|"collision detected"| UC103
    Player --> UC104
    Player --> UC105
    Worker --> UC106
```

---

### Diagram 5: Feature 1 Activity Diagram with Swimlanes (Section 3.3)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
    subgraph PlayerLane["Player Browser"]
        A1["Click available slot on Timetable"]
        A2["Submit POST /api/v1/holds"]
        A3["Display 5-Minute Countdown Timer"]
        A4["Submit Payment details (bKash/Nagad)"]
        A5["Show Double-Booking Error Alert (409)"]
        A6["Show Slot Expired Alert"]
    end

    subgraph ServerLane["Next.js Serverless Gateway"]
        B1["Validate slot interval & auth session"]
        B2["Begin Prisma $transaction"]
        B3{"Check conflicting ACTIVE Hold or Booking"}
        B4["Create Hold (status=ACTIVE, TTL=5min)"]
        B5["Commit Transaction & Return Hold ID (201)"]
        B6["Rollback & Return 409 Conflict"]
        B7{"Verify hold still ACTIVE & not expired"}
        B8["Convert Hold to CONFIRMED Booking"]
    end

    subgraph DatabaseLane["Neon PostgreSQL Singapore"]
        C1[("Holds & Bookings Table")]
    end

    A1 --> A2
    A2 --> B1
    B1 --> B2
    B2 --> B3
    B3 -- "Overlap Found" --> B6
    B6 --> A5
    B3 -- "Slot Free" --> B4
    B4 --> C1
    C1 --> B5
    B5 --> A3
    A3 --> A4
    A4 --> B7
    B7 -- "Expired (>5 min)" --> A6
    B7 -- "Valid (<5 min)" --> B8
    B8 --> C1
```

---

### Diagram 6: Feature 1 Sequence Diagram (Section 3.5 & `TC-HOLD-01`)
*Demonstrates simultaneous race-condition resolution between Player A and Player B.*

```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
    autonumber
    actor PlayerA as Player A (Sakib)
    actor PlayerB as Player B (Competitor)
    participant Client as Next.js Web Client
    participant HoldAPI as /api/v1/holds
    participant DB as Neon PostgreSQL (Singapore)

    Note over PlayerA,PlayerB: Simultaneous request for Friday 8 PM slot
    par Concurrent Execution via Promise.all()
        PlayerA->>HoldAPI: POST /holds (slot: 20:00-21:00)
        PlayerB->>HoldAPI: POST /holds (slot: 20:00-21:00)
    end

    HoldAPI->>DB: BEGIN $transaction (SERIALIZABLE)
    HoldAPI->>DB: SELECT * FROM Hold WHERE slot overlaps AND status = 'ACTIVE'

    Note over DB: Database row lock acquired for Player A first
    DB-->>HoldAPI: 0 overlapping records found
    HoldAPI->>DB: INSERT INTO Hold (userId=A, status='ACTIVE', expiresAt=now()+5m)
    DB-->>HoldAPI: Transaction Committed (Hold ID: cmw0t4...)
    HoldAPI-->>PlayerA: HTTP 201 Created (Lock Granted, 5-min timer starts)

    Note over DB: Player B's concurrent transaction evaluates
    HoldAPI->>DB: BEGIN $transaction (SERIALIZABLE)
    HoldAPI->>DB: SELECT * FROM Hold WHERE slot overlaps AND status = 'ACTIVE'
    DB-->>HoldAPI: Found active hold cmw0t4...
    HoldAPI->>DB: ROLLBACK Transaction
    HoldAPI-->>PlayerB: HTTP 409 Conflict (SLOT_HELD_BY_ANOTHER)
    PlayerB-->>Client: Display "Slot currently reserved by another player"
```

---

# 3. Pillar 2: Squad Recruitment & Matchmaking

### Diagram 7: Feature 2 Use Case Diagram (Section 3.2)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart LR
    Host(("Squad Host / Captain"))
    Applicant(("Solo Player / Applicant"))

    subgraph Feature2Boundary["Pillar 2: Community Squad Recruitment & Matchmaking"]
        UC201["Host New Match Roster (Format & Needed Roles)"]
        UC202["Browse Open Matches by City & Position"]
        UC203["Submit Join Request with Role Selection"]
        UC204["Review Applicant Profile & Position"]
        UC205["Accept Applicant (Decrement Open Spots)"]
        UC206["Reject Applicant (Allow Clean Re-Apply)"]
    end

    Host --> UC201
    Applicant --> UC202
    Applicant --> UC203
    Host --> UC204
    Host --> UC205
    Host --> UC206
```

---

### Diagram 8: Feature 2 Activity Diagram with Swimlanes (Section 3.3)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
    subgraph HostLane["Squad Host"]
        H1["Post Squad Match (e.g. 6v6, Seeking GK)"]
        H2["View Applicant Notification"]
        H3{"Accept or Reject Decision"}
        H4["Mark Request: ACCEPTED"]
        H5["Mark Request: REJECTED"]
    end

    subgraph ApplicantLane["Solo Applicant"]
        P1["Search matches filtered by role: Goalkeeper"]
        P2["Submit Join Application with selected role"]
        P3["Receive Acceptance & Split Payment link"]
        P4["Receive Notification & Can Re-Apply"]
    end

    subgraph ServerLane["Matchmaking Controller & Neon DB"]
        S1["Create MatchPost (status=OPEN, openSpots=1)"]
        S2["Validate applicant is not already in squad"]
        S3["Create MatchRequest (status=PENDING)"]
        S4["Decrement openSpots by 1"]
        S5{"Are openSpots == 0?"}
        S6["Update MatchPost status to FILLED"]
        S7["Keep MatchPost OPEN"]
    end

    H1 --> S1
    S1 --> P1
    P1 --> P2
    P2 --> S2
    S2 --> S3
    S3 --> H2
    H2 --> H3
    H3 -- "Accept" --> H4
    H4 --> S4
    S4 --> S5
    S5 -- "Yes" --> S6
    S5 -- "No" --> S7
    S6 --> P3
    S7 --> P3
    H3 -- "Reject" --> H5
    H5 --> P4
```

---

### Diagram 9: Feature 2 Sequence Diagram (Section 3.5 & `TC-MATCH-02`)
```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
    autonumber
    actor Applicant as Solo Player (Goalkeeper)
    actor Host as Squad Captain
    participant MatchAPI as /api/v1/matches
    participant DB as Neon PostgreSQL

    Applicant->>MatchAPI: POST /matches/{id}/join (role: "Goalkeeper")
    MatchAPI->>DB: SELECT * FROM MatchPost WHERE id = {id} AND openSpots > 0
    DB-->>MatchAPI: Match found (openSpots: 1, requiredRole: "Goalkeeper")
    MatchAPI->>DB: INSERT INTO MatchRequest (status: 'PENDING', role: 'Goalkeeper')
    DB-->>MatchAPI: Request created (ID: req_981)
    MatchAPI-->>Applicant: HTTP 201 Created (Application Submitted)

    Host->>MatchAPI: POST /matches/{id}/requests/req_981/decision (decision: "ACCEPT")
    MatchAPI->>DB: BEGIN $transaction
    MatchAPI->>DB: UPDATE MatchRequest SET status = 'ACCEPTED' WHERE id = 'req_981'
    MatchAPI->>DB: UPDATE MatchPost SET openSpots = openSpots - 1 WHERE id = {id}
    MatchAPI->>DB: UPDATE MatchPost SET status = 'FILLED' WHERE openSpots = 0
    DB-->>MatchAPI: Transaction Committed
    MatchAPI-->>Host: HTTP 200 OK (Player joined squad)
    MatchAPI-->>Applicant: Notification: Accepted into Friday Night Futsal
```

---

# 4. Pillar 3: Machine Learning Dynamic Pricing

### Diagram 10: Feature 3 Use Case Diagram (Section 3.2)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart LR
    Owner(("Turf Owner"))
    Engine(("Random Forest ML Engine"))

    subgraph Feature3Boundary["Pillar 3: ML Dynamic Pricing & Safety Clamping"]
        UC301["View 7-Day Revenue & Demand Heatmap"]
        UC302["Trigger 'Apply AI Recommended Rates'"]
        UC303["Derive Features (BST Hour, Weekend, Demand)"]
        UC304["Enforce Floor Clamp (0.80x) & Ceiling Clamp (1.30x)"]
        UC305["Sync AI AvailabilityRules to Database"]
        UC306["One-Click Revert to Base Price"]
    end

    Owner --> UC301
    Owner --> UC302
    UC302 --> Engine
    Engine --> UC303
    Engine --> UC304
    UC304 --> UC305
    Owner --> UC306
```

---

### Diagram 11: Feature 3 Activity Diagram with Swimlanes (Section 3.3)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
    subgraph OwnerLane["Turf Owner Schedule UI"]
        O1["Click 'Apply 7-Day AI Dynamic Pricing'"]
        O2["View updated rate cards with surge/discount badges"]
        O3["Optionally click 'Revert to Base Rates'"]
    end

    subgraph MLLane["In-Process Random Forest Engine"]
        M1["Extract features from slot timestamp in BST (UTC+6)"]
        M2["Compute: isWeekend (Fri/Sat), isFloodlit (18-23), baseDemand"]
        M3["Traverse ensemble decision trees to obtain predicted multiplier"]
        M4{"Is multiplier < 0.80x floor?"}
        M5["Clamp multiplier to exactly 0.80x (-20% limit)"]
        M6{"Is multiplier > 1.30x ceiling?"}
        M7["Clamp multiplier to exactly 1.30x (+30% limit)"]
        M8["Retain predicted multiplier"]
        M9["Compute: finalRate = round(baseRate * multiplier, -1)"]
    end

    subgraph DBLane["Neon PostgreSQL"]
        D1["Delete old AI rules & upsert new 7-day AvailabilityRules"]
    end

    O1 --> M1
    M1 --> M2
    M2 --> M3
    M3 --> M4
    M4 -- "Yes" --> M5
    M4 -- "No" --> M6
    M6 -- "Yes" --> M7
    M6 -- "No" --> M8
    M5 --> M9
    M7 --> M9
    M8 --> M9
    M9 --> D1
    D1 --> O2
    O2 --> O3
```

---

### Diagram 12: Feature 3 Sequence Diagram (Section 3.5 & `TC-AI-PRICE-01`)
```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
    autonumber
    actor Owner as Turf Owner
    participant ScheduleUI as Owner Schedule Page
    participant PricingAPI as /api/v1/owner/ai-pricing
    participant ML as RandomForestEngine (In-Process)
    participant DB as Neon PostgreSQL

    Owner->>ScheduleUI: Click "Sync AI Rates for Next 7 Days"
    ScheduleUI->>PricingAPI: POST /api/v1/owner/ai-pricing (turfId: "cmttm6...")
    PricingAPI->>DB: SELECT * FROM Turf WHERE id = "cmttm6..." AND ownerId = {authId}
    DB-->>PricingAPI: Turf found (basePrice: 1500 BDT)

    loop For each hour slot in upcoming 7 days (168 intervals)
        PricingAPI->>ML: calculateDynamicSlotPrice(turf, targetTimeUtc)
        ML->>ML: Derive BST features (e.g. Fri 21:00 -> isWeekend=true, hour=21)
        ML->>ML: Tree inference -> Raw multiplier = 1.35x
        ML->>ML: Safety Clamp: min(1.35x, 1.30x) = 1.30x ceiling
        ML-->>PricingAPI: Calculated Price = 1950 BDT (+30% surge)
    end

    PricingAPI->>DB: BEGIN $transaction
    PricingAPI->>DB: DELETE FROM AvailabilityRule WHERE turfId = {id}
    PricingAPI->>DB: INSERT INTO AvailabilityRule (168 synced AI rates)
    DB-->>PricingAPI: Transaction Committed
    PricingAPI-->>ScheduleUI: HTTP 200 OK (168 AI rate slots generated)
    ScheduleUI-->>Owner: Displays timetable with discount (-) and surge (+) indicator badges
```

---

# 5. Pillar 4: AI Conversational Concierge

### Diagram 13: Feature 4 Use Case Diagram (Section 3.2)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart LR
    User(("Player / Customer"))
    Groq(("Groq LPU API"))
    Gemini(("Google Gemini Flash"))
    LocalNLU(("Local NLU Engine"))

    subgraph Feature4Boundary["Pillar 4: Grounded AI Concierge"]
        UC401["Submit Query in English or Banglish"]
        UC402["Classify Intent (TURF_SEARCH, MATCH, FAQ, PRICING)"]
        UC403["Extract Entities (City, Format, MaxPrice, Role)"]
        UC404["Query Live Neon DB for Real Venues & Matches"]
        UC405["Render Interactive Action Cards with Book Links"]
        UC406["Bypass to Fallback Engine on Rate Limit / Outage"]
    end

    User --> UC401
    UC401 --> UC402
    UC402 --> Groq
    Groq -.->|"fails/quota"| Gemini
    Gemini -.->|"fails/offline"| LocalNLU
    UC402 --> UC403
    UC403 --> UC404
    UC404 --> UC405
    UC405 --> User
    Groq --> UC406
    Gemini --> UC406
```

---

### Diagram 14: Feature 4 Activity Diagram with Swimlanes (Section 3.3)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
    subgraph ClientLane["User Browser / AiChatbot.tsx"]
        U1["User types: 'Bhai ajke raate 6v6 kono turf ache 1600 er moddhe?'"]
        U2["Render typing shimmer indicator"]
        U3["Render natural reply + Clickable Turf Action Cards"]
    end

    subgraph GatewayLane["Next.js /api/v1/ai/chat"]
        G1["Receive message & start latency stopwatch"]
        G2{"Is GROQ_API_KEY available?"}
        G3["Call Groq LPU (qwen3.8-27b) with 4s timeout"]
        G4{"Did Groq return valid JSON?"}
        G5{"Is GEMINI_API_KEY available?"}
        G6["Call Gemini 3.5 Flash with 6s timeout"]
        G7{"Did Gemini return valid JSON?"}
        G8["Execute Local Deterministic Regex NLU Engine"]
        G9{"Evaluate Extracted Intent"}
    end

    subgraph DataLane["Prisma / Neon PostgreSQL"]
        D1["Query approved turfs matching extracted filters"]
        D2["Query open matches matching required role"]
        D3["Synthesize Action Cards with direct /turfs/id book links"]
    end

    U1 --> G1
    G1 --> G2
    G2 -- "Yes" --> G3
    G2 -- "No" --> G5
    G3 --> G4
    G4 -- "Success (<800ms)" --> G9
    G4 -- "Error/Timeout" --> G5
    G5 -- "Yes" --> G6
    G5 -- "No" --> G8
    G6 --> G7
    G7 -- "Success" --> G9
    G7 -- "Error/Timeout" --> G8
    G8 --> G9

    G9 -- "TURF_SEARCH" --> D1
    G9 -- "MATCH_SEARCH" --> D2
    G9 -- "FAQ / PRICING" --> U3
    D1 --> D3
    D2 --> D3
    D3 --> U3
```

---

### Diagram 15: Feature 4 Sequence Diagram (Section 3.5 & `TC-AI-CHAT-01`)
```mermaid
%%{init: {'theme': 'neutral'}}%%
sequenceDiagram
    autonumber
    actor User as Player (Sakib)
    participant ChatUI as AiChatbot.tsx (Client)
    participant Route as /api/v1/ai/chat (Serverless)
    participant Groq as Groq LPU (Qwen 3.8 27B)
    participant DB as Neon PostgreSQL (Singapore)

    User->>ChatUI: Types "Show me 6v6 turfs in Halishahar under 1800 BDT"
    ChatUI->>Route: POST /api/v1/ai/chat (body: { messages })

    Note over Route,Groq: Primary Ultra-Fast Engine Invocation (~740ms)
    Route->>Groq: POST /chat/completions (model: "qwen/qwen3.8-27b", response_format: json)
    Groq-->>Route: HTTP 200 OK (intent: "TURF_SEARCH", format: "6v6", area: "Halishahar", maxPrice: 1800)

    Note over Route,DB: Real-Time Relational Database Grounding
    Route->>DB: prisma.turf.findMany({ city: "Chattogram", area: "Halishahar", price <= 1800 })
    DB-->>Route: Returns 3 turfs: Eco Sports (1400 BDT), etc.

    Route->>Route: Assemble Action Cards with image URLs, badges, and /turfs/[id] links
    Route-->>ChatUI: HTTP 200 OK { reply, actionCards: [3 items], telemetry: { provider: "GROQ_LPU", latencyMs: 742 } }
    ChatUI-->>User: Displays conversational answer and 3 interactive cards with "Book Slot" buttons
```

---

# 6. Architecture & Pipeline Diagrams

### Diagram 16: High-Level System Architecture Diagram (Section 4.2)
*Layered 3-tier Serverless Next.js App Router Architecture.*

```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
    subgraph PresentationLayer["1. Presentation Layer (Client Tier)"]
        Browser["Desktop & Mobile Browsers (React 19 / PWA)"]
        Components["Tailwind CSS 4 + Lucide Icons + Confetti"]
        ChatWidget["Floating AI Concierge Drawer (AiChatbot.tsx)"]
    end

    subgraph EdgeGatewayLayer["2. Edge Gateway & Middleware Tier"]
        EdgeMiddleware["Next.js Proxy / Edge Middleware"]
        AuthFilter["Web Crypto Edge Session Decryption (HMAC SHA-256)"]
        RBACGuard["Role Route Guards (/admin/*, /owner/*)"]
        CORSHeader["Global API CORS & Suspense Boundaries"]
    end

    subgraph ServiceLayer["3. Application & Business Logic Tier"]
        HoldService["Atomic Slot Hold Service (Prisma $transaction)"]
        BookingService["Booking & Payment Settlement Engine"]
        MatchService["Squad Recruitment & Matching Service"]
        PricingService["Random Forest ML Dynamic Pricing Engine"]
        AiChatRouter["Triple-Tier AI Router (Groq LPU / Gemini / Local)"]
    end

    subgraph ExternalServices["4. External Cloud & AI Services"]
        GroqCloud["Groq LPU Cloud (Qwen 3.8 27B)"]
        GeminiCloud["Google AI Studio (Gemini 3.5 Flash)"]
        BkashGateway["bKash / Nagad Sandbox Payment Gateway"]
    end

    subgraph DataLayer["5. Data Tier (Neon Serverless PostgreSQL)"]
        PgBouncer["PgBouncer Serverless Connection Pooler (Singapore)"]
        NeonDB[("Neon PostgreSQL 16\n(11 Relational Tables)")]
    end

    Browser <--> EdgeMiddleware
    ChatWidget <--> EdgeMiddleware
    EdgeMiddleware --> AuthFilter
    AuthFilter --> RBACGuard
    RBACGuard --> ServiceLayer

    HoldService <--> PgBouncer
    BookingService <--> PgBouncer
    MatchService <--> PgBouncer
    PricingService <--> PgBouncer
    AiChatRouter <--> PgBouncer

    AiChatRouter <--> GroqCloud
    AiChatRouter <--> GeminiCloud
    BookingService <--> BkashGateway

    PgBouncer <--> NeonDB
```

---

### Diagram 17: AI-Integration Architecture Diagram (Section 4.4)
*Dual-Engine AI architecture illustrating the predictive ML model alongside the generative conversational RAG pipeline.*

```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TB
    subgraph PredictiveEngine["A. Predictive AI: Machine Learning Dynamic Pricing"]
        OwnerTrigger["Owner Schedules AI Pricing"] --> FeatureDerivation["BST Timezone Feature Derivation\n(dayOfWeek, hour, isWeekend, baseDemand)"]
        FeatureDerivation --> TreeModel["In-Process Random Forest Decision Trees\n(lib/pricing-ml.ts, <1ms SLA)"]
        TreeModel --> ClampLogic["Mathematical Safety Clamp Guardrail\nFloor: 0.80x (৳1200) | Ceiling: 1.30x (৳1800)"]
        ClampLogic --> DBCommit["Persist 7-Day Synced Rates in Neon DB"]
    end

    subgraph GenerativeEngine["B. Generative AI: Conversational Booking Concierge (RAG)"]
        UserMsg["User Message (English / Banglish)"] --> AIRouter["AI API Gateway (/api/v1/ai/chat)"]
        
        AIRouter --> Tier1{"1. Groq LPU API\n(Qwen 3.8 27B)"}
        Tier1 -- "Success (~750ms)" --> IntentExtractor["Structured Intent & Filter Extraction"]
        Tier1 -- "Rate Limit / 503" --> Tier2{"2. Gemini 3.5 Flash\n(Google AI Studio)"}
        Tier2 -- "Success (~1.8s)" --> IntentExtractor
        Tier2 -- "Offline / Timeout" --> Tier3["3. Deterministic Local NLU\n(Regex Intent Classifier)"]
        Tier3 --> IntentExtractor

        IntentExtractor --> GroundingDB[("Neon Relational DB Query\n(Turfs & Open Matches)")]
        GroundingDB --> ActionCardSynth["Action Card Synthesizer\n(Images, format, direct /turfs/id book links)"]
        ActionCardSynth --> ClientChat["Interactive UI Response Drawer"]
    end
```

---

### Diagram 18: CI/CD Pipeline & Git Management Workflow (Section 4.4 & 4.5)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart LR
    Dev["Developer Workstation"] --> LocalTest["Local Test Verification\n(npm test -> 36 suites PASS)"]
    LocalTest --> GitCommit["Atomic Git Commit\n(feat/fix convention)"]
    GitCommit --> GitHubPush["Push to GitHub\n(origin/main)"]

    subgraph GitHubActions["GitHub Version Control"]
        GitHubPush --> Webhook["Deployment Webhook Trigger"]
    end

    subgraph VercelCI["Vercel Cloud CI/CD Engine"]
        Webhook --> TurbopackBuild["Turbopack Next.js Build\n(34 Static/Dynamic Routes)"]
        TurbopackBuild --> PrerenderCheck["Static Prerender Verification\n(useSearchParams Suspense check)"]
        PrerenderCheck --> EdgeDeploy["Deploy to Global Edge Network"]
    end

    subgraph ProductionLive["Live Production Runtime"]
        EdgeDeploy --> LiveApp["https://sportzfy-zeta.vercel.app"]
        LiveApp <--> LiveNeonDB[("Neon PostgreSQL Singapore")]
    end
```

---

### Diagram 19: Physical Deployment Diagram (Appendix E)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
    subgraph ClientNode["User Client Devices"]
        MobileClient["Mobile PWA Browser\n(iOS / Android Chrome)"]
        DesktopClient["Desktop Browser\n(Edge / Chrome / Firefox)"]
    end

    subgraph VercelCloud["Vercel Global Edge Network (Edge Nodes)"]
        VercelCDN["Vercel Edge CDN\n(Static Assets, CSS, JS Chunks)"]
        ServerlessFunctions["Next.js Serverless Functions\n(Node.js 20.x Runtime / Edge Workers)"]
    end

    subgraph NeonAWSCloud["AWS Singapore (ap-southeast-1)"]
        PgBouncerNode["Neon Connection Pooler\n(PgBouncer, Port 5432, SSL required)"]
        ComputeNode["Serverless PostgreSQL Compute Node\n(Autoscaling 0.25 to 2 CU)"]
        StorageNode[("Neon Distributed Storage Engine\n(WAL + Page Server Snapshots)")]
    end

    subgraph ExternalClouds["External Cloud APIs"]
        GroqNode["Groq LPU Inference Cluster\n(api.groq.com / TLS 1.3)"]
        GoogleNode["Google Generative AI Cluster\n(generativelanguage.googleapis.com)"]
        BkashNode["bKash Payment Sandbox Gateway\n(PGW Tokenized API)"]
    end

    MobileClient -->|HTTPS / Port 443| VercelCDN
    DesktopClient -->|HTTPS / Port 443| VercelCDN
    VercelCDN --> ServerlessFunctions

    ServerlessFunctions -->|TCP SSL / Port 5432| PgBouncerNode
    PgBouncerNode --> ComputeNode
    ComputeNode <--> StorageNode

    ServerlessFunctions -->|HTTPS REST| GroqNode
    ServerlessFunctions -->|HTTPS REST| GoogleNode
    ServerlessFunctions -->|HTTPS REST| BkashNode
```

---

# 7. Project Management & UI Flow Diagrams

### Diagram 20: Project Timeline & Milestone Gantt Chart (Section 2.6)
*7-week sprint schedule mapped across planning, architecture, implementation, testing, and deployment.*

```mermaid
%%{init: {'theme': 'neutral'}}%%
gantt
    title Sportzfy CSE-355 7-Week Project Lifecycle
    dateFormat  YYYY-MM-DD
    section Phase 1: Inception
    Problem Research & Community Survey (25 respondents) :done, p1_1, 2026-08-01, 2026-08-08
    Proposal Document & Requirement Analysis             :done, p1_2, 2026-08-08, 2026-08-15
    section Phase 2: Design
    System Architecture & HLD/LLD Specification          :done, p2_1, 2026-08-15, 2026-08-22
    Neon PostgreSQL Schema & Prisma ERD Modeling         :done, p2_2, 2026-08-22, 2026-08-29
    section Phase 3: Construction
    Sprint 1: Auth (Web Crypto HMAC) & Turf Catalog      :done, p3_1, 2026-08-29, 2026-09-08
    Sprint 2: 5-Min Atomic Slot Hold & Concurrency Lock  :done, p3_2, 2026-09-08, 2026-09-18
    Sprint 3: Community Matchmaking with Role Selection  :done, p3_3, 2026-09-18, 2026-09-28
    Sprint 4: ML Dynamic Pricing with Safety Clamps      :done, p3_4, 2026-09-28, 2026-10-08
    Sprint 5: Dual AI Concierge (Groq LPU + Gemini Flash):done, p3_5, 2026-10-08, 2026-10-18
    section Phase 4: QA & Live
    Automated Test Suite (36 suites) & Concurrency Test  :done, p4_1, 2026-10-18, 2026-10-25
    Vercel Edge Production Deployment & Go-Live Audit    :done, p4_2, 2026-10-25, 2026-11-01
    Final Lab Report & Defense Preparation               :active, p4_3, 2026-11-01, 2026-11-06
```

---

### Diagram 21: GUI Information Architecture & User Journey Flow (Section 5.4)
```mermaid
%%{init: {'theme': 'neutral'}}%%
flowchart TD
    Landing["/ (Homepage & Turf Catalog)"]

    subgraph PlayerFlow["Player Booking & Match Flow"]
        TurfDetail["/turfs/[id] (Pitch Specs, Timetable Grid)"]
        CheckoutHold["/checkout/[holdId] (5-Min Countdown Timer)"]
        PaymentSuccess["Booking Confirmed (Digital QR Pass)"]
        MatchesCatalog["/matches (Open Squad Roster)"]
        JoinMatch["Apply with Position (GK/Striker)"]
        AiDrawer["Floating AI Concierge Drawer (Action Cards)"]
    end

    subgraph OwnerFlow["Venue Owner Management"]
        OwnerHome["/owner (Analytics & Quick Stats)"]
        ScheduleManager["/owner/schedule (Grid & AI Sync)"]
        BlockedIntervals["Slot Blocking for Maintenance"]
        PayoutRequests["Withdrawal Requests (bKash/Nagad)"]
    end

    subgraph AdminFlow["Platform Moderation"]
        AdminHome["/admin (System Overview)"]
        TurfReview["Review & Approve Venue Submissions"]
        PayoutSettlement["Process & Disburse Owner Payouts"]
    end

    Landing --> TurfDetail
    Landing --> MatchesCatalog
    Landing --> AiDrawer
    AiDrawer -->|Direct Action Link| TurfDetail
    AiDrawer -->|Direct Action Link| MatchesCatalog

    TurfDetail -->|Click Slot -> Acquire Hold| CheckoutHold
    CheckoutHold -->|Pay via bKash/Nagad| PaymentSuccess
    MatchesCatalog --> JoinMatch

    Landing -->|Owner Login| OwnerHome
    OwnerHome --> ScheduleManager
    OwnerHome --> BlockedIntervals
    OwnerHome --> PayoutRequests

    Landing -->|Admin Login| AdminHome
    AdminHome --> TurfReview
    AdminHome --> PayoutSettlement
```

---

### Diagram 22: High-Level Design (HLD) Design Patterns in Action (Section 5.1)
```mermaid
%%{init: {'theme': 'neutral'}}%%
classDiagram
    direction LR

    class RepositoryPattern {
        <<Pattern>>
        PrismaClient Singleton
        Centralized DB abstraction
        Prevents connection exhaustion
    }

    class StrategyPattern {
        <<Pattern>>
        PricingStrategy
        +BaseRateStrategy()
        +WeekendSurgeStrategy()
        +RandomForestMLStrategy()
    }

    class FallbackObserverPattern {
        <<Pattern>>
        TripleTierAIRouter
        +NotifyGroq()
        +FallbackGemini()
        +FallbackLocalNLU()
    }

    class FactoryPattern {
        <<Pattern>>
        ActionCardFactory
        +createTurfCard()
        +createMatchCard()
    }

    RepositoryPattern <.. StrategyPattern : queries
    StrategyPattern <.. FallbackObserverPattern : coordinates
    FallbackObserverPattern <.. FactoryPattern : renders
```

