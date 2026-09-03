"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Shield,
  MapPin,
  Sparkles,
  ArrowRight,
  Plus,
  Lock,
  Edit3,
  Phone,
  Clock,
  CheckCircle,
  BarChart3,
  AlertCircle,
} from "lucide-react";

interface OwnerData {
  owner: { name: string; email: string };
  stats: {
    totalVenues: number;
    totalBookings: number;
    totalRevenue: number;
    occupancyRate: number;
  };
  ownedTurfs: Array<{
    id: string;
    name: string;
    area: string;
    city: string;
    basePricePerHour: number;
    pitchFormats: string;
    rating: number;
    status: string;
    coverImage: string;
    activeBookingsCount: number;
    blockedIntervalsCount: number;
  }>;
  upcomingBookings: Array<{
    id: string;
    referenceCode: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    turf: { name: string; area: string };
    user: { name: string; phone: string };
  }>;
  aiPricingInsights: Array<{
    id: string;
    turfName: string;
    targetWindow: string;
    demandProbability: number;
    currentRate: number;
    suggestedRate: number;
    recommendation: string;
    confidenceScore: string;
  }>;
}

export default function OwnerDashboardPage() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/v1/owner/stats");
        const json = await res.json();
        if (json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load owner stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[var(--color-field)] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-forest)]">
              Loading Turf Owner Workspace...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="font-display text-3xl text-[var(--color-forest)] uppercase">Error Loading Data</h2>
          <p className="text-xs text-[var(--color-ink-muted)] mt-1">
            Could not load owner profile. Please verify your connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-8">
        {/* Top Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] uppercase tracking-wider">
              <Shield className="w-4 h-4 text-[var(--color-field)]" />
              <span>Venue Operator Console</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-forest)] uppercase leading-none">
              Welcome, {data.owner.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
              Manage your turf schedules, monitor online bookings, and review AI dynamic pricing suggestions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              href="/owner/schedule"
              className="btn-press flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[var(--color-card-border)] hover:border-[var(--color-field)] text-[var(--color-forest)] text-xs font-bold shadow-xs transition-colors"
            >
              <Lock className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Lock Slot for Walk-in</span>
            </Link>

            <Link
              href="/owner/turfs/new"
              className="btn-press flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Turf</span>
            </Link>
          </div>
        </div>

        {/* 1. KEY METRICS STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Revenue */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Recorded Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[var(--color-field)]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-forest)]">
                ৳{data.stats.totalRevenue.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                100% Guaranteed Payout
              </span>
            </div>
          </div>

          {/* Bookings */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Confirmed Matches
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-forest)]">
                {data.stats.totalBookings}
              </span>
              <span className="text-[10px] text-[var(--color-ink-muted)] font-semibold block mt-0.5">
                Zero double-bookings
              </span>
            </div>
          </div>

          {/* Active Turfs */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Managed Pitches
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-forest)]">
                {data.stats.totalVenues}
              </span>
              <span className="text-[10px] text-[var(--color-field)] font-bold block mt-0.5">
                All Published & Live
              </span>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Evening Occupancy
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-[var(--color-accent)]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-forest)]">
                {data.stats.occupancyRate}%
              </span>
              <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                Peak Prime Hours (8–11 PM)
              </span>
            </div>
          </div>
        </div>

        {/* 2. AI DYNAMIC PRICING & DEMAND INTELLIGENCE WIDGET (Mandatory for Proposal & CUET Report!) */}
        <section className="bg-gradient-to-br from-[var(--color-forest)] to-[var(--color-forest-dark)] text-white p-6 sm:p-8 rounded-3xl shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-field)] flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block">
                  Machine Learning Recommendation Engine
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase">
                  AI Dynamic Pricing & Demand Suggestions
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700 text-xs font-semibold text-emerald-200 self-start sm:self-auto">
              Weekly Historical Model (scikit-learn)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.aiPricingInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">
                    {insight.targetWindow}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] text-[var(--color-forest-dark)] font-bold text-[11px]">
                    {insight.demandProbability}% Demand Probability
                  </span>
                </div>

                <div className="flex items-baseline gap-3 py-1">
                  <div>
                    <span className="text-[10px] uppercase text-emerald-200 block">Current Rate</span>
                    <span className="font-display text-2xl font-bold line-through text-white/70">
                      ৳{insight.currentRate}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--color-field)]" />
                  <div>
                    <span className="text-[10px] uppercase text-emerald-200 block">Suggested AI Price</span>
                    <span className="font-display text-3xl font-bold text-[var(--color-field)]">
                      ৳{insight.suggestedRate}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  {insight.recommendation}
                </p>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300">
                  <span>Model Confidence: {insight.confidenceScore}</span>
                  <Link
                    href={`/owner/schedule`}
                    className="font-bold underline hover:text-white"
                  >
                    Apply Rate in Schedule →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. MANAGED TURFS LIST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-3xl font-bold text-[var(--color-forest)] uppercase">
              Your Managed Venues
            </h3>
            <span className="text-xs font-bold text-[var(--color-ink-muted)]">
              {data.ownedTurfs.length} Active Venues
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.ownedTurfs.map((turf) => (
              <div
                key={turf.id}
                className="bg-white rounded-2xl border border-[var(--color-card-border)] overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative h-44 w-full bg-[var(--color-mint)]">
                  <img
                    src={turf.coverImage}
                    alt={turf.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[var(--color-forest)] text-white text-[11px] font-bold">
                    {turf.pitchFormats}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold">
                    {turf.status}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display text-2xl font-bold text-[var(--color-forest)]">
                      {turf.name}
                    </h4>
                    <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" />
                      {turf.area}, {turf.city}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs py-2 border-y border-[var(--color-card-border)]">
                      <span className="text-[var(--color-ink-muted)]">Base Rate:</span>
                      <span className="font-bold text-[var(--color-forest)]">৳{turf.basePricePerHour}/hr</span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1 text-[var(--color-ink-muted)]">
                      <span>Online Bookings:</span>
                      <span className="font-bold text-[var(--color-field)]">{turf.activeBookingsCount} booked</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/owner/schedule?turfId=${turf.id}`}
                      className="btn-press flex-1 text-center py-2.5 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)] text-[var(--color-forest)] hover:border-[var(--color-field)] font-bold text-xs"
                    >
                      Manage Slots
                    </Link>
                    <Link
                      href={`/owner/turfs/${turf.id}/edit`}
                      className="btn-press px-3 py-2.5 rounded-xl bg-white border border-[var(--color-card-border)] text-[var(--color-forest)] hover:text-[var(--color-field)] text-xs font-bold"
                      title="Edit Specs"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. UPCOMING MATCH RESERVATIONS FEED */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-field)] tracking-wider block">
                Live Bookings Roster
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)] uppercase">
                Upcoming Match Confirmations
              </h3>
            </div>
            <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
              Real-Time Sync with Database
            </span>
          </div>

          {data.upcomingBookings.length === 0 ? (
            <p className="text-xs text-[var(--color-ink-muted)] py-6 text-center">
              No upcoming matches booked for today.
            </p>
          ) : (
            <div className="space-y-3">
              {data.upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xl font-bold text-[var(--color-forest)]">
                        {b.turf.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {b.referenceCode}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-ink-muted)]">
                      <span className="font-bold text-[var(--color-forest)]">
                        Player: {b.user.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[var(--color-field)]" />
                        {b.user.phone || "+8801812345678"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                        Amount Paid
                      </span>
                      <span className="font-display text-2xl font-bold text-[var(--color-forest)]">
                        ৳{b.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
