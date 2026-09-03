# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js web application hosted on Vercel. The existing Expo/React Native project is a reference prototype; a mobile client will follow after the website is workable. Backend persistence, real-time infrastructure, and payment-provider details remain implementation decisions to confirm against the MVP scope.

## Users

- Players in Bangladesh who organize casual football matches and need to find an available turf without calling multiple venues.
- Team captains who coordinate time, opponents, missing players, invitations, and shared costs.
- Solo players looking for an open match or a specific team role.
- Turf owners who need to publish availability, manage bookings, pricing, and walk-in reservations.

## Product Purpose

Sportzfy replaces fragmented phone, Facebook, Messenger, and WhatsApp coordination with one service for discovering turfs, viewing availability, booking a slot, and managing venue operations. A workable website is the first delivery target; mobile follows later.

## Positioning

Sportzfy is focused on Bangladesh's five-a-side and seven-a-side football ecosystem. Its differentiating mechanism combines transparent local turf availability with coordination features tailored to how teams actually form and pay: role-based player recruitment, opponent discovery, shareable match invitations, and split-cost workflows.

## Operating Context

- Initial market evidence and sample content focus on Chattogram and Dhaka.
- Demand is concentrated in evening and night slots.
- Players currently rely heavily on phone calls and social-media groups to discover availability and recruit participants.
- Payments and refunds need to match local expectations, including bKash and Nagad support when real payment processing enters scope.
- The website must work well on mobile browsers because many users will access it from a phone before a native app exists.

## Capabilities and Constraints

- Initial MVP: authentication, turf search and filtering, turf details, slot selection, booking flow, booking history, and a turf-owner workspace.
- High-value follow-on capabilities: concurrency-safe slot holds, payments and refunds, split payments, matchmaking, shareable invitations, equipment add-ons, notifications, and administration.
- The website must be deployable to Vercel.
- The current Expo application contains mock customer and owner flows but no production backend, database, or real payment integration.
- Final MVP backend, database, real-time, and payment scope is still to be confirmed before those integrations are implemented.

## Brand Commitments

- Product name: Sportzfy.
- The Playo listing is a product-category reference, not a visual identity to copy.
- Existing language and research establish a football-first, local, practical service for Bangladesh.

## Evidence on Hand

- `proposal/Sportzfy_Detailed_Requirement_Analysis_Report.md`: analysis of 22 community screenshots and a 25-person survey.
- `proposal/Turf Booking App Feature Survey (Responses).xlsx`: source survey responses.
- `proposal/photos/`: community screenshots showing real booking and matchmaking behavior.
- `proposal/Sportzfy_System_Design_Architecture.md`: proposed technical architecture; its completion checklist does not reflect the current implementation.
- `SPORTZFY-main/`: Expo reference prototype with customer and turf-owner screens backed by mock data.
- No production customer testimonials, live venue inventory, payment credentials, or verified marketplace metrics are present and these must not be fabricated.

## Product Principles

1. Show trustworthy availability before asking users to commit.
2. Make booking and team coordination faster than calling or messaging venues manually.
3. Design for Bangladesh's local payment, language, and mobile-connectivity realities.
4. Keep player and owner workflows distinct but connected through the same booking truth.
5. Build web-first without coupling the product domain to a single client, so mobile can follow cleanly.
