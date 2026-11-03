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
  ArrowDownToLine,
  Wallet,
  Loader2,
  ExternalLink,
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

interface AdminPayoutRequest {
  id: string;
  ownerId: string;
  amount: number;
  method: string;
  accountNumber: string;
  accountHolder?: string | null;
  status: "PENDING" | "APPROVED" | "DISBURSED" | "REJECTED";
  transactionRef?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  processedAt?: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [turfs, setTurfs] = useState<AdminTurf[]>([]);
  const [payouts, setPayouts] = useState<AdminPayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"turfs" | "payouts">("turfs");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadData() {
    try {
      const [statsRes, turfsRes, payoutsRes] = await Promise.all([
        fetch("/api/v1/admin/stats"),
        fetch("/api/v1/admin/turfs"),
        fetch("/api/v1/admin/payouts"),
      ]);

      const statsJson = await statsRes.json();
      const turfsJson = await turfsRes.json();
      const payoutsJson = await payoutsRes.json();

      if (statsJson.data) {
        setStats(statsJson.data.stats);
      }
      if (turfsJson.data) {
        setTurfs(turfsJson.data);
      }
      if (payoutsJson.data) {
        setPayouts(payoutsJson.data);
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

  async function handleProcessPayout(
    payoutId: string,
    action: "APPROVE" | "REJECT"
  ) {
    setProcessingId(payoutId);

    let transactionRef = "";
    let adminNotes = "";

    if (action === "APPROVE") {
      const input = prompt(
        "Enter disbursement Transaction Reference (e.g. bKash TrxID or Bank Voucher):",
        `TRX-${Date.now().toString().slice(-6)}`
      );
      if (input === null) {
        setProcessingId(null);
        return;
      }
      transactionRef = input;
    } else {
      const reason = prompt("Enter reason for rejection (optional):", "Account details invalid");
      if (reason === null) {
        setProcessingId(null);
        return;
      }
      adminNotes = reason;
    }

    try {
      const res = await fetch("/api/v1/admin/payouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId,
          action,
          transactionRef,
          adminNotes,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setActionMessage(json.message);
        loadData();
      } else {
        alert(json.error?.message || "Failed to update payout.");
      }
    } catch (err) {
      console.error("Error processing payout", err);
    } finally {
      setProcessingId(null);
    }
  }

  const filteredTurfs =
    filterStatus === "All"
      ? turfs
      : turfs.filter((t) => t.status === filterStatus);

  const pendingPayoutsCount = payouts.filter((p) => p.status === "PENDING").length;

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
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Operations & Governance</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-forest)] uppercase leading-tight">
              Governance & Financial Console
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
              Verify turf certifications, monitor platform GMV, and manage owner withdrawal disbursements.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold self-start sm:self-auto">
            SuperAdmin: System Controller
          </div>
        </div>

        {/* Action Status Toast */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-purple-600" />
              <span>{actionMessage}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-purple-600 hover:text-purple-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. KEY PLATFORM KPIS */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Gross Marketplace Value (GMV)
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)]">
                ৳{stats.totalGMV.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-700 font-semibold block mt-1">
                Total bKash / Nagad volume
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Platform Take-Rate (5%)
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-purple-700">
                ৳{stats.platformCommission.toLocaleString()}
              </span>
              <span className="text-xs text-purple-800 font-semibold block mt-1">
                Net Platform Earnings
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Verified Venues
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)]">
                {stats.approvedTurfs} / {stats.totalTurfs}
              </span>
              <span className="text-xs text-[var(--color-field)] font-semibold block mt-1">
                {stats.pendingTurfs} Pending Review
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Total Ecosystem Users
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)]">
                {stats.totalUsers}
              </span>
              <span className="text-xs text-[var(--color-ink-muted)] font-semibold block mt-1">
                Players, Captains & Owners
              </span>
            </div>
          </div>
        )}

        {/* 2. ADMIN SECTION TABS */}
        <div className="flex items-center gap-2 border-b border-[var(--color-card-border)] pb-2">
          <button
            onClick={() => setActiveTab("turfs")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === "turfs"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-white text-neutral-600 hover:text-purple-700 border border-[var(--color-card-border)]"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Turf Moderation ({turfs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === "payouts"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-white text-neutral-600 hover:text-purple-700 border border-[var(--color-card-border)]"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Owner Payout Settlements</span>
            {pendingPayoutsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px]">
                {pendingPayoutsCount} Pending
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: VENUE MODERATION QUEUE */}
        {activeTab === "turfs" && (
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-card-border)] pb-4">
              <div>
                <span className="text-xs uppercase font-semibold text-purple-700 tracking-wider block">
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
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-200 shrink-0">
                        <img
                          src={turf.coverImage}
                          alt={turf.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-lg font-bold text-[var(--color-forest)]">
                            {turf.name}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              turf.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : turf.status === "REJECTED"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {turf.status}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center gap-2">
                          <span>{turf.area}, {turf.city}</span>
                          <span>•</span>
                          <span className="font-semibold text-neutral-700">৳{turf.basePricePerHour}/hr</span>
                          <span>•</span>
                          <span>Owner: {turf.owner.name} ({turf.owner.phone || turf.owner.email})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <Link
                        href={`/turfs/${turf.id}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-xl bg-white border border-[var(--color-card-border)] text-xs font-semibold text-neutral-700 hover:text-[var(--color-forest)] flex items-center gap-1"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {turf.status !== "APPROVED" && (
                        <button
                          onClick={() => handleReview(turf.id, "APPROVED")}
                          className="btn-press px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {turf.status !== "REJECTED" && (
                        <button
                          onClick={() => handleReview(turf.id, "REJECTED")}
                          className="btn-press px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: OWNER PAYOUT SETTLEMENTS */}
        {activeTab === "payouts" && (
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-card-border)] pb-4">
              <div>
                <span className="text-xs uppercase font-semibold text-purple-700 tracking-wider block">
                  Treasury & Disbursements
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)] uppercase">
                  Owner Withdrawal Requests Queue
                </h3>
              </div>
              <span className="text-xs font-bold text-neutral-500">
                {payouts.length} Total Requests
              </span>
            </div>

            {payouts.length === 0 ? (
              <div className="p-10 text-center text-neutral-400 text-xs">
                No owner payout requests recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display text-xl font-bold text-[var(--color-forest)]">
                          ৳{payout.amount.toLocaleString()}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-black text-[10px] uppercase">
                          {payout.method}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            payout.status === "PENDING"
                              ? "bg-amber-100 text-amber-800 animate-pulse"
                              : payout.status === "DISBURSED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {payout.status}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-600 flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[var(--color-forest)]">
                          {payout.owner.name}
                        </span>
                        <span>•</span>
                        <span>Account: <strong className="font-mono">{payout.accountNumber}</strong></span>
                        {payout.accountHolder && <span>({payout.accountHolder})</span>}
                        <span>•</span>
                        <span className="text-neutral-400">
                          {new Date(payout.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {payout.transactionRef && (
                        <div className="text-[11px] text-emerald-700 font-mono">
                          TrxID: {payout.transactionRef}
                        </div>
                      )}
                      {payout.adminNotes && (
                        <div className="text-[11px] text-neutral-500 italic">
                          Notes: {payout.adminNotes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {payout.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleProcessPayout(payout.id, "APPROVE")}
                            disabled={processingId === payout.id}
                            className="btn-press px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {processingId === payout.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Approve & Disburse</span>
                          </button>

                          <button
                            onClick={() => handleProcessPayout(payout.id, "REJECT")}
                            disabled={processingId === payout.id}
                            className="btn-press px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {payout.status === "DISBURSED" && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </span>
                      )}

                      {payout.status === "REJECTED" && (
                        <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          <span>Declined</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
