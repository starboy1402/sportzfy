"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Zap,
  CheckCircle,
  AlertCircle,
  Share2,
  Check,
  UserCheck,
  Phone,
} from "lucide-react";

interface MatchDetail {
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
    address: string;
    coverImage: string;
  };
  hostUser: {
    id: string;
    name: string;
    phone: string;
  };
  joinRequests: Array<{
    id: string;
    status: string;
    preferredRole: string;
    createdAt: string;
    user: {
      name: string;
      phone: string;
    };
  }>;
}

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Join request state
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function loadMatch() {
    try {
      const res = await fetch(`/api/v1/matches/${id}`);
      const json = await res.json();
      if (json.data) {
        setMatch(json.data);
      }
    } catch (err) {
      console.error("Error loading match", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatch();
  }, [id]);

  // Request to Join
  async function handleRequestJoin() {
    setIsJoining(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/v1/matches/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredRole: match?.requiredRole || "Goalkeeper",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setActionMessage(json.error?.message || "Failed to submit request.");
        return;
      }

      setJoinSuccess(true);
      setActionMessage("Your join request has been sent to the captain!");
      loadMatch(); // Refresh roster
    } catch (err) {
      console.error(err);
      setActionMessage("Network error submitting join request.");
    } finally {
      setIsJoining(false);
    }
  }

  // Captain Decision
  async function handleDecision(requestId: string, decision: "ACCEPTED" | "REJECTED") {
    try {
      const res = await fetch(`/api/v1/matches/${id}/requests/${requestId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });

      const json = await res.json();
      if (res.ok) {
        setActionMessage(json.message);
        loadMatch(); // Refresh state and open spots
      } else {
        setActionMessage(json.error?.message || "Action failed.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 1-Click WhatsApp Share
  function handleShareWhatsApp() {
    if (!match) return;
    const d = new Date(match.matchTime);
    const timeText = `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    const text = `⚽ *Match Alert on Sportzfy!*\nJoin our ${match.sportFormat} squad at *${match.turf.name}* on ${timeText}.\nRole Needed: *${match.requiredRole}* | Split: *৳${match.costPerPlayer}/player*.\nClaim your spot: ${window.location.href}`;

    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--color-field)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h2 className="font-display text-2xl text-[var(--color-forest)]">Match Not Found</h2>
          <Link href="/matches" className="text-xs text-[var(--color-field)] font-bold mt-3 inline-block">
            ← Return to Open Matches
          </Link>
        </div>
      </div>
    );
  }

  const d = new Date(match.matchTime);
  const dateStr = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/matches"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-forest)] hover:text-[var(--color-field)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Open Matches</span>
        </Link>

        {/* Action Status Banner */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-[var(--color-field)]" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-[var(--color-card-border)] overflow-hidden shadow-xs">
          {/* Header Banner */}
          <div className="bg-[var(--color-forest)] text-white p-6 sm:p-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-3 py-1 rounded-full bg-[var(--color-accent)] text-[var(--color-forest-dark)] font-bold text-xs uppercase tracking-wider">
                Role Needed: {match.requiredRole}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                {match.openSpots > 0 ? `${match.openSpots} Open Spot${match.openSpots > 1 ? "s" : ""}` : "Squad Full"}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase leading-tight">
              {match.title}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Hosted by Captain {match.hostUser.name}
            </p>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Match Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                  Date & Time
                </span>
                <span className="font-bold text-[var(--color-forest)]">{dateStr} • {timeStr}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                  Pitch Format
                </span>
                <span className="font-bold text-[var(--color-forest)]">{match.sportFormat} Match</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                  Squad Size
                </span>
                <span className="font-bold text-[var(--color-forest)]">{match.totalSpots} Players</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                  Split Cost
                </span>
                <span className="font-display text-xl font-bold text-[var(--color-field)]">
                  ৳{match.costPerPlayer} / player
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">
                Match Details & Rules
              </h3>
              <p className="text-sm text-[var(--color-forest)] leading-relaxed bg-[var(--color-paper)] p-4 rounded-2xl border border-[var(--color-card-border)]">
                {match.description}
              </p>
            </div>

            {/* Venue Card */}
            <div className="p-4 rounded-2xl border border-[var(--color-card-border)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={match.turf.coverImage}
                  alt={match.turf.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-display text-xl font-bold text-[var(--color-forest)]">
                    {match.turf.name}
                  </h4>
                  <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" />
                    {match.turf.address}
                  </p>
                </div>
              </div>

              <Link
                href={`/turfs/${match.turf.id}`}
                className="text-xs font-bold text-[var(--color-field)] hover:underline shrink-0"
              >
                View Turf →
              </Link>
            </div>

            {/* Action Bar: Join or Share */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[var(--color-card-border)]">
              {match.openSpots > 0 && (
                <button
                  onClick={handleRequestJoin}
                  disabled={isJoining || joinSuccess}
                  className="btn-press w-full sm:flex-1 py-3.5 rounded-2xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {joinSuccess
                      ? "Request Submitted ✓"
                      : isJoining
                      ? "Submitting..."
                      : `Request to Join as ${match.requiredRole}`}
                  </span>
                </button>
              )}

              {/* 1-Click WhatsApp / Social Share */}
              <button
                onClick={handleShareWhatsApp}
                className="btn-press w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-card-border)] text-[var(--color-forest)] hover:border-[var(--color-field)] font-bold text-xs flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-[var(--color-field)]" />
                <span>{copiedLink ? "Link Copied & Opened!" : "Share on WhatsApp"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Captain's Roster Review Console */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-accent-hover)] tracking-wider block">
                Host Captain Management Console
              </span>
              <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
                Squad Join Requests ({match.joinRequests.length})
              </h3>
            </div>
            <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
              {match.openSpots} spot{match.openSpots > 1 ? "s" : ""} remaining
            </span>
          </div>

          {match.joinRequests.length === 0 ? (
            <p className="text-xs text-[var(--color-ink-muted)] text-center py-6">
              No join requests received yet. Share the match link with your group!
            </p>
          ) : (
            <div className="space-y-3">
              {match.joinRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--color-forest)] text-sm">
                        {req.user.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === "ACCEPTED"
                            ? "bg-emerald-100 text-emerald-800"
                            : req.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[var(--color-ink-muted)]">
                      <span>Role: <strong>{req.preferredRole}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[var(--color-field)]" />
                        {req.user.phone}
                      </span>
                    </div>
                  </div>

                  {req.status === "PENDING" && match.openSpots > 0 && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleDecision(req.id, "ACCEPTED")}
                        className="btn-press px-3.5 py-1.5 rounded-xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white text-xs font-bold shadow-xs flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Accept to Squad</span>
                      </button>
                      <button
                        onClick={() => handleDecision(req.id, "REJECTED")}
                        className="btn-press px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
