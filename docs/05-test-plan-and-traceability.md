# Sportzfy Test Plan and Requirements Traceability

**Document ID:** SPZ-TP-001  
**Version:** 0.1  
**Status:** Baseline test strategy  
**Prepared:** 3 September 2026  
**System under test:** Sportzfy responsive web MVP

## 1. Purpose

This plan defines how the team will verify that Sportzfy meets its SRS, preserves booking integrity, protects role boundaries, works on mobile and desktop browsers, and can be deployed safely to Vercel. It also defines the evidence required for the final report.

No test is marked passed until it has been executed against an identified build and its result is retained.

## 2. Objectives

- Verify each Must requirement through at least one appropriate test.
- Prove that competing requests cannot confirm the same turf interval.
- Verify permissions independently of whether the UI hides a control.
- Verify the complete player booking, owner management, administrator review, and match-join journeys.
- Detect regressions through automated pull-request checks.
- Verify responsive behavior, keyboard access, and meaningful error recovery.
- Produce reproducible test results, screenshots, and traceability evidence for the report.

## 3. Scope

### 3.1 Included

- Domain and utility unit tests.
- React component and form behavior tests.
- API/application integration tests against PostgreSQL.
- Booking concurrency and idempotency tests.
- End-to-end browser tests.
- Role/authorization, validation, and basic security-oriented tests.
- Accessibility checks and manual keyboard/screen-reader review.
- Production build, migration, deployment, smoke, and recovery checks.
- Bounded performance and volume tests appropriate to the academic MVP.

### 3.2 Excluded until implemented/approved

- Real-money payment certification.
- Native Android/iOS testing.
- High-scale distributed load testing.
- Third-party penetration testing.
- ML model quality tests when no AI feature is approved.

## 4. Test approach

```text
Static checks
  -> Unit tests
    -> Component tests
      -> API/database integration tests
        -> Browser end-to-end tests
          -> Manual accessibility/UAT
            -> Preview and production smoke tests
```

Lower levels cover many deterministic rules quickly. Browser tests cover a small set of critical journeys. Manual testing focuses on usability, accessibility, visual behavior, and external-system conditions that automation cannot establish reliably.

## 5. Test levels

| Level | Primary targets | Typical tooling | Execution |
|---|---|---|---|
| Static | Formatting, lint, types, forbidden imports/config | Formatter, linter, TypeScript | Every pull request |
| Unit | Price/time rules, transitions, validation, permissions | Unit test runner | Every pull request |
| Component | Forms, filters, status displays, error/empty states | Testing Library | Every pull request |
| Integration | Repositories, transactions, APIs, auth boundaries | Test runner + isolated PostgreSQL | Pull request/CI |
| Concurrency | Holds, booking uniqueness, idempotency | Parallel integration requests | Pull request and release |
| E2E | Critical user journeys in a real browser | Playwright | Preview/release |
| Accessibility | Semantics, keyboard, contrast, screen-reader behavior | Automated scanner + manual review | Feature/release |
| Performance | Public pages and critical endpoints | Browser performance + bounded load tool | Release candidate |
| Security-oriented | Access control, validation, session/headers, dependency review | Automated tests and approved scanners | Release candidate |
| UAT | Product usefulness and clarity | Scripted team/user review | Preview release |

## 6. Test environments

| Environment | Data | Purpose |
|---|---|---|
| Local | Resettable developer database and seeded fixtures | Development and debugging |
| CI | Isolated ephemeral/test database | Repeatable automated verification |
| Vercel preview | Non-production database and sandbox/mock integrations | E2E, UAT, responsive review |
| Production | Production database and production-safe configuration | Post-deploy smoke and monitoring only |

Automated tests must never target production payment credentials or destructively reset production data.

## 7. Test data strategy

Deterministic seeds should include:

- One player, one captain, two owners, and one administrator.
- Approved, pending, rejected, and inactive turf listings.
- Turfs in at least two areas, with different formats, amenities, and prices.
- Available, held, booked, blocked, expired, and walk-in intervals.
- Upcoming, completed, cancelled, and payment-pending bookings.
- Open, full, closed, and cancelled match posts.
- Pending, accepted, rejected, and duplicate join-request conditions.

Fixtures must use obviously synthetic names and non-real contact information. Tests create their own collision-sensitive records and clean them without assuming test order.

## 8. Test design techniques

- **Equivalence partitioning:** valid/invalid roles, statuses, filters, and form inputs.
- **Boundary value analysis:** prices, spot counts, date ranges, hold expiry, pagination limits, image sizes.
- **State-transition testing:** turf approval, hold, booking, payment, match post, and join request lifecycles.
- **Decision tables:** role/action authorization and cancellation outcomes.
- **Pairwise testing:** commonly combined filters and responsive browser/device coverage.
- **Concurrency testing:** simultaneous hold/confirm requests against the same interval.
- **Error guessing:** double-clicks, stale tabs, browser refresh, back navigation, expired session, provider replay.
- **Exploratory testing:** unfamiliar owner scheduling and mobile checkout behavior.

## 9. Entry and exit criteria

### 9.1 Feature-test entry

- Requirement ID and acceptance criteria exist.
- Implementation is available in a testable environment.
- Required migrations and seed data are available.
- Known external dependencies have a deterministic mock/sandbox path.

### 9.2 Release-test entry

- All intended MVP functionality is merged.
- Clean production build succeeds.
- Database migration succeeds on an empty/rehearsal database.
- No open critical implementation blocker remains.

### 9.3 Release exit

- All critical test cases pass.
- All Must requirements have traced evidence or are explicitly removed through change control.
- No open critical/high security or data-integrity defect remains.
- Browser journeys pass on agreed mobile and desktop targets.
- Accessibility review has no blocker in a critical journey.
- Preview UAT is approved.
- Production deployment and smoke test succeed.
- Known limitations and deferred requirements are documented.

## 10. Defect severity

| Severity | Definition | Example |
|---|---|---|
| Critical | Data/security loss or core system cannot safely operate | Double booking; unauthorized admin action; real secret exposed |
| High | Critical journey blocked with no acceptable workaround | Checkout cannot confirm; owner cannot publish turf |
| Medium | Feature partially fails but safe workaround exists | One filter ignored; recoverable layout problem |
| Low | Minor content/visual issue without material task impact | Non-critical spacing or wording defect |

Critical defects block release. High defects block release unless the affected requirement is formally removed from scope and the limitation is disclosed.

## 11. Critical detailed test cases

| ID | Requirement(s) | Scenario and procedure | Expected result | Level |
|---|---|---|---|---|
| TC-AUTH-01 | FR-AUTH-01/02 | Register a new synthetic player, sign out, then sign in | Account persists; session is established and cleared correctly | E2E/integration |
| TC-AUTH-02 | FR-AUTH-03/04, FR-ADM-05 | Request owner/admin mutations using a player session and direct HTTP calls | Each request is rejected; no data changes; safe audit/log signal exists | Integration/security |
| TC-TURF-01 | FR-TURF-01/06 | Seed approved, pending, rejected, inactive turfs and list public results | Only approved/active turfs appear | Integration/E2E |
| TC-TURF-02 | FR-TURF-02/03/07 | Apply area/date/price/format/amenity filters, open a turf, then return | Results are correct and prior filter context is preserved where specified | Component/E2E |
| TC-HOLD-01 | FR-BOOK-02/03, NFR-REL-01 | Send simultaneous hold requests for the same turf interval | Exactly one active hold succeeds; all losing requests receive stable conflict response | Concurrency integration |
| TC-HOLD-02 | FR-BOOK-04/11 | Create a short test hold, wait/advance clock past server expiry, attempt confirmation | Confirmation is refused as expired; interval becomes available; UI offers refresh | Unit/integration/E2E |
| TC-BOOK-01 | FR-BOOK-05/06, FR-PAY-03 | Alter the client-displayed price before confirming | Server persists calculated price; tampered price is ignored/rejected | Integration/security |
| TC-BOOK-02 | FR-BOOK-06, FR-PAY-04, NFR-REL-02 | Submit the same confirmation concurrently/repeatedly with one idempotency key | One booking/payment result exists; replays return the same logical result | Concurrency integration |
| TC-BOOK-03 | FR-BOOK-07/08 | Load history with upcoming/completed/cancelled/expired records | Correct records/statuses are visible only to authorized actor | Integration/E2E |
| TC-PAY-01 | FR-PAY-01/02/05/06 | Complete the assessed mock/sandbox path | Transaction is clearly labeled; normalized status drives confirmation; production claim is absent | Integration/E2E |
| TC-PAY-02 | FR-PAY-03/04 | Send invalid and duplicate provider callbacks | Invalid callback rejected; duplicate valid callback is idempotent | Integration/security |
| TC-OWN-01 | FR-OWN-01/02/03 | Owner creates and edits own draft, then attempts to edit another owner's turf | Own change persists; unauthorized change is rejected | Integration/E2E |
| TC-OWN-02 | FR-OWN-04, FR-ADM-01/02/03 | Submit turf; admin approves; inspect public discovery and audit | Status transitions correctly; turf becomes discoverable; decision/reason recorded | E2E/integration |
| TC-OWN-03 | FR-OWN-05/06, BR-05/06 | Owner creates schedule and attempts overlapping walk-in booking | Valid interval is stored; collision is rejected without changing existing booking | Integration/E2E |
| TC-MATCH-01 | FR-MATCH-01/02/03 | Create post and request to join as another player | Public safe fields display; join request is pending; private contact data absent | E2E/integration |
| TC-MATCH-02 | FR-MATCH-04/05/06 | Accept simultaneous requests for the final spot, then try another request | Capacity never becomes negative; at most remaining capacity accepted; full post rejects more | Concurrency integration |
| TC-STATE-01 | FR-COM-01/02 | Exercise loading, empty, invalid input, unauthorized, server error, conflict, and success fixtures | Each state has understandable text, correct action, and accessible announcement behavior | Component/E2E |
| TC-TIME-01 | FR-COM-03 | Create records around midnight and timezone boundary | Stored time is unambiguous; user-facing date/time matches Asia/Dhaka | Unit/integration |
| TC-RESP-01 | NFR-A11Y-06 | Run critical journeys at 320, 390, 768, 1024, and 1440px | No page-level horizontal overflow; actions/content remain usable | E2E/manual |
| TC-A11Y-01 | NFR-A11Y-01/02/03/04 | Complete auth, filters, slot selection, checkout, owner scheduling, admin review by keyboard | Logical focus/order, named controls, non-color state, and associated errors | Manual + automated |
| TC-MIG-01 | NFR-REL-04 | Apply all migrations to a clean database and seed it | Schema and seed complete without manual database edits | CI/integration |
| TC-DEPLOY-01 | Deployment requirements | Build and deploy release candidate, then run public/auth/database smoke tests | Deployment healthy; release ID/URL recorded; critical smoke passes | Release |

## 12. Requirements traceability matrix

Initial mappings are grouped where one test design covers related requirements. Additional tests should be added during implementation.

| Requirement group | Primary use case | Planned evidence |
|---|---|---|
| FR-AUTH-01/02/05/06 | Account access | TC-AUTH-01 plus validation/account-recovery tests |
| FR-AUTH-03/04 | All protected use cases | TC-AUTH-02 plus per-resource authorization matrix tests |
| FR-TURF-01/04/05/06 | UC-01 Discover turf | TC-TURF-01 and turf detail component/E2E tests |
| FR-TURF-02/03/07 | UC-01 Discover turf | TC-TURF-02 and filter boundary tests |
| FR-BOOK-01/02/03/04 | UC-02 Book slot | TC-HOLD-01, TC-HOLD-02, slot derivation unit tests |
| FR-BOOK-05/06/11 | UC-02 Book slot | TC-BOOK-01, TC-BOOK-02, expiry/failure E2E |
| FR-BOOK-07/08/09/10 | Booking management | TC-BOOK-03 plus cancellation and refresh-state tests |
| FR-PAY-01..06 | UC-02 Book slot | TC-PAY-01, TC-PAY-02, adapter contract tests |
| FR-OWN-01/02/03 | Owner listing | TC-OWN-01 and form validation tests |
| FR-OWN-04, FR-ADM-01/02/03 | UC-05 Approve turf | TC-OWN-02 |
| FR-OWN-05/06/07/08 | UC-03/04 Owner availability | TC-OWN-03 plus booking list/summary tests |
| FR-ADM-04/05/06 | Administrative oversight | TC-AUTH-02 plus admin list/status-action tests |
| FR-MATCH-01/02/03 | UC-06 Recruit player | TC-MATCH-01 |
| FR-MATCH-04/05/06 | UC-06 Recruit player | TC-MATCH-02 and status-transition unit tests |
| FR-COM-01/02/04 | Cross-cutting | TC-STATE-01 and demo-label assertions |
| FR-COM-03 | Cross-cutting | TC-TIME-01 |
| NFR-SEC-01..08 | All mutations | Authorization/validation/session/log test suite and release security checklist |
| NFR-REL-01..04 | UC-02 and deployment | TC-HOLD-01, TC-BOOK-02, TC-MIG-01, dependency-failure tests |
| NFR-PERF-01..04 | Discovery/API collections | Release performance report, pagination and image behavior tests |
| NFR-A11Y-01..06 | Critical UI journeys | TC-RESP-01, TC-A11Y-01, automated accessibility report |
| NFR-MNT-01..05 | Architecture/release | Static architecture checks, API tests, build/config validation, decision records |

## 13. Unit and component coverage targets

- Booking collision, price calculation, state transition, authorization, and idempotency modules: all decision branches covered.
- General application code: target at least 80% line coverage, reported with exclusions justified.
- Coverage percentage does not replace meaningful assertions or concurrency tests.
- Generated files, migrations, and framework boilerplate may be excluded only through documented configuration.

## 14. API and integration verification

For each documented endpoint, verify:

- Successful request and response schema.
- Authentication/authorization behavior.
- Invalid field, missing resource, conflict, and dependency-error behavior.
- Pagination/filter bounds for collection endpoints.
- Idempotency where specified.
- Transaction rollback on failure.
- No unintended data exposure in response bodies.

Contract examples in the architecture document must match implemented tests and the final API documentation.

## 15. Security-oriented test checklist

- Direct object reference attempts across users/owners.
- Privilege escalation through modified role/owner identifiers.
- Invalid/expired sessions and logout invalidation.
- CSRF protection as applicable to state-changing session requests.
- Stored/reflected script input in names, descriptions, reviews, and match posts.
- Injection-oriented payloads at query/body/path boundaries.
- Rate limits on authentication and sensitive mutations.
- Upload content type, size, and path handling if media upload is implemented.
- Webhook signature/secret validation for any external provider.
- Dependency and secret scanning.
- Security headers and production cookie settings.
- Log inspection for credentials, tokens, or unnecessary personal data.

Formal VAPT claims require the named tool, scope, build, date, findings, and remediation evidence. A dependency scan alone must not be called penetration testing.

## 16. Performance and volume plan

Release-candidate checks:

- Measure public home, turf list, and turf detail under representative mobile conditions.
- Measure search and availability API latency using seeded typical and upper-bound data.
- Run concurrent hold attempts against one interval and multiple intervals.
- Exercise paginated turf, booking, and match collections at their agreed maximum page size.
- Record environment, dataset size, concurrency, duration, percentile results, errors, and limitations.

The exact academic load target will be set after the hosting/database plan is confirmed. Results from local development must not be presented as production capacity.

## 17. User acceptance testing

UAT participants should include at minimum team members acting as player, owner, and administrator; external representative users are preferred when available.

| UAT ID | User goal | Acceptance question |
|---|---|---|
| UAT-01 | Find a turf for a chosen evening | Can the player identify a suitable available option without calling the venue? |
| UAT-02 | Book without uncertainty | Does the player understand selection, expiry, price, payment mode, and final status? |
| UAT-03 | Correct owner inventory | Can the owner add a walk-in booking and see public availability become unavailable? |
| UAT-04 | Publish a venue | Can owner and admin understand every status and required action? |
| UAT-05 | Fill a missing player role | Can captain and player complete the request/decision flow without exposing private contact data? |

Capture participant type, date, build, outcome, observations, and resulting changes. Do not fabricate participant feedback.

## 18. Browser and responsive matrix

Minimum release matrix:

- Current Chromium-family desktop browser.
- Current Firefox desktop browser.
- Current Safari/WebKit coverage through an available environment or Playwright equivalent, with limitation disclosed.
- Android-sized Chromium mobile viewport.
- iPhone-sized WebKit mobile viewport or closest available simulation, with limitation disclosed.

Test widths: 320, 390, 768, 1024, and 1440 CSS pixels. Real devices should be added when available, especially for on-screen keyboard, sticky elements, date inputs, and touch targets.

## 19. CI and reporting

Every pull request should report:

- Formatting/lint/type result.
- Unit/component result and coverage summary.
- Integration result.
- Production build result.
- Preview URL when available.
- Relevant browser screenshots or E2E trace for changed user flows.

Release evidence should be stored under a stable documentation/evidence location or linked from the final report with immutable run references.

## 20. Test report template

| Field | Content |
|---|---|
| Test run ID | Unique ID |
| Build/revision | Commit SHA and deployment URL |
| Environment | Local, CI, preview, production |
| Date/operator | Actual execution information |
| Scope | Suites/cases included |
| Data | Seed version and notable setup |
| Result | Passed, failed, blocked, not run |
| Defects | IDs and severity |
| Evidence | Log/report/screenshot/trace paths |
| Limitations | Exclusions and environmental constraints |

## 21. Open test decisions

- [ ] Select unit/component test runner.
- [ ] Confirm CI database strategy.
- [ ] Confirm exact performance/load targets.
- [ ] Confirm supported browser versions and available real devices.
- [ ] Select automated accessibility and security scanning tools.
- [ ] Confirm UAT participants and supervisor acceptance process.
- [ ] Decide whether AI-specific tests are applicable after the AI scope decision.

## 22. Approval gate

Before Phase 3 implementation, the team must confirm that:

1. Every Must requirement has a planned verification method.
2. Booking integrity and authorization have dedicated negative/concurrency tests.
3. Critical UAT journeys match the product scope.
4. Test environments do not risk production data or payments.
5. Evidence requirements are practical and assigned to team members.

