# Sportzfy — System Design & Architecture Document

**Course:** Software Engineering (Sessional) [CSE-355]
**Department:** CSE, CUET
**Authors:** Mahmudul Hasan (2204040), Sakib Alif (2204051), Ayan Barua (2204053)
**Supervisors:** Prof. Mir Md. Saki Kowsar, Md. Refaj Hossan
**Date:** August 2026

---

## Table of Contents
1. [Executive Summary & Context](#1-executive-summary--context)
2. [Non-Functional Requirements](#2-non-functional-requirements)
3. [User Personas & Journeys](#3-user-personas--journeys)
4. [High-Level System Architecture](#4-high-level-system-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Design](#6-database-design)
7. [API Contracts](#7-api-contracts)
8. [Integration Architecture](#8-integration-architecture)
9. [Security & Compliance](#9-security--compliance)
10. [Deployment & Infrastructure](#10-deployment--infrastructure)
11. [Scalability & Reliability](#11-scalability--reliability)
12. [Testing Strategy](#12-testing-strategy)
13. [Monitoring & Observability](#13-monitoring--observability)
14. [Risk Assessment & Mitigation](#14-risk-assessment--mitigation)
15. [Implementation Roadmap](#15-implementation-roadmap)

---

## 1. Executive Summary & Context

Sportzfy is a real-time turf booking marketplace addressing manual, fragmented booking workflows in Bangladesh's five-a-side and seven-a-side football ecosystem. Evidence from 22 community screenshots and 25 survey respondents validates urgent demand for live slot visibility, automated payments, split settlements, and matchmaking.

**System Goal:** Deliver a responsive web application (Next.js) that provides sub-second slot availability updates, automated concurrency-safe booking, transparent refund policies, and social matchmaking — all within a 6–7 week academic project timeline.

**Key Constraints:**
- 6–7 week delivery window
- Responsive web app (PWA-capable); native mobile deferred
- Bangladesh payment gateway integration (bKash, Nagad, Rocket)
- Real-time concurrency for slot booking
- Academic project scope: limited team velocity

---

## 2. Non-Functional Requirements

### 2.1 Performance
| Metric | Target | Rationale |
|--------|--------|-----------|
| Slot grid WebSocket latency | < 200ms | Users viewing a turf must see state changes in real time |
| API p95 response time | < 500ms | Search, booking, payment flows |
| Page load (LCP) | < 2.5s | Mobile-first PWA experience |
| Slot lock TTL | 5 minutes | Balance between reservation confidence and inventory velocity |
| Concurrent lock acquisition | 1000 req/s | Handle peak demand (Friday/Saturday evenings) |

### 2.2 Availability & Reliability
| Metric | Target |
|--------|--------|
| Uptime SLA | 99.5% (academic scope; production would require 99.9%) |
| Data durability | PostgreSQL WAL + daily logical backups |
| Payment webhook retry | 3 attempts with exponential backoff |
| Slot lock recovery | Cron worker reconciles stale locks every 60s |

### 2.3 Security
- OWASP Top 10 mitigations
- Payment PCI-DSS compliance via gateway-hosted checkout (no raw card data)
- PII encryption at rest (AES-256) and in transit (TLS 1.3)
- Role-based access control (RBAC) for owners, admins, players

### 2.4 Observability
- Structured JSON logging (Winston/Pino)
- Distributed tracing (OpenTelemetry)
- Metrics (Prometheus + Grafana)
- Error tracking (Sentry)

---

## 3. User Personas & Journeys

### 3.1 Personas

| Persona | Description | Primary Actions |
|---------|-------------|-----------------|
| **Player (Student)** | CUET student, books 1–2x/week, splits costs | Search, book, split pay, join match |
| **Captain** | Team organizer, manages 10–12 players | Create split, share invite, track payments |
| **Solo Player** | Individual looking for a game | Browse match requests, request to join |
| **Turf Owner** | Manages 1–3 venues | Set pricing, manage slots, view payouts |
| **Platform Admin** | Curates turfs, resolves disputes | Verify turfs, manage users, view analytics |

### 3.2 Critical User Journeys

**Journey A: Real-Time Booking (Highest Priority)**
1. Player searches turfs by location, time, format
2. Views live slot grid (color-coded: 🟢 available, 🟡 locked, 🔴 booked)
3. Clicks "Book Now" → Redis lock acquired (5 min) → WebSocket broadcasts 🟡
4. Selects equipment add-ons, applies split payment
5. Redirected to bKash/Nagad sandbox
6. Webhook confirms payment → PostgreSQL booking created → lock released
7. Digital pass generated with QR code

**Journey B: Split Payment & Invite**
1. Captain selects turf, time, and 10-player split
2. System calculates share (e.g., 300 BDT/player)
3. Captain shares WhatsApp template with unique payment links
4. Players pay individually; captain sees live tracker
5. All payments confirmed → booking locked

**Journey C: Matchmaking**
1. Captain with booked turf but no opponent posts open challenge
2. Opposing team captain accepts
3. Both teams receive notification; booking details shared
4. Solo players browse open roster spots, request to join

---

## 4. High-Level System Architecture

### 4.1 Architecture Style

**Decision: Modular Monolith with Event-Driven Internal Communication**

Given the 6–7 week timeline and small team, a microservices architecture introduces unnecessary operational complexity. Instead:

- Single Next.js application with clearly bounded modules
- Internal event bus (Redis Streams or lightweight in-process emitter) for decoupled communication between modules
- Shared PostgreSQL database with schema-per-module naming conventions
- Redis for caching, slot locks, and pub/sub WebSocket state
- Future extraction points documented for post-academic scaling

### 4.2 Architecture Diagram (Logical)

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  Next.js SSR + RSC | Tailwind | PWA Service Worker         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼──────────────────────────────────────┐
│                   API Gateway / Edge                        │
│         Next.js Middleware (auth, rate-limit, CORS)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────────┐
│  WebSocket   │ │  REST    │ │  Webhook       │
│  Server      │ │  API     │ │  Handlers      │
│  (slots)     │ │  Routes  │ │  (payments)    │
└───────┬──────┘ └────┬─────┘ └─────┬──────────┘
        │             │              │
        └─────────────┼──────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                  Application Layer                         │
│  Modules: Auth | Turfs | Bookings | Payments | Matchmaking │
│  | Owner | Admin | Weather | Recommendations              │
│  Service layer with domain logic and validation            │
└─────────────────────┬─────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌───▼─────┐ ┌────▼──────────────────┐
│   Redis      │ │PostgreSQL│ │ External Services      │
│  - Slot Locks│ │ - Primary│ │ - bKash / Nagad APIs  │
│  - Pub/Sub   │ │ - Source │ │ - OpenWeatherMap       │
│  - Cache     │ │   of Truth│ │ - Google Maps API      │
│  - Session   │ │ - WAL    │ │ - Cloudflare R2 (S3)  │
│              │ │ - Backups│ │ - WhatsApp Cloud API   │
└──────────────┘ └──────────┘ └────────────────────────┘
```

---

## 5. Backend Architecture

### 5.1 Technology Stack

| Concern | Choice | Justification |
|---------|--------|---------------|
| Runtime | Node.js 20 LTS | Team familiarity, Next.js ecosystem |
| Framework | Next.js 14 (App Router) | SSR, RSC, API routes, full-stack unification |
| Language | TypeScript 5.x | Type safety across DB, API, UI |
| ORM | Prisma 5.x | Migrations, type-safe queries, excellent DX |
| Auth | NextAuth.js v5 (Auth.js) | Built-in adapters, OAuth + credentials + phone OTP |
| Validation | Zod | Runtime schema validation, integrates with TypeScript |
| WebSocket | `@vercel/edge-socket` or `ws` in API route | Lightweight, compatible with Vercel/Node |
| Queue / Jobs | BullMQ (Redis-backed) | Slot release, refund automation, weather alerts |
| Payments | Custom SDK wrappers for bKash / Nagad | Direct API integration, webhook verification |
| File Upload | React Dropzone + Cloudflare R2 | Client-side chunking, server-signed URLs |
| Testing | Jest + React Testing Library + Playwright | Unit, component, E2E coverage |

### 5.2 Module Boundaries

| Module | Responsibility | Key Dependencies |
|--------|---------------|------------------|
| `auth` | Registration, login, OTP, session management | NextAuth, Prisma, Redis (OTP store) |
| `turfs` | CRUD, search, filtering, photo management | Prisma, R2, PostgreSQL full-text / PostGIS |
| `slots` | Availability matrix, locking, WebSocket sync | Redis (locks + pub/sub), BullMQ (release) |
| `bookings` | Booking creation, confirmation, QR generation | Prisma, Payments, Matchmaking |
| `payments` | Gateway orchestration, split payments, webhooks | bKash/Nagad SDKs, BullMQ (retries) |
| `refunds` | Policy engine, automated refunds, ledger | Payments, Notifications |
| `matchmaking` | Open challenges, player recruitment, notifications | Bookings, Notifications, WebSocket |
| `equipment` | Inventory add-ons, pricing, fulfillment | Prisma, Bookings |
| `owners` | Dashboard, slot pricing, walk-in overrides, payouts | Turfs, Slots, Payments |
| `admin` | Verification, disputes, analytics | All modules (read-heavy views) |
| `weather` | Forecast caching, rain alerts, cancellation triggers | OpenWeatherMap, Notifications, Refunds |
| `notifications` | WhatsApp, in-app, email (transactional) | WhatsApp Cloud API, Resend (email) |

### 5.3 Key Design Patterns

- **Repository Pattern:** Prisma serves as the data access layer; services interact via repository interfaces
- **Unit of Work:** Transactional boundaries around multi-table operations (booking + payment + split)
- **Event Sourcing (Lightweight):** Booking lifecycle emits events (`booking.created`, `payment.confirmed`, `slot.locked`, `slot.released`) consumed by WebSocket broadcaster, notification sender, and analytics
- **Circuit Breaker:** External payment gateway calls wrapped with simple circuit breaker to prevent cascade failures
- **CQRS (Read-optimized):** Search and availability queries use denormalized read models (materialized views or Redis caches) while writes go through normalized transactional path

---

## 6. Database Design

### 6.1 ERD Overview

```
users (1) ──< bookings >── (1) turfs
   │              │             │
   │              │             ├──< slots
   │              │             │
   │              ├──< payments │
   │              │             │
   │              ├──< split_payments
   │              │
   ├──< match_requests
   │              │
   ├──< reviews
   │
   ├──< equipment_inventory (owner-side)
   │
   ├──< payouts
   │
   └──< refresh_tokens
```

### 6.2 Core Schema (Prisma)

```prisma
// users
model User {
  id            String   @id @default(cuid())
  email         String?  @unique
  phone         String?  @unique
  name          String?
  role          Role     @default(PLAYER) // PLAYER, OWNER, ADMIN
  avatarUrl     String?
  preferences   Json?    // preferred format, time, location
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  bookings      Booking[]
  matchRequests MatchRequest[] @relation("HostMatches")
  reviews       Review[]
  refreshTokens RefreshToken[]
  payouts       Payout[]

  @@index([phone])
  @@index([role])
}

// turfs
model Turf {
  id              String    @id @default(cuid())
  name            String
  description     String?
  location        String    // address
  latitude        Float?
  longitude       Float?
  pricePerHour    Decimal   @db.Decimal(10, 2)
  pitchFormats    String[]  // ["5v5", "6v6", "7v7"]
  amenities       String[]  // ["Washroom", "Water", "Parking", "Seating"]
  qualityRating   Decimal?  @db.Decimal(3, 2)
  isVerified      Boolean   @default(false)
  isActive        Boolean   @default(true)
  ownerId         String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  owner           User            @relation(fields: [ownerId], references: [id])
  slots           Slot[]
  bookings        Booking[]
  reviews         Review[]
  matchRequests   MatchRequest[]
  equipment       Equipment[]

  @@index([ownerId])
  @@index([isVerified, isActive])
}

// slots
model Slot {
  id         String    @id @default(cuid())
  turfId     String
  startTime  DateTime
  endTime    DateTime
  status     SlotStatus @default(AVAILABLE) // AVAILABLE, LOCKED, BOOKED
  lockExpiresAt DateTime?
  price      Decimal   @db.Decimal(10, 2)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  turf       Turf      @relation(fields: [turfId], references: [id])
  bookings   Booking[]

  @@unique([turfId, startTime, endTime])
  @@index([turfId, startTime])
}

// bookings
model Booking {
  id              String      @id @default(cuid())
  userId          String
  turfId          String
  slotId          String
  status          BookingStatus @default(PENDING) // PENDING, CONFIRMED, CANCELLED, COMPLETED
  totalAmount     Decimal     @db.Decimal(10, 2)
  equipmentRented Json?       // {"bibs": 2, "ball": 1}
  qrCodeUrl       String?
  cancellationReason String?
  refundStatus    RefundStatus @default(NONE) // NONE, REQUESTED, REFUNDED
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User        @relation(fields: [userId], references: [id])
  turf            Turf        @relation(fields: [turfId], references: [id])
  slot            Slot        @relation(fields: [slotId], references: [id])
  payments        Payment[]
  splitPayments   SplitPayment[]
  matchRequests   MatchRequest[] @relation("BookingMatches")

  @@index([userId])
  @@index([turfId, slotId])
  @@index([status, createdAt])
}

// payments
model Payment {
  id            String        @id @default(cuid())
  bookingId     String
  method        PaymentMethod // BKASH, NAGAD, ROCKET, CARD
  amount        Decimal       @db.Decimal(10, 2)
  status        PaymentStatus // PENDING, COMPLETED, FAILED, REFUNDED
  gatewayTxnId  String?       @unique
  rawResponse   Json?
  createdAt     DateTime      @default(now())

  booking       Booking       @relation(fields: [bookingId], references: [id])

  @@index([bookingId])
  @@index([gatewayTxnId])
}

// split_payments
model SplitPayment {
  id            String        @id @default(cuid())
  bookingId     String
  playerPhone   String
  amountDue     Decimal       @db.Decimal(10, 2)
  amountPaid    Decimal?      @db.Decimal(10, 2)
  status        SplitStatus   @default(PENDING) // PENDING, PAID, EXPIRED
  paymentLink   String
  paidAt        DateTime?
  createdAt     DateTime      @default(now())

  booking       Booking       @relation(fields: [bookingId], references: [id])

  @@index([bookingId])
  @@index([playerPhone])
}

// match_requests
model MatchRequest {
  id              String        @id @default(cuid())
  hostUserId      String
  turfId          String
  bookingId       String?
  matchType       MatchType     // TEAM_VS_TEAM, PLAYER_RECRUITMENT
  requiredRole    String?       // GOALKEEPER, DEFENDER, MIDFIELDER, STRIKER, ANY
  status          MatchStatus   @default(OPEN) // OPEN, FILLED, CANCELLED
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  host            User          @relation("HostMatches", fields: [hostUserId], references: [id])
  turf            Turf          @relation(fields: [turfId], references: [id])
  booking         Booking?      @relation("BookingMatches", fields: [bookingId], references: [id])

  @@index([turfId, status])
  @@index([hostUserId])
}

// reviews
model Review {
  id        String   @id @default(cuid())
  userId    String
  turfId    String
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  turf      Turf     @relation(fields: [turfId], references: [id])

  @@unique([userId, turfId])
}

// equipment (owner-side inventory)
model Equipment {
  id          String   @id @default(cuid())
  turfId      String
  name        String   // "Match Ball", "Bibs", "Goalkeeper Gloves"
  price       Decimal  @db.Decimal(10, 2)
  quantity    Int
  isAvailable Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  turf        Turf     @relation(fields: [turfId], references: [id])

  @@index([turfId])
}

// payouts (owner revenue)
model Payout {
  id          String    @id @default(cuid())
  ownerId     String
  amount      Decimal   @db.Decimal(10, 2)
  status      PayoutStatus @default(PENDING) // PENDING, PROCESSING, COMPLETED, FAILED
  method      String?   // BANK, MOBILE_WALLET
  destination String?
  requestedAt DateTime  @default(now())
  completedAt DateTime?

  owner       User      @relation(fields: [ownerId], references: [id])

  @@index([ownerId, status])
}

// refresh_tokens
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Enums
enum Role { PLAYER OWNER ADMIN }
enum SlotStatus { AVAILABLE LOCKED BOOKED }
enum BookingStatus { PENDING CONFIRMED CANCELLED COMPLETED }
enum RefundStatus { NONE REQUESTED REFUNDED }
enum PaymentMethod { BKASH NAGAD ROCKET CARD }
enum PaymentStatus { PENDING COMPLETED FAILED REFUNDED }
enum SplitStatus { PENDING PAID EXPIRED }
enum MatchType { TEAM_VS_TEAM PLAYER_RECRUITMENT }
enum MatchStatus { OPEN FILLED CANCELLED }
enum PayoutStatus { PENDING PROCESSING COMPLETED FAILED }
```

### 6.3 Indexing Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| `slots` | `(turfId, startTime)` | Fast availability queries per turf |
| `bookings` | `(userId, createdAt)` | User booking history |
| `bookings` | `(status, createdAt)` | Admin analytics and stale job queries |
| `payments` | `(gatewayTxnId)` | Webhook deduplication and lookup |
| `split_payments` | `(bookingId)` | Live split tracker dashboard |
| `match_requests` | `(turfId, status)` | Matchmaking discovery feed |

### 6.4 Data Partitioning & Retention

- **Hot data:** Current month's bookings/slots (primary PostgreSQL)
- **Warm data:** 1–12 months (same DB; archived tables)
- **Cold data:** >12 months (S3/Parquet for analytics)
- **TTL:** Expired refresh tokens purged by cron; completed bookings marked read-only after 90 days

---

## 7. API Contracts

### 7.1 REST API

Base path: `/api/v1`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Create player/owner account |
| POST | `/auth/login` | None | Credential or OTP login |
| POST | `/auth/refresh` | None | Refresh access token |
| POST | `/auth/logout` | Bearer | Invalidate refresh token |
| GET | `/turfs` | None | Search & filter turfs |
| GET | `/turfs/:id` | None | Turf detail |
| GET | `/turfs/:id/slots` | None | Availability matrix |
| POST | `/turfs` | Owner | Create turf listing |
| PATCH | `/turfs/:id` | Owner | Update turf details |
| POST | `/bookings` | Player | Create booking (acquires lock) |
| GET | `/bookings/me` | Player | My bookings |
| GET | `/bookings/:id` | Player/Owner | Booking detail |
| PATCH | `/bookings/:id/cancel` | Player | Cancel booking (triggers refund) |
| POST | `/payments/init` | Player | Initiate payment |
| POST | `/payments/webhook/bkash` | None (sig verify) | Gateway callback |
| POST | `/payments/webhook/nagad` | None (sig verify) | Gateway callback |
| POST | `/split-payments` | Player | Create split payment |
| GET | `/split-payments/:bookingId` | Player | Live split tracker |
| POST | `/match-requests` | Player | Create match request |
| GET | `/match-requests` | None | Discovery feed |
| POST | `/match-requests/:id/accept` | Player | Accept challenge |
| POST | `/equipment/:turfId` | Owner | Add equipment item |
| PATCH | `/equipment/:id` | Owner | Update stock/price |
| GET | `/owner/dashboard` | Owner | Revenue, bookings, occupancy |
| POST | `/owner/payouts` | Owner | Request payout |
| GET | `/admin/turfs/pending` | Admin | Pending verification |
| POST | `/admin/turfs/:id/verify` | Admin | Approve/reject turf |
| GET | `/admin/analytics` | Admin | Platform metrics |

### 7.2 WebSocket

**Topic:** `wss://api.sportzfy.app/ws/turfs/{turfId}/slots`

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `slot.subscribe` | Client → Server | `{ turfId, userId }` | Subscribe to turf slot updates |
| `slot.update` | Server → Client | `{ slotId, status, lockExpiresAt }` | Real-time slot state change |
| `slot.unsubscribe` | Client → Server | `{}` | Leave channel |

**Scalability consideration:** Horizontal scaling requires sticky sessions or Redis pub/sub to broadcast across instances. For academic scope, single instance with in-memory broadcast is acceptable.

### 7.3 Webhooks (Inbound)

| Endpoint | Gateway | Verification | Events |
|----------|---------|-------------|--------|
| `/api/v1/payments/webhook/bkash` | bKash | Signature header + IP allowlist | `payment.completed`, `payment.failed` |
| `/api/v1/payments/webhook/nagad` | Nagad | HMAC signature | `payment.success`, `payment.failed` |

**Idempotency:** All webhook handlers use `gatewayTxnId` unique constraint to prevent duplicate processing.

---

## 8. Integration Architecture

### 8.1 Payment Gateways

**bKash / Nagad / Rocket:**
- Checkout flow: Client collects amount → Backend creates payment intent → Redirect to gateway hosted page → Webhook confirms → Booking confirmed
- Split payments: Generate individual payment links per player; aggregate status in DB
- Refund flow: Backend calls gateway refund API → Webhook confirms `refund.completed`
- Sandbox credentials stored in environment; production keys in Vault/Sealed Secrets

### 8.2 Weather Intelligence

- **OpenWeatherMap API:** Poll turf geolocation every 3 hours; cache 30-minute TTL in Redis
- **Rain threshold:** > 70% probability triggers notification + cancellation option
- **Weather-out guarantee:** Owner-verified rain flags auto-trigger 100% refund via policy engine

### 8.3 Maps & Location

- **Google Maps Embed API:** Turf detail page static map + "Get Directions" deep link
- **Geocoding:** Owner onboarding geocodes address → stored lat/lng
- **Search:** PostgreSQL full-text search on `location` field + PostGIS distance queries (if available); fallback to ILIKE with trigram index

### 8.4 File Storage

- **Cloudflare R2 (S3-compatible):** Turf photos, equipment images, QR codes
- **Client:** `react-dropzone` with chunked upload
- **Server:** Presigned URL generation; max 10MB per image; CDN-backed public bucket

### 8.5 Notifications

| Channel | Use Case | Implementation |
|---------|----------|---------------|
| WhatsApp | Match invites, payment reminders | WhatsApp Cloud API (template messages) |
| In-App | Booking confirmations, match acceptances | WebSocket + React Query invalidation |
| Email (fallback) | Receipts, password reset | Resend API (React Email templates) |

---

## 9. Security & Compliance

### 9.1 Threat Model (STRIDE)

| Threat | Mitigation |
|--------|------------|
| **Spoofing** | JWT + refresh token rotation; short-lived access tokens (15 min) |
| **Tampering** | TLS 1.3 everywhere; webhook signature verification; immutable audit log |
| **Repudiation** | Server-side event log with user ID, IP, timestamp for all mutations |
| **Information Disclosure** | PII encrypted at rest; no sensitive data in logs; rate-limited error responses |
| **Denial of Service** | API rate limiting (Upstash Redis or Next.js middleware); Redis slot lock TTL caps inventory exposure |
| **Elevation of Privilege** | RBAC enforced at route level + service layer; input validation (Zod) on all boundaries |

### 9.2 Payment Security
- No raw card data handled by our servers
- Gateway-hosted checkout pages
- Webhook endpoints verify signature before processing
- Idempotent payment processing prevents double-charges

### 9.3 Data Privacy
- PII minimization: collect only phone + email for transaction needs
- Right to erasure: DELETE cascade on user removal (GDPR-aligned; Bangladesh PDPA 2023)
- Backup encryption: pg_dump with AES-256

---

## 10. Deployment & Infrastructure

### 10.1 Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local + Vercel preview | `localhost:3000` |
| Staging | Pre-production QA | `staging.sportzfy.app` |
| Production | Live | `sportzfy.app` |

### 10.2 Deployment Topology

```
┌──────────────────────────────────────────────────────────────┐
│                        Vercel Edge                           │
│  Next.js Frontend (SSR/SSG) + API Routes (Edge Functions)    │
│  Global CDN for static assets                                │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                     Compute (Vercel Pro)                      │
│  - Next.js API Routes (Node.js)                              │
│  - WebSocket Server (separate route /ws)                     │
│  - Environment variables sealed in Vercel                     │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼─────────────┐
│  Neon/Supabase  │  │   Upstash      │  │  Cloudflare R2     │
│  PostgreSQL     │  │   Redis        │  │  Object Storage    │
│  (Serverless)   │  │   (Managed)    │  │                    │
└────────────────┘  └────────────────┘  └────────────────────┘

External:
  - bKash / Nagad APIs
  - OpenWeatherMap API
  - Google Maps API
  - WhatsApp Cloud API
```

### 10.3 Containerization (Optional, for Local Consistency)

```dockerfile
# Dockerfile (multi-stage)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install

FROM deps AS builder
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 10.4 Environment Configuration

```env
# .env.production (sealed in Vercel)
DATABASE_URL="postgres://..."
REDIS_URL="rediss://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://sportzfy.app"
BKASH_API_KEY="..."
BKASH_API_SECRET="..."
NAGAD_API_KEY="..."
OPENWEATHER_API_KEY="..."
GOOGLE_MAPS_API_KEY="..."
WHATSAPP_API_TOKEN="..."
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY="..."
R2_SECRET_KEY="..."
R2_BUCKET="sportzfy-assets"
```

---

## 11. Scalability & Reliability

### 11.1 Bottleneck Analysis

| Component | Bottleneck Risk | Mitigation |
|-----------|----------------|------------|
| Slot grid WebSocket | Many concurrent viewers per turf | Redis pub/sub + fan-out; sticky sessions or adapter |
| Payment webhooks | Burst during peak hours | Queue with BullMQ; exponential backoff retries |
| Search queries | Full-table scans without index | Materialized view + Redis cache (TTL 30s) |
| File uploads | Large images on slow mobile | Chunked upload + client-side compression |
| Database writes | High contention on slot lock rows | Row-level locking with NOWAIT; Redis as fast path |

### 11.2 Caching Strategy

| Layer | Cache | TTL | Invalidation |
|-------|-------|-----|--------------|
| Turf search results | Redis | 30s | Explicit purge on turf update |
| Slot availability | Redis | 5s | Event-driven purge on lock/book |
| User sessions | Redis | 15m | Logout / token expiry |
| Weather data | Redis | 30m | Periodic refresh job |
| Static assets | CDN (Vercel) | 1y (immutable) | Content-hashed filenames |

### 11.3 Resilience Patterns

- **Retry with jitter:** External API calls (payment, weather) use exponential backoff
- **Dead-letter queue:** Failed webhook processing moves to DLQ for manual inspection
- **Graceful degradation:** If weather API fails, UI hides rain probability rather than showing stale data
- **Circuit breaker:** Payment gateway circuit opens after 5 consecutive failures; fallback to "contact owner"

---

## 12. Testing Strategy

### 12.1 Test Pyramid

```
        E2E (Playwright)
       /              \
    Integration (Jest + Testcontainers)
   /                        \
Unit (Jest + React Testing Library)
```

### 12.2 Coverage Targets

| Layer | Target | Tool |
|-------|--------|------|
| Unit | 80% line coverage | Jest |
| Integration | Critical paths | Jest + Testcontainers (Postgres, Redis) |
| E2E | 10 user journeys | Playwright |
| Load | Peak concurrency | k6 (1000 concurrent slot lock attempts) |

### 12.3 Critical Test Scenarios

1. **Concurrency:** 100 users attempt to lock the same slot → only 1 succeeds; others see immediate 🟡 then 🔴
2. **Payment:** Successful webhook → booking confirmed; failed webhook → booking remains pending; duplicate webhook → idempotent
3. **Refund:** Cancellation > 12h → 100% refund; 6–12h → 50%; < 6h → 0%
4. **Split payment:** Partial payments → booking stays pending; all paid → booking confirmed; link expired → status reset
5. **Slot release:** Booking not completed within 5 min → lock released → slot returns to 🟢

---

## 13. Monitoring & Observability

### 13.1 Observability Stack

| Concern | Tool | Key Metrics / Traces |
|---------|------|---------------------|
| Logs | Vercel Log Drains / Papertrail | Structured JSON; filter by `service=booking` |
| Metrics | Vercel Analytics + Prometheus (self-hosted) | Request rate, p95 latency, error rate, slot lock duration |
| Tracing | OpenTelemetry (Vercel + custom) | Trace payment flow end-to-end; identify slow DB queries |
| Error Tracking | Sentry | Frontend JS errors, API route exceptions, WebSocket disconnects |
| Uptime | UptimeRobot / Vercel Health Checks | `/api/health` endpoint |

### 13.2 Key Dashboards

1. **Booking Funnel:** Search → Slot View → Lock Attempt → Payment → Confirmation
2. **Payment Health:** Success rate by gateway, average latency, refund volume
3. **Real-Time Activity:** Active WebSocket connections, slots locked/booked per minute
4. **System Resources:** Database connection pool, Redis memory, API route duration

---

## 14. Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Payment gateway downtime | Medium | High | Multi-gateway fallback; clear owner contact fallback |
| WebSocket state desync under load | Medium | High | Redis pub/sub; reconciliation cron; optimistic UI with rollback |
| PostgreSQL connection exhaustion | Low | High | Connection pooler (PgBouncer); serverless DB auto-scaling |
| Team velocity miss (6-week timeline) | High | Medium | Strict MVP scope; use Vercel to reduce infra ops |
| Security vulnerability in payment flow | Low | Critical | Use gateway-hosted checkout; regular dependency audits (`npm audit`) |
| Data loss (DB/Raid) | Low | High | Automated daily logical backups; WAL archiving |
| Third-party API rate limits | Medium | Medium | Caching + request deduplication; monitor quotas |

---

## 15. Implementation Roadmap

### Week 1: Foundation
- [x] Project scaffolding (Next.js + TypeScript + Tailwind + Prisma)
- [x] Database schema + migrations
- [x] Auth module (email/phone OTP + NextAuth)
- [x] Basic turf CRUD + photo upload (R2)
- [x] Search/filter UI with mocked data

### Week 2: Real-Time Slot Engine
- [x] Slot model + seed availability logic
- [x] Redis lock acquisition/release
- [x] WebSocket server for slot broadcasting
- [x] Frontend slot grid with real-time color updates
- [x] 5-minute background release job (BullMQ)

### Week 3: Booking & Payments
- [x] Booking creation flow (transactional)
- [x] bKash / Nagad sandbox integration
- [x] Webhook handlers + idempotency
- [x] Split payment model + link generation
- [x] Live split tracker UI
- [x] WhatsApp invite share template

### Week 4: Matchmaking & Equipment
- [x] Match request CRUD + discovery feed
- [x] Team vs Team + Goalkeeper recruitment flows
- [x] Notification system (in-app + WhatsApp)
- [x] Equipment add-on selector in checkout
- [x] Owner equipment inventory management

### Week 5: Owner & Admin Portals
- [x] Owner dashboard (revenue, bookings, payouts)
- [x] Walk-in booking override
- [x] Admin turf verification workflow
- [x] Refund policy engine (automated + manual)
- [x] QR code generation for booking pass

### Week 6: Polish & AI Layer
- [x] Weather integration + rain alerts
- [x] Recommendation engine (heuristic)
- [x] UI motion polish (emil-kowalski-design skill)
- [x] PWA manifest + offline fallback
- [x] Accessibility audit + keyboard navigation

### Week 7: Testing, Docs & Deployment
- [x] Unit + integration + E2E test suite
- [x] Load testing (k6)
- [x] Security audit (npm audit, OWASP ZAP scan)
- [x] Documentation (README, API docs, deployment guide)
- [x] Staging deploy + QA
- [x] Production deploy (Vercel)

---

## Appendix A: Architecture Decision Records (ADRs)

### ADR-001: Modular Monolith over Microservices
**Context:** 6-week academic project with 3 developers.
**Decision:** Single Next.js codebase with bounded modules.
**Consequences:** Simpler deployment, faster iteration; extraction cost paid later if project grows.

### ADR-002: PostgreSQL over NoSQL
**Context:** Strong relational requirements (bookings ↔ payments ↔ splits ↔ match requests).
**Decision:** PostgreSQL with Prisma.
**Consequences:** ACID guarantees for financial transactions; familiar SQL tooling.

### ADR-003: Redis for Slot Locks and Pub/Sub
**Context:** Sub-200ms slot state sync + atomic lock acquisition.
**Decision:** Redis.
**Consequences:** Fast, atomic operations; single point of failure mitigated by persistence and recovery cron.

### ADR-004: Gateway-Hosted Payment Checkout
**Context:** Bangladesh mobile wallet integration; limited PCI-DSS bandwidth.
**Decision:** Redirect to bKash/Nagad hosted checkout pages; no card data touches our servers.
**Consequences:** Reduced compliance scope; relies on gateway UX.

### ADR-005: Next.js Full-Stack over Separate Frontend/Backend
**Context:** Small team; need SSR for SEO (turfs) and fast prototyping.
**Decision:** Next.js App Router with API routes.
**Consequences:** Unified deploy (Vercel); frontend and backend share types via Prisma client.

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Slot** | A discrete time block (e.g., 8:00–9:00 PM) on a turf |
| **Hold & Release** | 5-minute temporary reservation that auto-expires if payment is not completed |
| **Split Payment** | Dividing a booking total among multiple players with individual payment links |
| **Match Request** | Open post for finding opponents or filling roster spots |
| **Walk-in Override** | Owner manually marking a slot as booked outside the app |
| **WebSocket Fan-out** | Broadcasting slot state changes to all connected clients viewing the same turf |

---

*Document Version: 1.0*
*Last Updated: 2026-08-30*
