# Sportzfy Software Requirements Specification

**Document ID:** SPZ-SRS-001  
**Version:** 0.1  
**Status:** Baseline draft for validation  
**Prepared:** 3 September 2026  
**Target release:** Responsive web MVP deployed to Vercel

## 1. Purpose

This SRS defines the requirements for the first workable Sportzfy website. It is the scope authority for design, implementation, testing, and final-report claims. The existing Expo application is reference material only and is not evidence that a requirement is complete.

## 2. Product overview

Sportzfy is a Bangladesh-focused football-turf marketplace. It replaces fragmented phone and social-media coordination with a single service for discovering venues, viewing availability, making bookings, managing turf inventory, and finding players for an open match.

The web application is the first client. The domain and API boundaries should allow a mobile client later without redesigning the booking rules.

## 3. Evidence and problem statement

The project research includes 22 community screenshots and a 25-person survey. The existing analysis reports that manual phone booking is common, availability and price are major selection factors, demand is concentrated in evening/night hours, and respondents value clear refunds, cost splitting, invitations, and matchmaking.

These findings justify the product direction but do not constitute production marketplace data. Demonstration venues, users, availability, ratings, and transactions must be labeled as sample data until verified real data is supplied.

## 4. Stakeholders and actors

| Actor | Goal | MVP permissions |
|---|---|---|
| Visitor | Understand the service and inspect available turfs | Browse public turf information and open matches |
| Customer/player | Find and book a suitable turf | Manage own profile, bookings, match posts, and join requests |
| Captain | Organize a game | Same as player plus create an open match associated with a booking |
| Turf owner | Maintain accurate inventory and handle reservations | Manage owned turfs, slot schedules, prices, and bookings |
| Administrator | Protect marketplace quality | Review turf listings and inspect users/bookings through authorized tools |
| Project team | Operate and support the system | Deploy, monitor, migrate, and troubleshoot without bypassing auditability |

## 5. Scope

### 5.1 MVP capabilities

- Secure account and role workflows.
- Public turf discovery and detail pages.
- Availability, short-lived slot holds, and confirmed bookings.
- Payment abstraction with a demonstrable mock or approved sandbox flow.
- Customer booking history and cancellation request/status.
- Owner turf, slot, pricing, walk-in booking, and reservation management.
- Administrator turf approval and basic oversight.
- Open-match posts and player join requests.
- Responsive, accessible web experience.
- Versioned application API suitable for a later mobile client.

### 5.2 Deferred capabilities

- Native apps.
- Real-money production payment and automated settlement.
- Split-payment collection, full refund automation, and owner payouts.
- Chat, push notification, WhatsApp Business API, tournaments, leagues, live scoring, loyalty, and advanced analytics.
- ML recommendations and dynamic pricing.
- General multi-sport expansion.

## 6. Assumptions and dependencies

- Initial sample content focuses on Chattogram and may include Dhaka examples.
- A managed PostgreSQL database will be available to preview and production environments.
- Email/password or another approved credential flow is sufficient for the assessed MVP.
- External payment, maps, weather, or messaging services are optional until credentials are supplied.
- The database, not the browser, is authoritative for booking availability.
- The user-facing timezone for initial operations is Asia/Dhaka.

## 7. Functional requirements

Requirements use **MUST**, **SHOULD**, and **MAY** with their ordinary priority meanings.

### 7.1 Identity and access

| ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-01 | The system MUST allow a visitor to create a player account using validated identity fields and a password or approved equivalent. | Must |
| FR-AUTH-02 | The system MUST allow registered users to sign in and sign out securely. | Must |
| FR-AUTH-03 | The system MUST enforce server-side permissions for player, owner, and administrator actions. | Must |
| FR-AUTH-04 | The system MUST prevent a user from modifying another user's profile, booking, turf, or match request without authorization. | Must |
| FR-AUTH-05 | The system MUST provide safe responses for invalid credentials without revealing whether an account exists. | Must |
| FR-AUTH-06 | The system SHOULD support a recoverable password-reset process when outbound email is configured. | Should |

### 7.2 Turf discovery

| ID | Requirement | Priority |
|---|---|---|
| FR-TURF-01 | Visitors MUST be able to list approved, active turfs. | Must |
| FR-TURF-02 | Users MUST be able to search by turf name and area. | Must |
| FR-TURF-03 | Users MUST be able to filter by date, price range, pitch format, amenities, and availability. | Must |
| FR-TURF-04 | Turf results MUST show name, area, representative image, starting price, pitch format, and availability summary. | Must |
| FR-TURF-05 | A turf detail page MUST show description, images, location text, amenities, pitch formats, price information, and selectable dates/slots. | Must |
| FR-TURF-06 | Unapproved, rejected, or inactive turfs MUST NOT appear in public discovery. | Must |
| FR-TURF-07 | The interface SHOULD preserve filter state while the user inspects a turf and returns to results. | Should |

### 7.3 Availability and booking

| ID | Requirement | Priority |
|---|---|---|
| FR-BOOK-01 | The system MUST derive bookable slots from owner schedules, overrides, existing holds, and confirmed bookings. | Must |
| FR-BOOK-02 | A signed-in player MUST be able to request a short-lived hold on an available slot. | Must |
| FR-BOOK-03 | Hold creation MUST be atomic so competing requests cannot both acquire the same slot. | Must |
| FR-BOOK-04 | A hold MUST have a server-controlled expiration time and MUST not remain bookable after expiry. | Must |
| FR-BOOK-05 | The checkout MUST show turf, date, time, duration, price components, cancellation summary, and payable total before confirmation. | Must |
| FR-BOOK-06 | Booking confirmation MUST be idempotent and MUST create at most one confirmed booking for a slot. | Must |
| FR-BOOK-07 | Users MUST be able to view their upcoming, completed, cancelled, and expired bookings. | Must |
| FR-BOOK-08 | Users MUST be able to open a booking and see its status and reference identifier. | Must |
| FR-BOOK-09 | The system MUST record cancellation requests and the resulting status. | Must |
| FR-BOOK-10 | The system SHOULD display availability changes without requiring a full-page reload. | Should |
| FR-BOOK-11 | The system MUST display a clear recovery action when a hold expires or confirmation fails. | Must |

### 7.4 Payment adapter

| ID | Requirement | Priority |
|---|---|---|
| FR-PAY-01 | The system MUST expose payment through a provider-neutral server-side adapter. | Must |
| FR-PAY-02 | The assessed MVP MUST include an auditable mock provider or an approved sandbox provider. | Must |
| FR-PAY-03 | Client-supplied price, success status, or callback data MUST NOT be trusted without server verification. | Must |
| FR-PAY-04 | Repeated confirmation or webhook requests MUST NOT create duplicate payments or bookings. | Must |
| FR-PAY-05 | The UI MUST identify mock/sandbox transactions so they cannot be mistaken for real payments. | Must |
| FR-PAY-06 | Production payment activation MUST remain disabled until credentials, callback verification, policies, and operational approval exist. | Must |

### 7.5 Turf-owner workspace

| ID | Requirement | Priority |
|---|---|---|
| FR-OWN-01 | An owner MUST be able to create a draft turf listing. | Must |
| FR-OWN-02 | An owner MUST be able to edit only turfs they own. | Must |
| FR-OWN-03 | A listing MUST capture name, area, description, images, pitch formats, amenities, base price, and operating information. | Must |
| FR-OWN-04 | An owner MUST be able to submit a draft listing for administrator review. | Must |
| FR-OWN-05 | An owner MUST be able to define recurring availability and price rules. | Must |
| FR-OWN-06 | An owner MUST be able to block a slot or record a walk-in booking without creating a public collision. | Must |
| FR-OWN-07 | An owner MUST be able to list and inspect bookings for owned turfs. | Must |
| FR-OWN-08 | An owner SHOULD see basic booking count, revenue total from recorded demo/sandbox transactions, and occupancy summaries with their data basis stated. | Should |

### 7.6 Administration

| ID | Requirement | Priority |
|---|---|---|
| FR-ADM-01 | An administrator MUST be able to list turf submissions awaiting review. | Must |
| FR-ADM-02 | An administrator MUST be able to approve or reject a submission with a recorded reason. | Must |
| FR-ADM-03 | Approval and rejection actions MUST be auditable. | Must |
| FR-ADM-04 | An administrator MUST be able to inspect users and bookings needed for demonstration and support. | Must |
| FR-ADM-05 | Administrator pages and APIs MUST be unavailable to non-administrators. | Must |
| FR-ADM-06 | Destructive administration actions SHOULD be avoided in the MVP; status-based suspension is preferred. | Should |

### 7.7 Open-match and player recruitment

| ID | Requirement | Priority |
|---|---|---|
| FR-MATCH-01 | A signed-in player MUST be able to create an open-match post with date/time, area or booked turf, format, skill guidance, spots, role needs, and cost-share text. | Must |
| FR-MATCH-02 | Visitors MUST be able to browse active public match posts without seeing private contact information. | Must |
| FR-MATCH-03 | A signed-in player MUST be able to request to join an open match. | Must |
| FR-MATCH-04 | A post owner MUST be able to accept or reject pending join requests. | Must |
| FR-MATCH-05 | Accepted requests MUST reduce available spots without allowing the count to become negative. | Must |
| FR-MATCH-06 | A post owner MUST be able to close a post; closed or full posts MUST reject new requests. | Must |

### 7.8 Cross-cutting behavior

| ID | Requirement | Priority |
|---|---|---|
| FR-COM-01 | Forms MUST provide field-level validation and retain safe user input after recoverable errors. | Must |
| FR-COM-02 | Data-driven pages MUST define loading, empty, error, unauthorized, and success states. | Must |
| FR-COM-03 | User-visible dates and times MUST use Asia/Dhaka for the initial release while stored timestamps remain unambiguous. | Must |
| FR-COM-04 | The system MUST distinguish real, sandbox, and seeded demonstration data where confusion is possible. | Must |

## 8. Business rules

| ID | Rule |
|---|---|
| BR-01 | Only approved and active turfs are publicly bookable. |
| BR-02 | A bookable unit is a turf plus a non-overlapping start/end interval. |
| BR-03 | The database is the final authority on whether an interval can be held or booked. |
| BR-04 | A hold expires according to server time; the client countdown is informational. |
| BR-05 | A confirmed booking cannot overlap another confirmed booking or active hold for the same turf. |
| BR-06 | A walk-in booking uses the same collision rules as an online booking. |
| BR-07 | Prices used for confirmation are calculated and persisted by the server, not accepted from the client. |
| BR-08 | Cancellation/refund outcomes are recorded separately from a booking's original payment record. |
| BR-09 | An owner cannot approve their own turf listing. |
| BR-10 | Public match posts do not expose personal contact information by default. |

The exact hold duration and cancellation/refund schedule are Phase 2 decisions and must be configurable rather than embedded only in interface copy.

## 9. Non-functional requirements

### 9.1 Security and privacy

| ID | Requirement |
|---|---|
| NFR-SEC-01 | All authorization decisions MUST be enforced on the server. |
| NFR-SEC-02 | Passwords MUST be processed through an established authentication mechanism and never stored or logged as plaintext. |
| NFR-SEC-03 | Secrets MUST remain server-side and outside source control. |
| NFR-SEC-04 | State-changing requests MUST be protected against cross-site request forgery as applicable to the authentication design. |
| NFR-SEC-05 | Inputs MUST be validated at trust boundaries and database operations parameterized through the ORM or equivalent. |
| NFR-SEC-06 | Authentication and sensitive mutation endpoints MUST be rate limited. |
| NFR-SEC-07 | Logs MUST exclude passwords, tokens, full payment payloads, and unnecessary personal information. |
| NFR-SEC-08 | Users MUST be able to access only the minimum data required for their role. |

### 9.2 Reliability and integrity

| ID | Requirement |
|---|---|
| NFR-REL-01 | Database constraints and transactions MUST preserve booking uniqueness under concurrency. |
| NFR-REL-02 | Payment and booking confirmation operations MUST support idempotency. |
| NFR-REL-03 | Failed external integrations MUST degrade to an explicit unavailable state rather than corrupt booking state. |
| NFR-REL-04 | Database migrations MUST be repeatable on a clean environment and included in release verification. |

### 9.3 Performance

| ID | Requirement |
|---|---|
| NFR-PERF-01 | Public pages SHOULD meet the agreed Core Web Vitals target in the production preview using representative mobile conditions. |
| NFR-PERF-02 | Search and standard authenticated API requests SHOULD complete within one second at the academic test load, excluding third-party redirects. |
| NFR-PERF-03 | Images MUST be responsive, sized appropriately, and lazy loaded when outside the initial viewport. |
| NFR-PERF-04 | Collection endpoints MUST use bounded pagination or an explicit maximum result size. |

### 9.4 Accessibility and usability

| ID | Requirement |
|---|---|
| NFR-A11Y-01 | Critical journeys MUST be keyboard operable. |
| NFR-A11Y-02 | Controls MUST have programmatic names, visible focus, and sufficient target size. |
| NFR-A11Y-03 | Text and state indicators MUST not rely on color alone. |
| NFR-A11Y-04 | Forms MUST expose labels, instructions, validation relationships, and an error summary where appropriate. |
| NFR-A11Y-05 | Content SHOULD meet WCAG 2.2 AA criteria applicable to the implemented surfaces. |
| NFR-A11Y-06 | The interface MUST remain usable at 320 CSS pixels without horizontal page scrolling in critical flows. |

### 9.5 Maintainability and portability

| ID | Requirement |
|---|---|
| NFR-MNT-01 | Business rules MUST not be implemented only in client components. |
| NFR-MNT-02 | Domain services and versioned API contracts MUST be reusable by a later mobile client. |
| NFR-MNT-03 | Source MUST follow automated formatting, linting, type checking, and documented naming conventions. |
| NFR-MNT-04 | Environment configuration MUST be validated at startup/build time without exposing secrets. |
| NFR-MNT-05 | Major architectural decisions and known tradeoffs MUST be documented. |

## 10. Data requirements

The MVP requires persistent records for:

- User identity, role, profile, and account status.
- Turf ownership, listing status, descriptions, media references, formats, amenities, and location text.
- Availability/price rules and concrete slot or blocked-interval records.
- Holds with status and expiration.
- Bookings with immutable price snapshot and lifecycle timestamps.
- Payment attempts with provider, external reference when applicable, amount, and status.
- Match posts, requested roles, available spots, status, and join requests.
- Administrative review and security-relevant audit events.

Exact tables and relationships are defined in the architecture specification.

## 11. Primary use cases

### UC-01: Discover a turf

- **Actor:** Visitor or player.
- **Precondition:** Approved turf data exists.
- **Flow:** Open discovery, enter search/filter criteria, inspect results, open a turf.
- **Postcondition:** The selected turf detail and availability are visible; no reservation is created.
- **Alternates:** No results, data unavailable, invalid filter combination.

### UC-02: Book an available slot

- **Actor:** Signed-in player.
- **Precondition:** Turf is approved and slot is available.
- **Flow:** Select date/slot, acquire hold, review price/policy, complete mock or sandbox payment, confirm booking.
- **Postcondition:** One confirmed booking exists and the slot is unavailable to others.
- **Alternates:** Competing user wins the slot, hold expires, payment is cancelled/fails, repeated confirmation request.

### UC-03: Manage turf availability

- **Actor:** Turf owner.
- **Precondition:** Owner controls the turf.
- **Flow:** Define schedule/prices or block an interval; submit changes.
- **Postcondition:** Future availability reflects the valid change without altering unrelated confirmed bookings.
- **Alternates:** Overlap with a confirmed booking, invalid interval, unauthorized turf.

### UC-04: Record a walk-in booking

- **Actor:** Turf owner.
- **Precondition:** Owner controls the turf and target interval is free.
- **Flow:** Select interval, enter minimal booking reference, confirm.
- **Postcondition:** The interval is unavailable through public booking and is visible in the owner schedule.
- **Alternates:** Collision, invalid time, authorization failure.

### UC-05: Approve a turf

- **Actor:** Administrator.
- **Precondition:** A submitted listing awaits review.
- **Flow:** Inspect listing, approve or reject with reason.
- **Postcondition:** Status and audit record are stored; approved listing becomes eligible for discovery.
- **Alternates:** Listing changed during review, missing required information, unauthorized actor.

### UC-06: Recruit a player

- **Actor:** Captain/post owner and another signed-in player.
- **Precondition:** An active post has an available spot.
- **Flow:** Player requests to join; owner reviews and accepts; spots decrease.
- **Postcondition:** Join request is accepted and the roster capacity remains valid.
- **Alternates:** Post closes or fills, duplicate request, owner rejects request.

## 12. External interfaces

- **Browser:** Responsive desktop and mobile web interface.
- **Application API:** Versioned JSON endpoints under `/api/v1`; details in the architecture specification.
- **Database:** Managed PostgreSQL reachable only through server-side application code and controlled tooling.
- **Payment:** Provider-neutral adapter; mock is mandatory until an approved sandbox is selected.
- **Media:** Local seeded assets or managed object storage selected before production content upload.
- **Deployment:** Vercel preview and production environments.

## 13. AI integration decision

The guideline includes AI-related sections, but an AI capability is not currently required for the booking MVP. The team must confirm whether the course requires one. If required, it will be specified as a bounded, testable feature with a non-AI fallback and separate acceptance criteria. Weather lookup or fixed recommendation rules must not be mislabeled as artificial intelligence.

## 14. MVP acceptance summary

The MVP is acceptable when:

1. A visitor can discover an approved turf on desktop and mobile layouts.
2. A player can register/sign in and create a persistent booking.
3. A concurrency test proves that two requests cannot confirm the same slot.
4. An owner can create/submit a turf, manage availability, and inspect bookings.
5. An administrator can approve a turf and the permission boundary is tested.
6. A player can create an open match and process a join request.
7. Mock/sandbox payments are clearly identified and idempotent.
8. Critical automated and UAT cases pass in the deployed release candidate.
9. The production build is deployed to Vercel with documented limitations.

## 15. Requirements status and change control

All requirements in this version are **proposed baseline** until the team approves them. Changes after approval require a change record identifying affected requirement IDs, design/API/test impact, decision, and date. Implemented, tested, and deployed are separate statuses; none is implied by inclusion in this SRS.

## 16. Open decisions

- [ ] Confirm hold duration.
- [ ] Confirm cancellation and refund rules for the assessed MVP.
- [ ] Confirm account recovery and email provider scope.
- [ ] Confirm owner onboarding/verification evidence requirements.
- [ ] Confirm managed database and media-storage providers.
- [ ] Confirm mock payment only or official sandbox integration.
- [ ] Confirm whether AI integration is required.
- [ ] Confirm final accessibility target with the supervisor.

