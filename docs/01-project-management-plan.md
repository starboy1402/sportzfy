# Sportzfy Project Management Plan

**Document ID:** SPZ-PMP-001  
**Version:** 0.1  
**Status:** Baseline draft for team approval  
**Prepared:** 3 September 2026  
**Project:** Sportzfy web-first turf booking marketplace  
**Course:** Software Engineering (Sessional), CSE-355, CUET

## 1. Purpose

This plan defines how the Sportzfy team will deliver a working, tested, and Vercel-hosted website before beginning a native mobile application. It establishes scope, responsibilities, lifecycle, schedule, risks, quality gates, documentation, and evidence collection for the final lab report.

This document replaces schedule and completion claims in earlier proposals when those claims conflict with the repository or the approved web-first direction.

## 2. Goals and measurable objectives

1. Deliver a responsive website through which a player can discover a turf, select an available slot, and create a database-backed booking.
2. Prevent two confirmed bookings for the same turf and time interval.
3. Provide separate customer, turf-owner, and administrator permissions and workspaces.
4. Provide a basic Playo-style open-match flow for recruiting players.
5. Pass the agreed automated tests and critical manual acceptance tests.
6. Deploy a production build to Vercel and record deployment and monitoring evidence.
7. Produce a final report whose claims, diagrams, screenshots, and test results match the delivered system.

## 3. Scope baseline

### 3.1 In scope for the MVP

- Responsive public and authenticated web interfaces.
- Customer registration, login, logout, and profile.
- Turf discovery, filtering, details, availability, and booking history.
- Transactional slot hold and booking confirmation.
- Payment-provider abstraction with a mock or approved sandbox provider.
- Owner turf, slot, pricing, walk-in booking, and booking management.
- Administrator turf approval and basic booking/user oversight.
- Basic open-match posts and join requests.
- Database migrations, seed/demo data, APIs, validation, authorization, audit events, tests, CI, and Vercel deployment.

### 3.2 Out of scope for the first release

- Native Android and iOS applications.
- Production movement of real money unless provider credentials and approval are supplied.
- Full team chat, video, live scoring, tournaments, subscriptions, and loyalty systems.
- Machine-learning personalization or dynamic pricing.
- Multi-country, multi-currency, or full multi-language operation.
- Full accounting, payouts, and dispute arbitration.

Changes to this baseline require a recorded scope decision.

## 4. Project organization

### 4.1 Team

| Member | Student ID | Confirmed responsibility |
|---|---:|---|
| Mahmudul Hasan | 2204040 | TBD by team |
| Sakib Alif | 2204051 | TBD by team |
| Ayan Barua | 2204053 | TBD by team |

Supervisors listed in the existing project material are Prof. Mir Md. Saki Kowsar and Md. Refaj Hossan. Their review cadence and approval responsibilities remain to be confirmed.

### 4.2 Recommended responsibility areas

The team should assign one accountable owner and at least one reviewer for each area:

- Product requirements and final-report traceability.
- UX, frontend components, and responsive behavior.
- Data model, APIs, booking integrity, and authentication.
- Testing, CI/CD, deployment, and operational evidence.

The assignment must reflect actual work. The final report must not fabricate equal contribution or retroactively assign work that Git history and meeting records do not support.

### 4.3 Decision process

- Product-scope decisions require agreement from the team and must be recorded in the change log.
- Architecture decisions require one proposer and one reviewer.
- A pull request cannot be approved only by its author when another team member is available.
- Supervisor feedback overrides internal assumptions and is recorded with its date and impact.

## 5. Development lifecycle

Sportzfy will use an iterative, incremental lifecycle with one-week milestones. This is appropriate because the project contains uncertain integration work, user-interface learning, and booking-concurrency risks that should be validated early rather than postponed until the end.

Each iteration follows:

1. Confirm acceptance criteria.
2. Design the smallest end-to-end slice.
3. Write tests appropriate to the change.
4. Implement and review.
5. Demonstrate working behavior.
6. Update documentation and traceability.

## 6. Five phases and seven-week schedule

| Phase | Target week(s) | Deliverables | Exit gate |
|---|---|---|---|
| 1. Documentation and scope | Week 1 | Project plan, SRS, architecture/design specification, UI/UX specification, test plan | Scope, roles, requirements, and open decisions are visible and reviewable |
| 2. Product and technical design | Week 2 | Approved journeys, wireframes, visual direction, ERD, API contract, deployment design | Major screens and critical booking behavior are unambiguous |
| 3. MVP implementation | Weeks 3-5 | Next.js application, database, customer/owner/admin flows, booking integrity, basic matchmaking | Critical journeys work against persistent data |
| 4. Quality and deployment | Week 6 | Automated and manual test evidence, security checks, production build, CI/CD, Vercel deployment | Release candidate meets the exit criteria in the test plan |
| 5. Final report and handoff | Week 7 | Final report, screenshots, diagrams, appendices, presentation, mobile roadmap | Every completion claim is supported by repository or test/deployment evidence |

Detailed dates will be added after the team confirms its start date, academic deadline, and weekly availability.

## 7. Work breakdown

### 7.1 Requirements and design

- Reconcile existing proposal documents with the actual web-first scope.
- Define actors, use cases, business rules, NFRs, and acceptance criteria.
- Define information architecture, user journeys, error states, and accessibility.
- Define database entities, API resources, security boundaries, and booking transaction behavior.
- Produce diagrams required by the final-report guideline.

### 7.2 Construction

- Scaffold the new application in `sportzfy-web/`.
- Establish formatting, linting, testing, environment validation, and CI.
- Implement authentication and authorization.
- Implement turf catalog and owner management.
- Implement slots, holds, bookings, cancellation behavior, and payment adapter.
- Implement basic matchmaking and administration.
- Add operational logging and release configuration.

### 7.3 Verification and release

- Run unit, integration, API, browser, accessibility, and security-oriented tests.
- Validate mobile and desktop layouts.
- Verify database migrations on a clean environment.
- Deploy a preview, complete UAT, then deploy production.
- Record evidence and known limitations.

## 8. Tools and environments

| Area | Baseline choice |
|---|---|
| Source control | Git with a shared remote repository |
| Application | Next.js App Router and TypeScript |
| Styling | Utility or token-based CSS approach selected in Phase 2 |
| Database | PostgreSQL with migrations and an ORM |
| Hosting | Vercel for the website; managed database provider selected separately |
| Testing | Unit/component runner, Testing Library, and Playwright |
| CI/CD | Repository-hosted checks plus Vercel preview/production deployment |
| Documentation | Markdown source, Mermaid or exported diagrams, final formatted report |

Specific vendors and versions will be pinned when the web scaffold is created.

## 9. Constraints

- Academic schedule and a three-person student team.
- Payment and messaging integrations depend on external credentials and provider approval.
- Production venue data and owner agreements are not currently available.
- The existing Expo application is a mock prototype, not a reusable backend.
- The first release must be usable from mobile browsers before a native app exists.
- Earlier documents contain conflicting architecture and completion statements and therefore cannot be copied without verification.

## 10. Risk register

| ID | Risk | Probability | Impact | Mitigation | Trigger/owner |
|---|---|---|---|---|---|
| R-01 | MVP scope grows beyond the academic timeline | High | High | Enforce the SRS scope; defer listed enhancements | Trigger: unplanned epic added; owner TBD |
| R-02 | Double booking under concurrent requests | Medium | Critical | Database constraint plus transactional hold/confirm tests | Trigger: competing booking test fails; backend owner TBD |
| R-03 | Payment sandbox or credentials unavailable | High | Medium | Use a documented payment adapter and auditable mock provider | Trigger: credentials absent by integration milestone |
| R-04 | Vercel/serverless behavior conflicts with long-lived connections | Medium | High | Keep database authoritative; use a managed real-time adapter or bounded refresh | Trigger: preview environment cannot maintain required updates |
| R-05 | Team contributions are unclear | Medium | High | Assign owners, use issues/PRs, retain meeting decisions | Trigger: work occurs without issue or reviewer |
| R-06 | Test and report work is left until the deadline | High | High | Update traceability and evidence during every iteration | Trigger: merged feature has no test/evidence update |
| R-07 | Personal or payment data is exposed | Low | Critical | Least privilege, server-only secrets, validation, log redaction, security review | Trigger: secret or personal data appears in client/logs |
| R-08 | Demo depends on unreliable external services | Medium | Medium | Seed deterministic demo data and provide graceful degradation | Trigger: external service failure breaks a critical flow |
| R-09 | Mobile web experience is unusable | Medium | High | Mobile-first journeys and browser testing at agreed widths | Trigger: critical task requires horizontal scrolling or hover |
| R-10 | Documentation claims exceed implementation | Medium | High | Evidence-backed status labels and final traceability audit | Trigger: feature marked complete without a passing test/demo |

## 11. Quality management

### 11.1 Definition of ready

A development item is ready when it has:

- A requirement or approved change reference.
- User-visible acceptance criteria.
- Required roles and permissions.
- Loading, empty, validation, error, and success behavior where relevant.
- Test approach and data needs.

### 11.2 Definition of done

A development item is done when:

- Implementation and migrations are committed.
- Relevant automated tests pass.
- Authorization and validation are verified.
- Responsive behavior and accessibility are checked where applicable.
- Documentation and traceability are updated.
- Another team member has reviewed the change.
- No unsupported completion claim remains.

### 11.3 Release gate

The MVP release requires passing production build, critical end-to-end journeys, booking-concurrency tests, access-control tests, migration checks, responsive review, and the UAT scenarios defined in the test plan.

## 12. Git and change management

- Protect the main release branch from direct feature development.
- Use short-lived branches named by issue or capability.
- Keep commits focused and descriptive.
- Require pull requests to state requirement IDs, tests run, screenshots when visual, and migration impact.
- Record breaking schema/API changes before merge.
- Tag the version used for the final demonstration and report.

Scope changes use the following record:

| Field | Required content |
|---|---|
| Change ID | Unique identifier |
| Request | What changes and why |
| Requirements affected | Requirement/use-case IDs |
| Schedule and risk impact | Added/removed effort and new risks |
| Decision | Approved, rejected, or deferred |
| Approvers and date | Actual decision evidence |

## 13. Communication and evidence

- Hold at least one recorded team checkpoint per week.
- Keep short meeting minutes: date, attendees, decisions, blockers, actions, owners, due dates.
- Demonstrate a working increment at the end of each implementation week.
- Store diagrams from editable sources, not screenshots alone.
- Preserve test reports, release logs, deployed URL, environment description, and screenshots from the actual system.
- Do not manufacture historical meeting minutes; begin the record from the date this plan is adopted.

## 14. Budget approach

The academic MVP will target free or educational tiers where they satisfy the requirements. The budget must still list hosting, database, domain, storage, external APIs, testing devices, and contingency. Exact BDT values remain TBD until providers and any paid domain are selected; prices must be verified close to report submission rather than invented now.

## 15. Technological, societal, and environmental impact

- **Positive:** reduces time spent calling venues, improves visibility for local turf businesses, and can make casual sport easier to organize.
- **Potential harm:** location/contact data misuse, exclusion of users without digital payments, unfair or misleading ratings, and platform dependency for owners.
- **Mitigation:** minimize collected data, offer transparent policies, preserve an owner-assisted path, moderate public content, and avoid discriminatory ranking signals.
- **Environmental:** managed infrastructure and optimized media reduce waste compared with over-provisioned servers; real-world travel impact is not yet measured and must not be claimed.

## 16. Open decisions

- [ ] Confirm individual team responsibilities.
- [ ] Confirm academic deadline and exact milestone dates.
- [ ] Confirm whether an AI feature is required by the course or may be marked not applicable.
- [ ] Select the managed PostgreSQL provider.
- [ ] Confirm mock-only versus official payment sandbox for the assessed MVP.
- [ ] Confirm source-control remote and CI provider.
- [ ] Approve Phase 1 requirements and Phase 2 design workshop.

## 17. Approval

| Role | Name | Decision/date |
|---|---|---|
| Team member | Mahmudul Hasan | Pending |
| Team member | Sakib Alif | Pending |
| Team member | Ayan Barua | Pending |
| Supervisor/reviewer | TBD | Pending |

