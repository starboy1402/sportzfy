"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Trophy,
  Users,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  ArrowRight,
  Filter,
  Zap,
  Shield,
  Search,
} from "lucide-react";

interface MatchItem {
  id: string;
  title: string;
  description: string;
  sportFormat: string;
  matchTime: string;
  area: string;
  totalSpots: number;
  openSpots: number;
  costPerPlayer: number;
  requiredRole: string;
  status: string;
  turf: {
    id: string;
    name: string;
    area: string;
    city: string;
    coverImage: string;
  };
  hostUser: {
    name: string;
    avatarUrl?: string;
  };
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [myHosting, setMyHosting] = useState<MatchItem[]>([]);
  const [myJoined, setMyJoined] = useState<any[]>([]);
  const [loadingMy, setLoadingMy] = useState(false);

  // Filters
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedRole !== "All") queryParams.append("role", selectedRole);
        if (selectedFormat !== "All") queryParams.append("format", selectedFormat);

        const res = await fetch(`/api/v1/matches?${queryParams.toString()}`);
        const json = await res.json();
        if (json.data) {
          setMatches(json.data);
        }
      } catch (err) {
        console.error("Failed to load match posts", err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [selectedRole, selectedFormat]);

  useEffect(() => {
    if (activeTab === "my") {
      async function loadMyMatches() {
        setLoadingMy(true);
        try {
          const res = await fetch("/api/v1/matches/my");
          const json = await res.json();
          if (json.data) {
            setMyHosting(json.data.hosting || []);
            setMyJoined(json.data.joined || []);
          }
        } catch (err) {
          console.error("Failed to load user squads", err);
        } finally {
          setLoadingMy(false);
        }
      }
      loadMyMatches();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
              <Zap className="w-4 h-4 fill-[var(--color-accent)]" />
              <span>Squad Matchmaking & Player Recruitment</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-forest)] uppercase leading-none">
              Open Matches & Squad Hub
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
              Find an opposing team to challenge, manage your match roster, or track your squad invitations.
            </p>
          </div>

          <Link
            href="/matches/new"
            className="btn-press flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white text-xs font-bold tracking-wide shadow-md transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post Open Match / Recruit</span>
          </Link>
        </div>

        {/* Tab Switcher: All Matches vs My Squads */}
        <div className="flex items-center gap-2 border-b border-[var(--color-card-border)] pb-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[var(--color-forest)] text-white shadow-xs"
                : "bg-white text-[var(--color-ink-muted)] border border-[var(--color-card-border)] hover:border-[var(--color-field)]"
            }`}
          >
            Explore All Open Matches
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "my"
                ? "bg-[var(--color-forest)] text-white shadow-xs"
                : "bg-white text-[var(--color-ink-muted)] border border-[var(--color-card-border)] hover:border-[var(--color-field)]"
            }`}
          >
            My Matches & Squads
          </button>
        </div>

        {activeTab === "all" && (
          /* Filter Pills */
          <div className="bg-white p-4 rounded-2xl border border-[var(--color-card-border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Role Filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
              <span className="font-bold text-[var(--color-ink-muted)] text-[11px] uppercase shrink-0">
                Role Needed:
              </span>
              {["All", "Goalkeeper", "Midfielder", "Any"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedRole === r
                      ? "bg-[var(--color-forest)] text-white"
                      : "bg-[var(--color-mint)] text-[var(--color-forest)] border border-[var(--color-card-border)] hover:border-[var(--color-field)]"
                  }`}
                >
                  {r === "Goalkeeper" ? "🧤 Goalkeepers" : r}
                </button>
              ))}
            </div>

            {/* Format Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[var(--color-ink-muted)] text-[11px] uppercase shrink-0">
                Format:
              </span>
              {["All", "7v7", "6v6", "5v5"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFormat(f)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedFormat === f
                      ? "bg-[var(--color-field)] text-white"
                      : "bg-[var(--color-paper)] text-[var(--color-forest)] border border-[var(--color-card-border)] hover:border-[var(--color-field)]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Matches Feed Grid */}
        {activeTab === "all" ? (
          loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-[var(--color-field)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs font-bold text-[var(--color-ink-muted)]">
                Loading open matches...
              </span>
            </div>
          ) : matches.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[var(--color-card-border)] shadow-xs">
              <Users className="w-12 h-12 text-[var(--color-ink-muted)] mx-auto mb-3 opacity-40" />
              <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
                No Open Matches Found
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-1 max-w-sm mx-auto">
                There are no open posts matching your filters right now. Post your own match challenge!
              </p>
              <Link
                href="/matches/new"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-field)] text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Create Match Post
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((m) => {
                const d = new Date(m.matchTime);
                const dateStr = d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const timeStr = d.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={m.id}
                    className="bg-white rounded-3xl border border-[var(--color-card-border)] p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-[var(--color-field)] transition-all group"
                  >
                    {/* Top Tags */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent-hover)] font-bold text-xs flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 fill-[var(--color-accent)]" />
                          Role Needed: {m.requiredRole}
                        </span>

                        <span className="px-2.5 py-1 rounded-full bg-[var(--color-mint)] text-[var(--color-forest)] font-bold text-xs border border-[var(--color-card-border)]">
                          {m.openSpots} Spot{m.openSpots > 1 ? "s" : ""} Left
                        </span>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] group-hover:text-[var(--color-field)] transition-colors leading-tight">
                        {m.title}
                      </h3>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-2 leading-relaxed line-clamp-2">
                        {m.description}
                      </p>
                    </div>

                    {/* Middle: Venue & Schedule */}
                    <div className="p-3.5 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--color-forest)] flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[var(--color-field)] shrink-0" />
                          {m.turf.name}
                        </span>
                        <span className="text-[var(--color-ink-muted)]">{m.area}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[var(--color-card-border)]">
                        <span className="text-[var(--color-ink-muted)] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[var(--color-field)]" />
                          {dateStr} • {timeStr}
                        </span>
                        <span className="font-bold text-[var(--color-forest)]">
                          {m.sportFormat} Match
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Split Price & Action */}
                    <div className="pt-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                          Cost Per Player
                        </span>
                        <span className="font-display text-2xl font-bold text-[var(--color-forest)]">
                          ৳{m.costPerPlayer}
                        </span>
                      </div>

                      <Link
                        href={`/matches/${m.id}`}
                        className="btn-press inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white text-xs font-bold tracking-wide shadow-xs transition-colors"
                      >
                        <span>Join Squad</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* MY MATCHES & SQUADS VIEW */
          <div className="space-y-8 anim-rise">
            {loadingMy ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-4 border-[var(--color-field)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs font-bold text-[var(--color-ink-muted)]">
                  Loading your squad matches...
                </span>
              </div>
            ) : (
              <>
                {/* 1. Matches I Host */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-3">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
                        👑 Matches I Am Hosting ({myHosting.length})
                      </h3>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        Matches where you are the captain and manage squad invitations.
                      </p>
                    </div>
                  </div>

                  {myHosting.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white border border-[var(--color-card-border)] text-center text-xs text-[var(--color-ink-muted)]">
                      You haven&apos;t posted any match challenges yet.
                      <Link href="/matches/new" className="text-[var(--color-field)] font-bold ml-1 hover:underline">
                        Post a match now →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myHosting.map((m: any) => {
                        const pendingCount = (m.joinRequests || []).filter((r: any) => r.status === "PENDING").length;
                        return (
                          <div
                            key={m.id}
                            className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-3 hover:border-[var(--color-field)] transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-mint)] text-[var(--color-forest)] text-[10px] font-bold">
                                {m.sportFormat} • ৳{m.costPerPlayer}/player
                              </span>
                              {pendingCount > 0 ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold animate-pulse">
                                  {pendingCount} Pending Request{pendingCount > 1 ? "s" : ""}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  All Reviewed
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="font-display text-xl font-bold text-[var(--color-forest)]">{m.title}</h4>
                              <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" /> {m.turf.name} ({m.area})
                              </p>
                            </div>

                            <div className="pt-2 border-t border-[var(--color-card-border)] flex items-center justify-between text-xs">
                              <span className="font-semibold text-[var(--color-ink-muted)]">
                                {m.openSpots} open spot{m.openSpots > 1 ? "s" : ""}
                              </span>
                              <Link
                                href={`/matches/${m.id}`}
                                className="btn-press px-4 py-2 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-xs flex items-center gap-1 transition-colors"
                              >
                                <span>Manage Squad Roster</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Squads I've Applied To / Joined */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-3">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
                        ⚽ Squads I Have Joined ({myJoined.length})
                      </h3>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        Matches you requested to join as a player.
                      </p>
                    </div>
                  </div>

                  {myJoined.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white border border-[var(--color-card-border)] text-center text-xs text-[var(--color-ink-muted)]">
                      You haven&apos;t joined any squads yet. Browse open matches above to find a team!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myJoined.map((j: any) => (
                        <div
                          key={j.requestId}
                          className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-paper)] border border-[var(--color-card-border)] text-[var(--color-forest)] text-[10px] font-bold">
                              Role: {j.preferredRole}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                j.requestStatus === "ACCEPTED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : j.requestStatus === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {j.requestStatus === "ACCEPTED"
                                ? "CONFIRMED IN SQUAD ✓"
                                : j.requestStatus === "REJECTED"
                                ? "REQUEST DECLINED"
                                : "PENDING CAPTAIN APPROVAL"}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-display text-xl font-bold text-[var(--color-forest)]">{j.match.title}</h4>
                            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                              Captain: <strong>{j.match.hostUser.name}</strong> • {j.match.turf.name}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[var(--color-card-border)] flex items-center justify-between text-xs">
                            <span className="font-bold text-[var(--color-forest)]">
                              ৳{j.match.costPerPlayer}/player
                            </span>
                            <Link
                              href={`/matches/${j.match.id}`}
                              className="font-bold text-[var(--color-field)] hover:underline flex items-center gap-1"
                            >
                              <span>View Squad Lineup →</span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
