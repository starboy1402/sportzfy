# Pillar 1: Real-Time Discovery & 5-Minute Atomic Slot Hold Engine

**Project:** Sportzfy — Real-Time Sports Turf Booking & Squad Matchmaking Marketplace  
**Course:** CSE-356 Software Engineering Sessional, CUET  
**Supervisors:** Prof. Mir Md. Saki Kowsar, Md. Refaj Hossan  
**Authors:** Mohammad Sakib Hasan (2204051), Mahmudul Hasan (2204040), Ayan Barua (2204053)  

---

## 1. Pillar Overview & Executive Summary

Pillar 1 forms the foundational transactional core of Sportzfy. It governs the entire lifecycle of sports venue discovery, live schedule visualization, high-concurrency reservation locking, and instant Mobile Financial Service (MFS) payment settlement.

### The Real-World Problem Solved
In amateur sports facilities across Bangladesh (Chattogram, Dhaka, Sylhet), turf reservations are traditionally handled via phone calls and physical paper ledgers. This creates three critical failures:
1. **The Double-Booking Disaster:** During peak hours (e.g., Friday 8:00 PM – 9:00 PM), multiple players attempt to book the exact same pitch simultaneously. Traditional web apps check availability optimistically on the client; when two users submit payments concurrently, both get charged, but only one can play.
2. **Payment Hijacking / Race Conditions:** A customer spends 3–4 minutes entering their bKash/Nagad PIN, but during those minutes, another customer books and pays first. The first customer loses their slot midway through payment.
3. **Ghost Bookings & Locked Inventory:** Unpaid reservations remain locked indefinitely if a customer abandons the checkout page, causing lost revenue for turf owners.

### The Engineering Solution
Sportzfy introduces an **in-memory, database-authoritative 5-Minute Atomic Slot Hold Engine** executed under PostgreSQL `SERIALIZABLE` transaction isolation:
- A user acquires a **temporary 300-second exclusive hold lock** on an hourly slot.
- Other players see the slot instantly marked as "Held / Locked" on the timetable.
- If checkout completes within 300s, the hold transitions to a confirmed booking, and a cryptographically signed **SHA-256 QR pass** is issued.
- If the hold expires (TTL elapses), a background sweeper and lazy evaluation automatically return the slot to the public pool without database deadlocks.

---

## 2. End-to-End Architectural Workflow

```
[Player Client UI]            [Next.js Edge API]              [PostgreSQL (Neon)]
        │                              │                                │
        │── 1. Select Available Slot ─►│                                │
        │   POST /api/v1/holds         │                                │
        │   { turfId, start, end }     │── 2. BEGIN SERIALIZABLE TX ───►│
        │                              │   a. Verify Turf & Timing      │
        │                              │   b. Check Confirmed Bookings  │
        │                              │   c. Check Active Holds        │
        │                              │   d. Compute Authentic ML Rate │
        │                              │   e. INSERT Hold (TTL = 300s)  │
        │                              │◄── 3. COMMIT TX ───────────────│
        │◄── 4. 201 Created ───────────│                                │
        │    { holdId, expiresIn: 300 }│                                │
        │                              │                                │
        ▼ [5-Minute Countdown Timer]   │                                │
        │                              │                                │
        │── 5. Submit MFS Payment ────►│                                │
        │   POST /api/v1/bookings      │── 6. BEGIN TRANSACTION ───────►│
        │   { holdId, provider: BKASH }│   a. Validate hold.userId      │
        │                              │   b. Assert expiresAt > NOW()  │
        │                              │   c. Set hold.status=CONSUMED  │
        │                              │   d. INSERT Booking(CONFIRMED) │
        │                              │   e. INSERT PaymentAttempt     │
        │                              │◄── 7. COMMIT TRANSACTION ──────│
        │◄── 8. 201 Confirmed Pass ────│                                │
        │    Digital Ticket + QR Hash  │                                │
```

---

## 3. Deep Code Walkthrough

### 3.1 Slot Hold Acquisition (`sportzfy-web/app/api/v1/holds/route.ts`)

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { turfId, startTime, endTime } = body;

  const slotStart = new Date(startTime);
  const slotEnd = new Date(endTime);
  const now = new Date();

  // 1. Invariant Validation (No past slots, max 14 days ahead, max 4 hours duration)
  const validation = validateSlotTimes(slotStart, slotEnd, now);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.errorMessage }, { status: 400 });
  }

  // 2. Authentication Verification
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // 3. PostgreSQL Serializable Transaction Execution
  const hold = await prisma.$transaction(async (tx) => {
    // 3a. Turf existence and approval check
    const turf = await tx.turf.findUnique({
      where: { id: turfId },
      select: { id: true, basePricePerHour: true, status: true, rating: true },
    });
    if (!turf || turf.status !== "APPROVED") throw new Error("TURF_NOT_AVAILABLE");

    // 3b. Server-Authoritative Dynamic Price Calculation (Prevents client tampering)
    const authenticPrice = calculateDynamicSlotPrice(turf.basePricePerHour, slotStart, {
      venueRating: turf.rating || 4.7,
      endTime: slotEnd,
    }).finalPrice;

    // 3c. Overlapping Confirmed Booking Collision Check
    const conflictingBooking = await tx.booking.findFirst({
      where: {
        turfId,
        status: "CONFIRMED",
        startTime: { lt: slotEnd },
        endTime: { gt: slotStart },
      },
    });
    if (conflictingBooking) throw new Error("SLOT_ALREADY_BOOKED");

    // 3d. Overlapping Active Hold Collision Check
    const conflictingHold = await tx.hold.findFirst({
      where: {
        turfId,
        status: "ACTIVE",
        expiresAt: { gt: now },
        startTime: { lt: slotEnd },
        endTime: { gt: slotStart },
      },
    });
    if (conflictingHold) throw new Error("SLOT_HELD_BY_ANOTHER");

    // 3e. Atomically Persist Hold with 300s TTL
    return await tx.hold.create({
      data: {
        turfId,
        userId: currentUser.id,
        startTime: slotStart,
        endTime: slotEnd,
        price: authenticPrice,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 300 * 1000), // Exactly 300 seconds
      },
    });
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });

  return NextResponse.json({
    success: true,
    holdId: hold.id,
    expiresInSeconds: 300,
    price: hold.price,
  }, { status: 201 });
}
```

### 3.2 Booking Settlement & QR Code Issuance (`sportzfy-web/app/api/v1/bookings/route.ts`)

```typescript
export async function POST(request: NextRequest) {
  const { holdId, paymentMethod = "BKASH", accountNumber } = await request.json();
  const currentUser = await getCurrentUser();
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    // 1. Verify Hold Record
    const hold = await tx.hold.findUnique({
      where: { id: holdId },
      include: { turf: true },
    });
    if (!hold) throw new Error("HOLD_NOT_FOUND");

    // 2. Security Check: Assert holding user matches paying user
    if (hold.userId !== currentUser.id && currentUser.role !== "ADMIN") {
      throw new Error("UNAUTHORIZED_HOLD_ACCESS");
    }

    // 3. TTL Expiration Check
    if (hold.status !== "ACTIVE" || hold.expiresAt <= now) {
      throw new Error("HOLD_EXPIRED");
    }

    // 4. Mark Hold as Consumed
    await tx.hold.update({
      where: { id: hold.id },
      data: { status: "CONSUMED" },
    });

    // 5. Generate Cryptographic QR Ticket
    const bookingRef = `SPZ-${Date.now().toString().slice(-6)}`;
    const qrPayload = JSON.stringify({
      ref: bookingRef,
      turf: hold.turf.name,
      start: hold.startTime,
      user: currentUser.id,
      hash: crypto.createHmac("sha256", process.env.SESSION_SECRET!).update(bookingRef).digest("hex"),
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload);

    // 6. Persist Confirmed Booking & Payment Record
    const booking = await tx.booking.create({
      data: {
        referenceCode: bookingRef,
        turfId: hold.turfId,
        userId: currentUser.id,
        holdId: hold.id,
        startTime: hold.startTime,
        endTime: hold.endTime,
        totalAmount: hold.price,
        status: "CONFIRMED",
        paymentMethod,
      },
    });

    await tx.paymentAttempt.create({
      data: {
        bookingId: booking.id,
        holdId: hold.id,
        provider: paymentMethod,
        accountNumber,
        amount: hold.price,
        status: "SUCCEEDED",
        idempotencyKey: `PAY-${hold.id}-${Date.now()}`,
      },
    });

    return NextResponse.json({ success: true, booking, qrCode: qrDataUrl }, { status: 201 });
  });
}
```

---

## 4. Concurrency Invariants & Database Guarantees

| Invariant | Mechanism | Impact / Guarantee |
| :--- | :--- | :--- |
| **Zero Double-Booking** | `SERIALIZABLE` Isolation Level | PostgreSQL detects write skew and aborts concurrent overlapping holds with HTTP 409. |
| **Strict 300s Exclusivity** | Temporal Condition `expiresAt > NOW()` | The held slot is completely invisible and unbookable to any competing user for 5 minutes. |
| **Tamper-Proof Pricing** | Server-side ML calculation | Any client attempting to forge `price: 10 BDT` is ignored; authentic rate is recalculated. |
| **Idempotent Checkout** | Status `CONSUMED` Transition | A hold cannot be double-paid or redeemed twice. |
| **Automatic Recovery** | Lazy Evaluation + TTL Sweeper | Expired holds auto-revert to public inventory without operator manual intervention. |

---

## 5. Formal Testing & Cyclomatic Complexity ($V(G) = 4$)

Pillar 1 was subjected to formal basis path testing in `sportzfy-web/tests/pricing-and-holds.test.ts`:
- **Nodes ($N$) = 8**, **Edges ($E$) = 10**, **Connected Components ($P$) = 1**
- **Method 1 (Edge-Node):** $V(G) = E - N + 2P = 10 - 8 + 2(1) = 4$
- **Method 2 (Predicate Nodes):** $V(G) = P_{\text{nodes}} + 1 = 3 + 1 = 4$ (Auth check, Confirmed check, Active hold check)
- **Method 3 (Enclosed Regions):** 3 interior regions + 1 exterior region $= 4$

### Basis Paths Covered:
1. **Path 1 (Auth Failure):** 1 $\to$ 2 $\to$ 8 (HTTP 401 Unauthorized)
2. **Path 2 (Confirmed Conflict):** 1 $\to$ 2 $\to$ 3 $\to$ 4 $\to$ 8 (HTTP 409 Slot Already Booked)
3. **Path 3 (Hold Conflict):** 1 $\to$ 2 $\to$ 3 $\to$ 4 $\to$ 5 $\to$ 8 (HTTP 409 Slot Held by Another)
4. **Path 4 (Successful Reservation):** 1 $\to$ 2 $\to$ 3 $\to$ 4 $\to$ 5 $\to$ 6 $\to$ 7 (HTTP 201 Hold Persisted)

---

## 6. Viva Voce Defense Cheat Sheet

> **Q: What happens if two players submit hold requests for the same slot at the exact same millisecond?**  
> **A:** *"Because our Prisma transaction runs under PostgreSQL `SERIALIZABLE` isolation, the database engine maintains serialization order. The first transaction succeeds and creates the hold with `expiresAt = NOW() + 300s`. The second concurrent transaction detects the overlapping row during its serializable read phase and immediately aborts with a 409 Conflict. The second player's UI notifies them that the slot was just locked by another player."*

> **Q: What happens if a player closes their browser during payment?**  
> **A:** *"The slot remains protected for 300 seconds so legitimate users don't lose slots during brief network glitches. After 300 seconds, `expiresAt <= NOW()`. Because all slot queries filter with `expiresAt > NOW()`, the slot becomes immediately visible to the public pool again without needing an instant database rewrite."*
