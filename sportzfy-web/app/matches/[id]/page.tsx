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
  X,
  Shield,
  UserMinus,
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
      id: string;
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
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Join request modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Goalkeeper");
  const [playerNote, setPlayerNote] = useState("");
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
        if (json.data.requiredRole) {
          setSelectedRole(json.data.requiredRole);
        }
      }
    } catch (err) {
      console.error("Error loading match", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatch();
    async function loadUser() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const json = await res.json();
        if (json.data?.user) {
          setCurrentUser(json.data.user);
        }
      } catch (err) {
        console.error("Failed to load user session", err);
      }
    }
    loadUser();
  }, [id]);

  const isCaptain = Boolean(
    currentUser && match && (currentUser.id === match.hostUser.id || currentUser.role === "ADMIN")
  );
  const myJoinRequest = match?.joinRequests.find(
    (req) => req.user.id === currentUser?.id
  );
  const acceptedPlayers = match?.joinRequests.filter((req) => req.status === "ACCEPTED") || [];
  const pendingRequests = match?.joinRequests.filter((req) => req.status === "PENDING") || [];

  // Request to Join
  async function handleRequestJoin(e: React.FormEvent) {
    e.preventDefault();
    setIsJoining(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/v1/matches/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredRole: selectedRole || match?.requiredRole || "Goalkeeper",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setActionMessage(json.error?.message || "Failed to submit request.");
        return;
      }

      setJoinSuccess(true);
      setShowJoinModal(false);
      setActionMessage("Success! Your squad request has been sent to Captain " + match?.hostUser.name);
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

            {/* Action Bar: Join, Captain Status, or Share */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[var(--color-card-border)]">
              {isCaptain ? (
                <div className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-field)]/40 text-[var(--color-forest)] font-bold text-xs flex items-center justify-center gap-2">
                  <span className="text-base">👑</span>
                  <span>You are the Host Captain of this Match</span>
                </div>
              ) : myJoinRequest ? (
                <div className="w-full sm:flex-1 py-3 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 bg-[var(--color-paper)] border-[var(--color-card-border)]">
                  {myJoinRequest.status === "ACCEPTED" ? (
                    <span className="text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[var(--color-field)]" />
                      You are an Official Member of this Squad!
                    </span>
                  ) : myJoinRequest.status === "PENDING" ? (
                    <span className="text-amber-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Application Pending: Waiting for Captain to Accept
                    </span>
                  ) : (
                    <span className="text-red-700">Application was declined by captain.</span>
                  )}
                </div>
              ) : match.openSpots > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  disabled={joinSuccess}
                  className="btn-press w-full sm:flex-1 py-3.5 rounded-2xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {joinSuccess
                      ? "Request Submitted ✓"
                      : `Request to Join Squad (${match.openSpots} spot${match.openSpots > 1 ? "s" : ""} left)`}
                  </span>
                </button>
              ) : (
                <div className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gray-100 text-gray-600 text-xs font-bold text-center">
                  Squad Roster is Full
                </div>
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

        {/* 1. CONFIRMED SQUAD LINEUP / OFFICIAL ROSTER (Visible to All) */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-card-border)] pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Confirmed Match Roster</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)] uppercase">
                Official Squad Lineup ({1 + acceptedPlayers.length}/{match.totalSpots})
              </h3>
            </div>
            <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
              {match.openSpots} spot{match.openSpots > 1 ? "s" : ""} left to complete squad
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* Host Captain Jersey Card */}
            <div className="p-4 rounded-2xl bg-[var(--color-mint)] border-2 border-[var(--color-field)]/40 flex flex-col justify-between gap-3 relative shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] text-[var(--color-forest-dark)] text-[10px] font-bold uppercase tracking-wider">
                  👑 Captain & Host
                </span>
                <span className="text-[10px] font-bold text-[var(--color-field)] uppercase">Leader</span>
              </div>

              <div>
                <h4 className="font-display text-xl font-bold text-[var(--color-forest)]">
                  {match.hostUser.name}
                </h4>
                <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-[var(--color-field)]" />
                  <span>{match.hostUser.phone}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--color-card-border)]/60 text-[11px] text-[var(--color-forest)] font-semibold">
                Pitch Booking Host
              </div>
            </div>

            {/* Confirmed Joined Players */}
            {acceptedPlayers.map((player) => (
              <div
                key={player.id}
                className="p-4 rounded-2xl bg-white border border-[var(--color-card-border)] hover:border-[var(--color-field)] flex flex-col justify-between gap-3 shadow-xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                    {player.preferredRole}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-mint)] text-[var(--color-forest)] text-[10px] font-bold">
                    Confirmed
                  </span>
                </div>

                <div>
                  <h4 className="font-display text-xl font-bold text-[var(--color-forest)]">
                    {player.user.name}
                  </h4>
                  <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-[var(--color-field)]" />
                    <span>{player.user.phone}</span>
                  </p>
                </div>

                {isCaptain ? (
                  <div className="pt-2 border-t border-[var(--color-card-border)] flex items-center justify-between">
                    <span className="text-[10px] text-[var(--color-ink-muted)]">Captain Controls:</span>
                    <button
                      type="button"
                      onClick={() => handleDecision(player.id, "REJECTED")}
                      className="btn-press px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Remove player and restore open spot"
                    >
                      <UserMinus className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[var(--color-card-border)] text-[11px] text-emerald-800 font-semibold">
                    Squad Member
                  </div>
                )}
              </div>
            ))}

            {/* Remaining Open Slot Placeholders */}
            {Array.from({ length: Math.min(match.openSpots, 6) }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border-2 border-dashed border-[var(--color-card-border)] bg-[var(--color-paper)]/50 flex flex-col justify-between items-center text-center py-6 gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-mint)] text-[var(--color-field)] flex items-center justify-center font-bold text-xs">
                  {acceptedPlayers.length + 2 + idx}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-forest)] block">
                    Open Spot
                  </span>
                  <span className="text-[10px] text-[var(--color-ink-muted)] font-medium">
                    Looking for {match.requiredRole}
                  </span>
                </div>
                {!isCaptain && !myJoinRequest && (
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(true)}
                    className="text-[11px] font-bold text-[var(--color-field)] hover:underline"
                  >
                    Apply for this spot →
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 2. CAPTAIN MANAGEMENT CONSOLE (Visible to Captain Only) */}
        {isCaptain && (
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4 anim-rise">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-card-border)] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--color-accent-hover)] tracking-wider block">
                  👑 Captain Approval Console
                </span>
                <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
                  Pending Applications ({pendingRequests.length})
                </h3>
              </div>
              <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
                {match.openSpots} spot{match.openSpots > 1 ? "s" : ""} open to accept
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--color-ink-muted)] space-y-2">
                <CheckCircle className="w-8 h-8 text-[var(--color-field)] mx-auto opacity-50" />
                <p className="font-semibold text-[var(--color-forest)]">No Pending Requests</p>
                <p>All incoming requests have been reviewed. Share on WhatsApp to fill remaining spots!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-forest)] text-sm">
                          {req.user.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          PENDING REVIEW
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[var(--color-ink-muted)]">
                        <span>
                          Applied as: <strong>{req.preferredRole}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[var(--color-field)]" />
                          {req.user.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleDecision(req.id, "ACCEPTED")}
                        disabled={match.openSpots <= 0}
                        className="btn-press px-3.5 py-2 rounded-xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Accept to Squad</span>
                      </button>
                      <button
                        onClick={() => handleDecision(req.id, "REJECTED")}
                        className="btn-press px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Join Squad Modal */}
      {showJoinModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowJoinModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-card-border)] relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[var(--color-forest)] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--color-accent)] mb-1">
                <Users className="w-4 h-4" />
                <span>Squad Application</span>
              </div>
              <h3 className="font-display text-2xl font-bold uppercase leading-tight">
                Join {match.hostUser.name}&apos;s Squad
              </h3>
              <p className="text-xs text-emerald-100 mt-1">
                {match.turf.name} • {match.sportFormat} • ৳{match.costPerPlayer}/player
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRequestJoin} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[var(--color-forest)] block mb-1.5">
                  Select Your Preferred Position:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Goalkeeper", "Defender", "Midfielder", "Striker"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        selectedRole === role
                          ? "border-[var(--color-field)] bg-[var(--color-mint)] text-[var(--color-forest)] ring-2 ring-[var(--color-field)]"
                          : "border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] hover:border-[var(--color-field)]"
                      }`}
                    >
                      {role === "Goalkeeper" ? "🧤 Goalkeeper" : role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-card-border)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                  Match Rules & Cost
                </span>
                <p className="text-[11px] text-[var(--color-forest)] font-medium">
                  Player split cost is <strong>৳{match.costPerPlayer}</strong> paid at venue. The captain will review your application.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="btn-press flex-1 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-xs text-[var(--color-forest)] hover:bg-[var(--color-paper)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="btn-press flex-1 py-3 rounded-xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isJoining ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send Request</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
