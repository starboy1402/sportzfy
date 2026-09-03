"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Building,
  Users,
  Filter,
  Check,
  X,
  Phone,
  Clock,
} from "lucide-react";

interface AdminStats {
  totalGMV: number;
  platformCommission: number;
  totalBookings: number;
  totalTurfs: number;
  approvedTurfs: number;
  pendingTurfs: number;
  totalUsers: number;
  totalMatchPosts: number;
}

interface AdminTurf {
  id: string;
  name: string;
  city: string;
  area: string;
  basePricePerHour: number;
  pitchFormats: string;
  status: string;
  coverImage: string;
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  bookings: Array<{ id: string }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [turfs, setTurfs] = useState<AdminTurf[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function loadData() {
    try {
      const [statsRes, turfsRes] = await Promise.all([
        fetch("/api/v1/admin/stats"),
        fetch("/api/v1/admin/turfs"),
      ]);

      const statsJson = await statsRes.json();
      const turfsJson = await turfsRes.json();

      if (statsJson.data) {
        setStats(statsJson.data.stats);
        setRecentBookings(statsJson.data.recentBookings || []);
      }
      if (turfsJson.data) {
        setTurfs(turfsJson.data);
      }
    } catch (err) {
      console.error("Error loading admin data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleReview(turfId: string, newStatus: "APPROVED" | "REJECTED") {
    try {
      const res = await fetch(`/api/v1/admin/turfs/${turfId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (res.ok) {
        setActionMessage(json.message);
        loadData(); // Refresh list and stats
      }
    } catch (err) {
      console.error("Review error", err);
    }
  }

  const filteredTurfs =
    filterStatus === "All"
      ? turfs
      : turfs.filter((t) => t.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>CUET Platform Moderation Console</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-forest)] uppercase leading-none">
              Governance & Venue Approval
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
              Verify turf certifications, monitor platform GMV, and manage venue partner approvals.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold self-start sm:self-auto">
            SuperAdmin: System Controller
          </div>
        </div>

        {/* Action Status Toast */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-purple-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* 1. KEY PLATFORM KPIS */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Gross Marketplace Value (GMV)
              </span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-forest)]">
                ৳{stats.totalGMV.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block">
                Total bKash / Nagad volume
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Platform Take-Rate (5%)
              </span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-purple-700">
                ৳{stats.platformCommission.toLocaleString()}
              </span>
              <span className="text-[10px] text-purple-800 font-bold block">
                Net Platform Earnings
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Verified Venues
              </span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-forest)]">
                {stats.approvedTurfs} / {stats.totalTurfs}
              </span>
              <span className="text-[10px] text-[var(--color-field)] font-bold block">
                {stats.pendingTurfs} Pending Review
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Total Ecosystem Users
              </span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-forest)]">
                {stats.totalUsers}
              </span>
              <span className="text-[10px] text-[var(--color-ink-muted)] font-semibold block">
                Players, Captains & Owners
              </span>
            </div>
          </div>
        )}

        {/* 2. VENUE MODERATION & APPROVAL QUEUE */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-card-border)] pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider block">
                Partner Governance
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)] uppercase">
                Turf Venue Moderation Queue
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 text-xs">
              {["All", "APPROVED", "PENDING_REVIEW", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    filterStatus === st
                      ? "bg-purple-700 text-white"
                      : "bg-[var(--color-paper)] text-[var(--color-forest)] border border-[var(--color-card-border)]"
                  }`}
                >
                  {st === "PENDING_REVIEW" ? "Pending" : st === "APPROVED" ? "Approved" : st === "REJECTED" ? "Rejected" : "All"}
                </button>
              ))}
            </div>
          </div>

          {filteredTurfs.length === 0 ? (
            <p className="text-xs text-[var(--color-ink-muted)] text-center py-8">
              No venues found in this category.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredTurfs.map((turf) => (
                <div
                  key={turf.id}
                  className="p-5 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={turf.coverImage}
                      alt={turf.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-[var(--color-card-border)]"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display text-2xl font-bold text-[var(--color-forest)]">
                          {turf.name}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            turf.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : turf.status === "PENDING_REVIEW"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {turf.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-ink-muted)]">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" />
                          {turf.area}, {turf.city}
                        </span>
                        <span>•</span>
                        <span>Formats: <strong>{turf.pitchFormats}</strong></span>
                        <span>•</span>
                        <span>Rate: <strong>৳{turf.basePricePerHour}/hr</strong></span>
                      </div>

                      <div className="text-[11px] text-[var(--color-ink-muted)] pt-1 flex items-center gap-2">
                        <span>Partner: <strong>{turf.owner?.name || "Eco Sports"}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[var(--color-field)]" />
                          {turf.owner?.phone || "+8801819876543"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Moderation Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-[var(--color-card-border)]">
                    {turf.status !== "APPROVED" && (
                      <button
                        onClick={() => handleReview(turf.id, "APPROVED")}
                        className="btn-press px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Listing</span>
                      </button>
                    )}

                    {turf.status !== "REJECTED" && (
                      <button
                        onClick={() => handleReview(turf.id, "REJECTED")}
                        className="btn-press px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs shadow-xs flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject / Suspend</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. RECENT BOOKINGS AUDIT FEED */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-4">
            <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
              Recent Platform Transactions
            </h3>
            <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
              Real-time bKash Settlement Log
            </span>
          </div>

          <div className="space-y-2.5">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-card-border)] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[var(--color-forest)]">{b.turf.name}</span>
                  <span className="text-[var(--color-ink-muted)] ml-2">({b.user.name})</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[var(--color-field)]">৳{b.totalAmount}</span>
                  <span className="text-[10px] text-[var(--color-ink-muted)]">
                    {new Date(b.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
