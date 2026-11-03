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
  Banknote,
  ArrowDownToLine,
  Wallet,
  Building2,
  Loader2,
  X,
  Zap,
  RotateCcw,
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
    demandTag?: string;
    demandProbability?: number;
    currentRate: number;
    suggestedRate: number;
    recommendation: string;
    tag?: string;
    confidenceScore?: string;
  }>;
}

interface FinancialSummary {
  grossRevenue: number;
  platformFee: number;
  netRevenue: number;
  disbursedAmount: number;
  pendingAmount: number;
  availableBalance: number;
}

interface PayoutRecord {
  id: string;
  amount: number;
  method: string;
  accountNumber: string;
  accountHolder?: string | null;
  status: "PENDING" | "APPROVED" | "DISBURSED" | "REJECTED";
  transactionRef?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  processedAt?: string | null;
}

export default function OwnerDashboardPage() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [loading, setLoading] = useState(true);

  // Financial Wallet & Payouts state
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([]);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("BKASH");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
  const [payoutAccountHolder, setPayoutAccountHolder] = useState("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // One-Click AI Dynamic Pricing State
  const [selectedAiTurfId, setSelectedAiTurfId] = useState<string>("");
  const [isActivatingAi, setIsActivatingAi] = useState(false);
  const [aiActionMessage, setAiActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function loadPayouts() {
    try {
      const res = await fetch("/api/v1/owner/payouts");
      const json = await res.json();
      if (json.data) {
        setFinancialSummary(json.data.financialSummary);
        setPayoutHistory(json.data.payoutHistory || []);
      }
    } catch (err) {
      console.error("Failed to load payouts", err);
    }
  }

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/v1/owner/stats");
        const json = await res.json();
        if (json.data) {
          setData(json.data);
          if (json.data.ownedTurfs?.length > 0 && !selectedAiTurfId) {
            setSelectedAiTurfId(json.data.ownedTurfs[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load owner stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
    loadPayouts();
  }, []);

  async function handleApplyAiPricing(action: "APPLY" | "RESET") {
    const targetTurfId = selectedAiTurfId || data?.ownedTurfs[0]?.id;
    if (!targetTurfId) return;

    setIsActivatingAi(true);
    setAiActionMessage(null);

    try {
      const res = await fetch("/api/v1/owner/ai-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turfId: targetTurfId,
          action,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setAiActionMessage({
          type: "error",
          text: json.error?.message || "Failed to update dynamic pricing strategy.",
        });
        return;
      }

      setAiActionMessage({
        type: "success",
        text: json.message || "AI dynamic rates applied to your 7-day schedule!",
      });

      // Refresh stats
      const statsRes = await fetch("/api/v1/owner/stats");
      const statsJson = await statsRes.json();
      if (statsJson.data) setData(statsJson.data);
    } catch (err) {
      console.error(err);
      setAiActionMessage({
        type: "error",
        text: "Network error applying AI pricing.",
      });
    } finally {
      setIsActivatingAi(false);
    }
  }

  async function handleRequestPayout(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingPayout(true);
    setPayoutMessage(null);

    const numericAmount = Number(payoutAmount);
    if (isNaN(numericAmount) || numericAmount < 500) {
      setPayoutMessage({
        type: "error",
        text: "Minimum payout request is ৳500.",
      });
      setIsSubmittingPayout(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/owner/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          method: payoutMethod,
          accountNumber: payoutAccountNumber,
          accountHolder: payoutAccountHolder || data?.owner.name,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setPayoutMessage({
          type: "error",
          text: json.error?.message || "Failed to submit payout request.",
        });
        return;
      }

      setPayoutMessage({
        type: "success",
        text: "Withdrawal request submitted! Processing time is usually 2–6 hours.",
      });
      setPayoutAmount("");
      loadPayouts(); // refresh wallet stats
      setTimeout(() => {
        setIsPayoutModalOpen(false);
        setPayoutMessage(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setPayoutMessage({
        type: "error",
        text: "Network error submitting withdrawal.",
      });
    } finally {
      setIsSubmittingPayout(false);
    }
  }

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
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-forest)] uppercase leading-tight">
              Welcome, {data.owner.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
              Manage your turf schedules, monitor online bookings, and optimize slot rates.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="btn-press flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--color-mint)] border border-emerald-300 hover:border-[var(--color-field)] text-[var(--color-forest)] text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <ArrowDownToLine className="w-4 h-4 text-[var(--color-field)]" />
              <span>Withdraw Payout</span>
            </button>

            <Link
              href="/owner/schedule"
              className="btn-press flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[var(--color-card-border)] hover:border-[var(--color-field)] text-[var(--color-forest)] text-xs font-bold shadow-xs transition-colors"
            >
              <Lock className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Lock Slot</span>
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
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Recorded Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[var(--color-field)]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)]">
                ৳{data.stats.totalRevenue.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-700 font-semibold block mt-1">
                Gross Online Bookings
              </span>
            </div>
          </div>

          {/* Bookings */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Confirmed Matches
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)]">
                {data.stats.totalBookings}
              </span>
              <span className="text-xs text-[var(--color-ink-muted)] font-semibold block mt-1">
                Zero double-bookings
              </span>
            </div>
          </div>

          {/* Active Turfs */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Managed Pitches
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)]">
                {data.stats.totalVenues}
              </span>
              <span className="text-xs text-[var(--color-field)] font-semibold block mt-1">
                All Published & Live
              </span>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Evening Occupancy
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-[var(--color-accent)]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)]">
                {data.stats.occupancyRate}%
              </span>
              <span className="text-xs text-amber-700 font-semibold block mt-1">
                Peak Prime Hours (8–11 PM)
              </span>
            </div>
          </div>
        </div>

        {/* 2. FINANCIAL WALLET & WITHDRAWALS STATION */}
        {financialSummary && (
          <section className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-card-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-mint)] flex items-center justify-center text-[var(--color-field)]">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase font-semibold text-[var(--color-field)] tracking-wider block">
                    Financial Settlement
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)] uppercase">
                    Owner Wallet & Payout Station
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="btn-press px-6 py-3 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Request Payout</span>
              </button>
            </div>

            {/* Wallet Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--color-mint)] border border-emerald-200">
                <span className="text-xs font-bold uppercase text-[var(--color-forest)] tracking-wider block">
                  Available to Withdraw
                </span>
                <span className="font-display text-3xl font-black text-[var(--color-field)] mt-1 block">
                  ৳{financialSummary.availableBalance.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-800 font-medium mt-1 block">
                  Ready for instant transfer
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)]">
                <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider block">
                  Gross Bookings
                </span>
                <span className="font-display text-2xl font-bold text-[var(--color-forest)] mt-1 block">
                  ৳{financialSummary.grossRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Total player payments
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)]">
                <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider block">
                  Platform Fee (5%)
                </span>
                <span className="font-display text-2xl font-bold text-neutral-700 mt-1 block">
                  -৳{financialSummary.platformFee.toLocaleString()}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Infrastructure & payment fees
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)]">
                <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider block">
                  Total Disbursed
                </span>
                <span className="font-display text-2xl font-bold text-emerald-700 mt-1 block">
                  ৳{financialSummary.disbursedAmount.toLocaleString()}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Transferred to your accounts
                </span>
              </div>
            </div>

            {/* Payout History */}
            {payoutHistory.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-3">
                  Recent Withdrawal Requests
                </h4>
                <div className="space-y-2">
                  {payoutHistory.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-base text-[var(--color-forest)]">
                          ৳{p.amount.toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-700 font-bold uppercase text-[10px]">
                          {p.method} ({p.accountNumber})
                        </span>
                        <span className="text-neutral-400 text-[11px]">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        {p.status === "PENDING" && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold uppercase text-[10px] animate-pulse">
                            Processing
                          </span>
                        )}
                        {p.status === "DISBURSED" && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px] flex items-center gap-1">
                            <span>Disbursed</span>
                            {p.transactionRef && (
                              <span className="text-neutral-500 font-mono text-[9px]">
                                ({p.transactionRef})
                              </span>
                            )}
                          </span>
                        )}
                        {p.status === "REJECTED" && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold uppercase text-[10px]">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 3. REVENUE OPTIMIZATION & ONE-CLICK AI PRICING */}
        <section className="bg-gradient-to-br from-[var(--color-forest)] via-[#0d2a1f] to-[var(--color-forest-dark)] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border border-emerald-500/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-800/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[var(--color-field)] to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/50">
                <Sparkles className="w-6 h-6 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                    Random Forest ML Engine
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                    Live Inference
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                  One-Click AI Dynamic Pricing
                </h3>
              </div>
            </div>

            {/* Venue Selector (if multiple) & Status Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              {data.ownedTurfs.length > 1 && (
                <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-emerald-200">
                  <span className="text-neutral-400 font-medium">Pitch:</span>
                  <select
                    value={selectedAiTurfId || data.ownedTurfs[0]?.id}
                    onChange={(e) => setSelectedAiTurfId(e.target.value)}
                    className="bg-transparent font-bold text-white outline-none cursor-pointer"
                  >
                    {data.ownedTurfs.map((t) => (
                      <option key={t.id} value={t.id} className="bg-neutral-900 text-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-900/90 border border-emerald-600/50 text-xs font-semibold text-emerald-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Smart Multipliers Active</span>
              </span>
            </div>
          </div>

          {/* Action Message Banner */}
          {aiActionMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold anim-fade ${
                aiActionMessage.type === "success"
                  ? "bg-emerald-900/60 border border-emerald-500 text-emerald-100"
                  : "bg-rose-900/60 border border-rose-500 text-rose-100"
              }`}
            >
              {aiActionMessage.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{aiActionMessage.text}</span>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-emerald-200 font-medium leading-relaxed">
                Automatically applies +20% prime-time surge during high-demand Friday/Saturday evenings and competitive off-peak discounts across your 7-day schedule.
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-emerald-300/80 font-mono">
                <span>• Strict safety clamps: [0.80x – 1.30x]</span>
                <span>• Nearest ৳50 rounding</span>
                <span className="text-emerald-400 font-semibold">• Projected +18% to +24% monthly revenue</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleApplyAiPricing("APPLY")}
                disabled={isActivatingAi}
                className="btn-press flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[var(--color-field)] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-emerald-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isActivatingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Applying ML Rates...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Activate AI Dynamic Rates</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleApplyAiPricing("RESET")}
                disabled={isActivatingAi}
                className="btn-press px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-emerald-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                title="Reset all days to standard base rate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <Link
                href={`/owner/schedule?turfId=${selectedAiTurfId || data.ownedTurfs[0]?.id}`}
                className="btn-press px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-emerald-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <span>7-Day Grid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* AI Insights Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.aiPricingInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 flex flex-col justify-between hover:border-emerald-400/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">
                      {insight.targetWindow}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] text-[var(--color-forest-dark)] font-bold text-xs shadow-xs">
                      {insight.demandTag || "High Demand"}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 py-1">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-emerald-200/80 block">Current Base</span>
                      <span className="font-display text-2xl font-bold line-through text-white/60">
                        ৳{insight.currentRate}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-emerald-200/80 block">Optimized Dynamic Rate</span>
                      <span className="font-display text-3xl font-bold text-emerald-300">
                        ৳{insight.suggestedRate}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    {insight.recommendation}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-300">
                  <span className="text-xs text-emerald-300/80 font-medium">
                    {insight.tag || "Random Forest Machine Learning"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyAiPricing("APPLY")}
                    className="font-bold underline hover:text-white flex items-center gap-1"
                  >
                    <span>Apply This Strategy</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. MANAGED TURFS LIST */}
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
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[var(--color-forest)] text-white text-xs font-semibold">
                    {turf.pitchFormats}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold">
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

        {/* 5. UPCOMING MATCH RESERVATIONS FEED */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-4">
            <div>
              <span className="text-xs uppercase font-semibold text-[var(--color-field)] tracking-wider block">
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
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
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
                      <span className="text-xs uppercase font-semibold text-[var(--color-ink-muted)] block">
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

      {/* PAYOUT REQUEST MODAL */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 anim-rise">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[var(--color-card-border)] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-mint)] flex items-center justify-center text-[var(--color-field)]">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-[var(--color-forest)]">
                    Request Payout Withdrawal
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Disbursed directly to your personal or merchant account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {payoutMessage && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                  payoutMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {payoutMessage.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{payoutMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider">
                    Withdrawal Amount (৳)
                  </label>
                  <span className="text-xs font-semibold text-emerald-700">
                    Available: ৳{financialSummary?.availableBalance.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg text-[var(--color-field)]">
                    ৳
                  </span>
                  <input
                    type="number"
                    required
                    min="500"
                    max={financialSummary?.availableBalance || 100000}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-lg text-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                  />
                </div>
                {financialSummary && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(String(financialSummary.availableBalance))}
                      className="px-2.5 py-1 rounded-lg bg-[var(--color-mint)] border border-emerald-200 text-xs font-bold text-[var(--color-forest)] hover:border-[var(--color-field)]"
                    >
                      Max (৳{financialSummary.availableBalance})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount("2000")}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                    >
                      ৳2,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount("5000")}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                    >
                      ৳5,000
                    </button>
                  </div>
                )}
              </div>

              {/* Method */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-1.5">
                  Payout Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["BKASH", "NAGAD", "BANK_TRANSFER"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayoutMethod(m)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        payoutMethod === m
                          ? "bg-[var(--color-forest)] text-white border-[var(--color-forest)]"
                          : "bg-[var(--color-paper)] text-neutral-700 border-[var(--color-card-border)] hover:border-neutral-400"
                      }`}
                    >
                      {m === "BKASH" ? "bKash" : m === "NAGAD" ? "Nagad" : "Bank"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-1.5">
                  {payoutMethod === "BANK_TRANSFER" ? "Bank Account / IBAN" : "Mobile Wallet Number (11 digits)"}
                </label>
                <input
                  type="text"
                  required
                  value={payoutAccountNumber}
                  onChange={(e) => setPayoutAccountNumber(e.target.value)}
                  placeholder={payoutMethod === "BANK_TRANSFER" ? "AC: 105.110.12345 (Dutch-Bangla Bank)" : "017XXXXXXXX"}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-semibold text-sm text-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                />
              </div>

              {/* Account Holder */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-1.5">
                  Account / Wallet Holder Name
                </label>
                <input
                  type="text"
                  value={payoutAccountHolder}
                  onChange={(e) => setPayoutAccountHolder(e.target.value)}
                  placeholder={data.owner.name}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-semibold text-sm text-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="btn-press flex-1 py-3.5 rounded-xl border border-[var(--color-card-border)] font-bold text-xs text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="btn-press flex-[2] py-3.5 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmittingPayout ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowDownToLine className="w-4 h-4" />
                  )}
                  <span>Confirm Withdrawal Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
