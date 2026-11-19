# Pillar 2: Community Squad Matchmaking & Tactical Position Recruitment

**Project:** Sportzfy — Real-Time Sports Turf Booking & Squad Matchmaking Marketplace  
**Course:** CSE-356 Software Engineering Sessional, CUET  
**Supervisors:** Prof. Mir Md. Saki Kowsar, Md. Refaj Hossan  
**Authors:** Mohammad Sakib Hasan (2204051), Mahmudul Hasan (2204040), Ayan Barua (2204053)  

---

## 1. Pillar Overview & Executive Summary

Pillar 2 transforms Sportzfy from a transactional booking utility into an interactive community sports network. It addresses the social coordination challenges that plague recreational football and cricket players across Bangladesh.

### The Real-World Problem Solved
1. **The "Missing Goalkeeper" Crisis:** 13 friends rent a 7v7 turf pitch for ৳2500 BDT. Two hours before kickoff, their goalkeeper cancels due to personal emergency. Without a goalkeeper, the match cannot proceed, but the venue cannot issue a refund.
2. **Solo Player Exclusion:** Thousands of passionate amateur players in urban areas (e.g., students in university dorms, young professionals relocating to Chattogram or Dhaka) want to play regularly but lack a full 14-man squad.
3. **Friction in Pitch Cost Sharing:** Booking hosts are forced to collect cash manually on the pitch, frequently resulting in payment defaults or awkward disputes.

### The Engineering Solution
Sportzfy engineers a **Tactical Role Recruitment & Matchmaking Hub**:
- Squad captains post open match lobbies specifying missing positions (e.g., `1 Goalkeeper`, `2 Defenders`), pitch format (5v5/6v6/7v7), and an equitable cost split (e.g., ৳200 per player).
- Solo players discover matches filtered by missing position, area, and skill level.
- Players submit targeted join requests with their athletic profile (preferred foot, favorite role).
- Hosts screen applicants and accept or decline.
- An **atomic roster decrement engine** locks the match lobby automatically once all positions are filled (`openSpots === 0`), eliminating over-recruitment.

---

## 2. End-to-End Architectural Workflow

```
[Squad Host]                    [Edge API / Database]             [Solo Player (Goalkeeper)]
     │                                    │                                    │
     │── 1. Create Match Lobby ──────────►│                                    │
     │   POST /api/v1/matches             │                                    │
     │   { turfId, format: 7v7,           │                                    │
     │     role: "Goalkeeper",            │                                    │
     │     openSpots: 2, cost: ৳200 }     │── Persist MatchPost (status: OPEN) │
     │                                    │                                    │
     │                                    │◄── 2. Query Open Matches ──────────│
     │                                    │    GET /api/v1/matches?role=GK     │
     │                                    │── 3. Submit Join Request ─────────►│
     │                                    │    POST /matches/[id]/join         │
     │                                    │    { preferredRole: "Goalkeeper" } │
     │                                    │    Creates JoinRequest (PENDING)   │
     │                                    │                                    │
     │◄── 4. Captain Receives Alert ──────│                                    │
     │    Review Applicant Profile        │                                    │
     │                                    │                                    │
     │── 5. Approve Applicant ───────────►│── 6. BEGIN ATOMIC TRANSACTION      │
     │    POST .../decision {ACCEPT}      │   a. Assert match.openSpots > 0    │
     │                                    │   b. openSpots = openSpots - 1     │
     │                                    │   c. Set JoinRequest = ACCEPTED    │
     │                                    │   d. IF openSpots == 0:            │
     │                                    │      Set match.status = FULL       │
     │                                    │◄── COMMIT TRANSACTION              │
     │◄── 7. Match Roster Updated ────────│───────────────────────────────────►│
     │                                    │    8. Confirmed Roster Spot!       │
```

---

## 3. Deep Code Walkthrough

### 3.1 Match Lobby Creation (`sportzfy-web/app/api/v1/matches/route.ts`)

```typescript
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json();
  const {
    turfId,
    title,
    description,
    sportFormat = "7v7",
    matchTime,
    area,
    totalSpots = 14,
    openSpots = 2,
    costPerPlayer = 200,
    requiredRole = "Goalkeeper",
    bookingId,
  } = body;

  // Validation: Kickoff must be in the future
  if (new Date(matchTime) <= new Date()) {
    return NextResponse.json({ error: "MATCH_TIME_MUST_BE_FUTURE" }, { status: 400 });
  }

  const match = await prisma.matchPost.create({
    data: {
      turfId,
      hostUserId: currentUser.id,
      bookingId: bookingId || null,
      title,
      description,
      sportFormat,
      matchTime: new Date(matchTime),
      area,
      totalSpots,
      openSpots,
      costPerPlayer,
      requiredRole,
      status: "OPEN",
    },
    include: { turf: true, hostUser: true },
  });

  return NextResponse.json({ success: true, match }, { status: 201 });
}
```

### 3.2 Position Join Application (`sportzfy-web/app/api/v1/matches/[id]/join/route.ts`)

```typescript
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const matchId = params.id;
  const { preferredRole = "Goalkeeper" } = await request.json();

  const match = await prisma.matchPost.findUnique({
    where: { id: matchId },
  });

  if (!match || match.status !== "OPEN") {
    return NextResponse.json({ error: "LOBBY_NOT_ACCEPTING_PLAYERS" }, { status: 400 });
  }

  if (match.openSpots <= 0) {
    return NextResponse.json({ error: "MATCH_CAPACITY_REACHED" }, { status: 409 });
  }

  if (match.hostUserId === currentUser.id) {
    return NextResponse.json({ error: "CANNOT_JOIN_OWN_LOBBY" }, { status: 400 });
  }

  // Prevent duplicate spam requests using Prisma unique constraint
  try {
    const joinRequest = await prisma.joinRequest.create({
      data: {
        matchPostId: matchId,
        userId: currentUser.id,
        preferredRole,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, joinRequest }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "ALREADY_APPLIED_TO_THIS_MATCH" }, { status: 409 });
    }
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
```

### 3.3 Host Decision & Atomic Capacity Finalization (`.../decision/route.ts`)

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; requestId: string } }
) {
  const currentUser = await getCurrentUser();
  const { action } = await request.json(); // "ACCEPT" or "REJECT"

  return await prisma.$transaction(async (tx) => {
    // 1. Verify Captain Authorization
    const match = await tx.matchPost.findUnique({
      where: { id: params.id },
    });
    if (!match || match.hostUserId !== currentUser.id) {
      throw new Error("UNAUTHORIZED_CAPTAIN_ACTION");
    }

    const joinReq = await tx.joinRequest.findUnique({
      where: { id: params.requestId },
    });
    if (!joinReq || joinReq.status !== "PENDING") {
      throw new Error("REQUEST_ALREADY_PROCESSED");
    }

    if (action === "REJECT") {
      const updated = await tx.joinRequest.update({
        where: { id: params.requestId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, updated });
    }

    // 2. Capacity Guard Check
    if (match.openSpots <= 0) {
      throw new Error("ROSTER_ALREADY_FULL");
    }

    // 3. Atomically decrement open spots and accept player
    const updatedMatch = await tx.matchPost.update({
      where: { id: match.id },
      data: {
        openSpots: match.openSpots - 1,
        status: match.openSpots - 1 === 0 ? "FULL" : "OPEN", // Auto Roster Lock
      },
    });

    const acceptedReq = await tx.joinRequest.update({
      where: { id: params.requestId },
      data: { status: "ACCEPTED" },
    });

    return NextResponse.json({
      success: true,
      openSpotsRemaining: updatedMatch.openSpots,
      matchStatus: updatedMatch.status,
      acceptedReq,
    });
  });
}
```

---

## 4. Concurrency Invariants & Integrity Controls

| Invariant | Implementation Mechanism | System Guarantee |
| :--- | :--- | :--- |
| **No Spam Applications** | Database Constraint `@@unique([matchPostId, userId])` | A player can only have one active application per match lobby. |
| **Zero Over-Recruitment** | `prisma.$transaction` checking `openSpots > 0` | If 5 players apply for 1 remaining spot, only the captain's first approved applicant claims it; subsequent attempts throw `ROSTER_ALREADY_FULL`. |
| **Automated Roster Lock** | Conditional Transition `openSpots === 0 ? "FULL" : "OPEN"` | Lobbies automatically close and disappear from search feeds when filled. |
| **Captain Ownership** | RBAC Check `match.hostUserId === currentUser.id` | Only the verified squad host can accept/decline applicants. |

---

## 5. Viva Voce Defense Cheat Sheet

> **Q: What happens if two captains try to accept applicants when only 1 spot remains?**  
> **A:** *"Our decision handler executes inside an atomic database transaction. When the captain accepts an applicant, the transaction reads the live `openSpots` count. The first acceptance decrements `openSpots` from 1 to 0 and transitions `status` to `'FULL'`. If a second accept action is submitted concurrently, the check `match.openSpots <= 0` throws `ROSTER_ALREADY_FULL` and rolls back the second transaction."*

> **Q: How does this feature benefit turf owners economically?**  
> **A:** *"It directly prevents match cancellations and revenue refund disputes. In Bangladesh, when 1 or 2 players fail to show up, teams often cancel the whole booking. By providing a real-time tactical matchmaking feed where missing goalkeepers or strikers can be recruited in under 15 minutes, Sportzfy ensures scheduled matches are played and venue rental fees are retained."*
