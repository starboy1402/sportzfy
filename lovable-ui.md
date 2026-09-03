# Turf booking app — implement the chosen design

## Goal
Build the first screen of a Playo/Hudle-style turf booking app using the selected "Kinetic athletic" design direction.

## Design reference
- Palette: Field Energy — emerald `#10B981`, mint `#F0FDF4`, forest `#064E3B`, amber `#F59E0B`, plus ink `#04231a` and paper `#f5fbf7`.
- Typography: Bebas Neue (display) + Barlow (body).
- Structure: sticky nav, diagonal-energy hero with search bar, category chips, featured turf cards, mobile sticky CTA.
- Motion: rise-in entrance animation, card lift on hover, active-scale buttons.

## What we will build now
1. Update `src/styles.css` with the Field Energy tokens and the custom animation keyframes.
2. Add Google Fonts (Bebas Neue + Barlow) to the root route head.
3. Rewrite `src/routes/index.tsx` as the turf booking home page:
   - Sticky header with logo, nav, and login.
   - Hero section with tagline, search bar (location / sport / time), and CTA.
   - Horizontal scrollable sport category chips.
   - Featured pitches grid (3 cards with image, status badge, rating, tags, price, book button).
   - Mobile sticky bottom booking bar.
4. Generate images for the three turf cards using the prompts from the chosen direction.
5. Add unique head metadata (title, description, og tags) to the home route.

## Out of scope for this first pass
- Real backend/data (turf detail page, booking flow, auth, payments). These can be planned once the home page is live.

## Verification
- Build passes without errors.
- Preview shows the Kinetic athletic home page with correct colors, fonts, layout, and generated images.


Here is the full reusable plan/prompt/guideline for your agent.

---

Turf Booking App — Full Build Prompt

1. Product Contract

Build a Playo / Hudle-style turf booking app homepage for Indian/Bangladesh/South-Asian sports lovers. The app lets users discover, compare, and book outdoor/indoor sports turfs for football, cricket, futsal, badminton, basketball, and swimming. The first screen must feel like stepping onto a freshly lined pitch: active, sweaty, social, and immediate.

Homepage must include:
- Sticky top navigation with logo, location pill, search icon, and profile avatar
- Hero section with a bold kinetic headline, search bar (sport / area / date / time), and quick-action sport chips
- Featured turfs section with image cards, rating, distance, price per hour in ₹, and a "Book now" CTA
- Category / sport filter chips
- Mobile sticky bottom CTA
- Footer with minimal links

Out of scope for first pass: backend, auth, booking flow, payments, detail pages, map view.

---

2. Locked Design Decisions

Color Palette: Field Energy
- Primary green: `#10B981` (emerald)
- Light mint: `#F0FDF4`
- Forest dark: `#064E3B`
- Accent amber: `#F59E0B`
- Ink text: `#04231A`
- Paper background: `#F5FBF7`

Typography: Sporty & Loud
- Headings: Bebas Neue (Google Fonts)
- Body: Barlow (Google Fonts) — weights 400, 500, 600, 700

Layout: Hero Search + Featured
- Top: sticky nav
- Center: large diagonal-energy hero with search anchored in the middle
- Below: horizontal sport chips
- Then: featured turf cards in a responsive grid
- Mobile: sticky bottom "Find turfs near me" CTA

---

3. Visual Direction: Kinetic Athletic

- Diagonal slash shapes, clipped corners, and energetic lines
- High-contrast emerald + white + amber accents
- Cards with rounded-2xl, subtle shadow, hover lift
- Large condensed headlines, tight tracking
- Photography: real turf/pitch action shots, saturated, daylight
- Buttons: solid emerald with white text, rounded-full or rounded-xl
- Active chips: forest background, white text
- Inactive chips: white/transparent with emerald border

---

4. Motion & Interaction

- On load: elements rise in with `translateY(16px) -> 0` and opacity fade
- Stagger delays: 0.05s, 0.15s, 0.25s, 0.35s
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- Hover: card lifts `-4px`, shadow deepens
- Button hover: scale `1.02`, active scale `0.98`
- Sport chips: horizontal scroll with snap on mobile
- No generic SaaS gradients or purple/indigo palettes

---

5. Tech Stack

- Framework: TanStack Start v1 (React 19, Vite 7)
- Styling: Tailwind CSS v4
- Fonts: Google Fonts via `<link>` in `src/routes/__root.tsx`
- Icons: Lucide React
- Images: generate 3 turf images and save to `src/assets/`
- No `react-router-dom`, no `entry-client.tsx/entry-server.tsx`, no `src/pages`

---

6. File Structure

```
src/
  routes/
    __root.tsx          # root layout, fonts, metadata, <Outlet />
    index.tsx           # homepage (replace placeholder)
  styles.css            # design tokens + animations
  assets/
    turf-football.jpg
    turf-futsal.jpg
    turf-cricket.jpg
```

---

7. CSS Tokens to Add

```css
@theme inline {
  --color-field: #10b981;
  --color-mint: #f0fdf4;
  --color-forest: #064e3b;
  --color-accent: #f59e0b;
  --color-ink: #04231a;
  --color-paper: #f5fbf7;
  --font-display: "Bebas Neue", sans-serif;
  --font-body: "Barlow", sans-serif;
}

@keyframes riseIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.anim-rise { animation: riseIn 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.d1 { animation-delay: 0.05s; }
.d2 { animation-delay: 0.15s; }
.d3 { animation-delay: 0.25s; }
.d4 { animation-delay: 0.35s; }

@utility no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
```

---

8. Homepage Content Structure

Nav
- Logo: "TURFLY" (Bebas Neue)
- Location pill: "Koramangala, Bangalore" or "Gulshan, Dhaka"
- Search icon
- Avatar placeholder

Hero
- Headline: "BOOK YOUR PITCH. OWN THE GAME."
- Subheadline: "Find and book the best turfs, courts, and pools near you in seconds."
- Search bar with:
  - Sport dropdown
  - Area input
  - Date picker
  - Time slot
  - Search button (emerald)

Sport Chips
Football, Cricket, Futsal, Badminton, Basketball, Swimming

Featured Turfs
3 cards minimum:
1. GreenArena Football Turf — Football — 4.8 ★ — 1.2 km — ₹1,200/hr
2. ProFutsal Indoor — Futsal — 4.6 ★ — 2.5 km — ₹900/hr
3. Cricket Nets Zone — Cricket — 4.9 ★ — 0.8 km — ₹800/hr

Each card:
- Image (use generated asset)
- Sport badge
- Name
- Rating + distance
- Price
- "Book now" button

Mobile Sticky CTA
- "Find turfs near me" button fixed to bottom

Footer
- Logo
- Links: About, How it works, List your turf, Support
- Social placeholders

---

9. Head Metadata

For `src/routes/index.tsx`:

```ts
head: () => ({
  meta: [
    { title: "TURFLY — Book Football, Cricket & Futsal Turfs Near You" },
    { name: "description", content: "Discover and book the best football turfs, cricket nets, futsal courts, and sports arenas near you. Instant availability, fair pricing." },
    { property: "og:title", content: "TURFLY — Book Football, Cricket & Futsal Turfs Near You" },
    { property: "og:description", content: "Discover and book the best football turfs, cricket nets, futsal courts, and sports arenas near you." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]
})
```

---

10. Guardrails for Your Agent

- Do NOT use generic AI aesthetics (Inter, Poppins, purple gradients, SaaS dashboards).
- Do NOT build a venue-management admin dashboard as the homepage.
- Keep the page focused on discovery and booking, not owner tools.
- Use the locked palette and typography. No drift.
- All colors must come from CSS tokens, never hardcoded hex utilities.
- Replace the placeholder `src/routes/index.tsx` entirely.
- Generate real-looking turf images, not stock-photo generic parks.
- Make sure every route component renders correctly and the build passes.

---

11. Quality Checklist Before Finishing

- [ ] Build passes (`bun run build` or `npm run build`)
- [ ] Homepage loads without placeholder
- [ ] Fonts load correctly
- [ ] Colors match Field Energy palette
- [ ] Hero search is visible and usable
- [ ] 3 featured turf cards render
- [ ] Mobile sticky CTA is present
- [ ] Animations are subtle, not distracting
- [ ] No console errors

---

Copy this whole block and hand it to your other agent. It has everything needed to reproduce the same homepage build.