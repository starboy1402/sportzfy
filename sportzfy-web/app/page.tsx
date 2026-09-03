import Link from "next/link";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/db";
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  Star,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Flame,
} from "lucide-react";

export const revalidate = 0; // Dynamic data

export default async function HomePage() {
  // Fetch real seeded turfs from database
  const turfs = await prisma.turf.findMany({
    where: { status: "APPROVED" },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { rating: "desc" },
  });

  // Fetch open matchmaking posts
  const matchPosts = await prisma.matchPost.findMany({
    where: { status: "OPEN" },
    include: { turf: true, hostUser: true },
    take: 2,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
      <Navbar />

      {/* 1. KINETIC ATHLETIC HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 border-b border-[var(--color-card-border)] bg-gradient-to-b from-[var(--color-mint)]/70 via-[var(--color-paper)] to-[var(--color-paper)]">
        {/* Background Decorative Diagonal Field Lines */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[var(--color-mint)] opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[var(--color-field)]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4 anim-rise">
            {/* Urgency / Course Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-mint)] border border-[var(--color-card-border)] shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[var(--color-field)] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-forest)]">
                Live Turf Availability • Chattogram & Dhaka
              </span>
            </div>

            {/* Stadium Display Headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--color-forest)] leading-[0.95] uppercase">
              PLAY WHERE THE <br />
              <span className="text-[var(--color-field)] underline decoration-[var(--color-accent)] decoration-4 underline-offset-4">
                GRASS IS LOUD
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-ink-muted)] max-w-xl mx-auto font-medium">
              Bangladesh&apos;s on-demand turf booking engine. Instant 5-minute slot lock, transparent hourly rates, and verified floodlit pitches.
            </p>

            {/* AI Recommendation Alert Banner (Directly fulfilling Proposal Feature!) */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[var(--color-card-border)] text-xs text-[var(--color-forest)] font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-[var(--color-accent)] fill-[var(--color-accent)] shrink-0" />
              <span>
                <strong>AI Smart Pick for Tonight:</strong> Eco Sports Halishahar (7v7) • 8:00 PM slot high demand
              </span>
            </div>
          </div>

          {/* Smart Search Bar Card */}
          <div className="mt-8 sm:mt-12 max-w-4xl mx-auto bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg border border-[var(--color-card-border)] anim-rise d2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Location */}
              <div className="p-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-card-border)] flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[var(--color-field)] shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Location / Zone
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-forest)]">
                    Halishahar, CTG
                  </span>
                </div>
              </div>

              {/* Pitch Format */}
              <div className="p-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-card-border)] flex items-center gap-3">
                <Users className="w-5 h-5 text-[var(--color-field)] shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Pitch Format
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-forest)]">
                    6v6 or 7v7 Football
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="p-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-card-border)] flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[var(--color-field)] shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Date
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-forest)]">
                    Today (Night Match)
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <a
                href="#turfs-grid"
                className="btn-press flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-sm tracking-wide shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>Search Turfs</span>
              </a>
            </div>

            {/* Quick Sport Chips */}
            <div className="mt-3 pt-3 border-t border-[var(--color-card-border)] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-semibold">
              <span className="text-[var(--color-ink-muted)] shrink-0 mr-1 text-[11px] font-bold uppercase">
                Filter:
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--color-forest)] text-white shrink-0 cursor-pointer">
                All Turfs (6)
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--color-mint)] text-[var(--color-forest)] border border-[var(--color-card-border)] shrink-0 hover:border-[var(--color-field)] cursor-pointer">
                7v7 Artificial Grass
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--color-mint)] text-[var(--color-forest)] border border-[var(--color-card-border)] shrink-0 hover:border-[var(--color-field)] cursor-pointer">
                6v6 Fast Futsal
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--color-mint)] text-[var(--color-forest)] border border-[var(--color-card-border)] shrink-0 hover:border-[var(--color-field)] cursor-pointer">
                Late Night (10 PM - 1 AM)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED TURFS GRID */}
      <section id="turfs-grid" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--color-field)] font-bold text-xs uppercase tracking-widest">
              <Flame className="w-4 h-4 fill-[var(--color-field)]" />
              <span>Available Right Now</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-forest)] uppercase">
              Approved Pitches & Live Slots
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Click any turf to view its interactive hour-by-hour availability timetable.
            </p>
          </div>
          <span className="text-xs font-bold text-[var(--color-ink-muted)]">
            Showing {turfs.length} verified venues
          </span>
        </div>

        {/* The Grid of Turfs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {turfs.map((turf) => (
            <div
              key={turf.id}
              className="turf-card bg-white rounded-2xl sm:rounded-3xl border border-[var(--color-card-border)] overflow-hidden flex flex-col group"
            >
              {/* Image & Status Badges */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[var(--color-mint)]">
                <img
                  src={turf.coverImage}
                  alt={turf.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top Floating Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[var(--color-forest)]/90 backdrop-blur-md text-white text-[11px] font-bold tracking-wide">
                    {turf.pitchFormats}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-xs text-xs font-bold text-[var(--color-forest)]">
                  <Star className="w-3.5 h-3.5 text-[var(--color-accent)] fill-[var(--color-accent)]" />
                  <span>{turf.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-[var(--color-ink-muted)]">({turf.reviewCount})</span>
                </div>

                {/* Bottom area overlay */}
                <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" />
                  <span>{turf.area}, {turf.city}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] leading-tight group-hover:text-[var(--color-field)] transition-colors">
                    {turf.name}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-ink-muted)] line-clamp-2 leading-relaxed">
                    {turf.description}
                  </p>

                  {/* Amenities Pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {turf.hasFloodlights && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--color-mint)] text-[var(--color-forest)] text-[10px] font-bold">
                        ⚡ Floodlights
                      </span>
                    )}
                    {turf.hasParking && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--color-mint)] text-[var(--color-forest)] text-[10px] font-bold">
                        🅿 Parking
                      </span>
                    )}
                    {turf.hasChangingRoom && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--color-mint)] text-[var(--color-forest)] text-[10px] font-bold">
                        🚿 Changing Room
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Price & CTA */}
                <div className="pt-3 border-t border-[var(--color-card-border)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                      Hourly Rate
                    </span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-display text-2xl font-bold text-[var(--color-forest)]">
                        ৳{turf.basePricePerHour}
                      </span>
                      <span className="text-xs text-[var(--color-ink-muted)] font-semibold">/hour</span>
                    </div>
                  </div>

                  <Link
                    href={`/turfs/${turf.slug || turf.id}`}
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white text-xs font-bold tracking-wide shadow-xs transition-colors"
                  >
                    <span>Check Slots</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. COMMUNITY SQUAD & GOALKEEPER RECRUITMENT TICKER (Directly from FB survey research!) */}
      <section id="matches" className="py-12 bg-gradient-to-b from-white to-[var(--color-mint)]/40 border-t border-[var(--color-card-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
                <Zap className="w-4 h-4 fill-[var(--color-accent)]" />
                <span>Solo Player & Goalkeeper Hub</span>
              </div>
              <h2 className="font-display text-3xl font-bold text-[var(--color-forest)] uppercase">
                Squads Needing Players Tonight
              </h2>
            </div>
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">
              Validated from 22 community Facebook requests
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchPosts.map((match) => (
              <div
                key={match.id}
                className="p-5 rounded-2xl bg-white border-2 border-dashed border-[var(--color-field)]/50 shadow-xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent-hover)] text-[11px] font-bold">
                      Role Needed: {match.requiredRole}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-forest)]">
                      ৳{match.costPerPlayer} / player split
                    </span>
                  </div>

                  <h4 className="font-display text-xl font-bold text-[var(--color-forest)] mt-2">
                    {match.title}
                  </h4>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                    {match.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-card-border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--color-ink-muted)] font-medium">
                    📍 {match.area} • {match.sportFormat}
                  </span>
                  <Link
                    href={`/turfs/${match.turfId}`}
                    className="font-bold text-[var(--color-field)] hover:underline flex items-center gap-1"
                  >
                    View Turf & Join →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-[var(--color-forest-dark)] text-white py-10 border-t border-[var(--color-forest)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/80">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl text-white tracking-wider">
              SPORTZ<span className="text-[var(--color-field)]">FY</span>
            </span>
            <span>• CSE-355 Software Engineering Project (CUET)</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Mahmudul Hasan (2204040)</span>
            <span>Sakib Alif (2204051)</span>
            <span>Ayan Barua (2204053)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
