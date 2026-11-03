"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Lock,
  Unlock,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowLeft,
  PhoneCall,
  Wrench,
  Banknote,
  SlidersHorizontal,
  CalendarDays,
  Sparkles,
  Save,
  Loader2,
  Edit3,
  TrendingUp,
} from "lucide-react";

interface TurfSummary {
  id: string;
  name: string;
  area: string;
  city: string;
  basePricePerHour: number;
}

interface BlockedSlot {
  id: string;
  turfId: string;
  startTime: string;
  endTime: string;
  reason: string;
  turf: { name: string; area: string };
}

interface AvailabilityRuleItem {
  id?: string;
  dayOfWeek: number;
  openHour: number;
  closeHour: number;
  hourlyRate: number;
}

interface DailySlot {
  slotId: string;
  startTime: string;
  endTime: string;
  timeLabel: string;
  isPeakHour: boolean;
  price: number;
  basePrice: number;
  status: "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED" | "UNAVAILABLE";
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const HOUR_OPTIONS = [
  { value: 14, label: "2:00 PM" },
  { value: 15, label: "3:00 PM" },
  { value: 16, label: "4:00 PM" },
  { value: 17, label: "5:00 PM" },
  { value: 18, label: "6:00 PM" },
  { value: 23, label: "11:00 PM" },
  { value: 24, label: "12:00 AM (Midnight)" },
  { value: 25, label: "1:00 AM (Next Day)" },
  { value: 26, label: "2:00 AM (Next Day)" },
  { value: 27, label: "3:00 AM (Next Day)" },
];

export default function OwnerSchedulePage() {
  const searchParams = useSearchParams();
  const initialTurfId = searchParams.get("turfId");

  const [turfs, setTurfs] = useState<TurfSummary[]>([]);
  const [selectedTurfId, setSelectedTurfId] = useState<string>(initialTurfId || "");
  const [activeTab, setActiveTab] = useState<"grid" | "slots">("grid");

  // Availability Rules (7-Day Grid)
  const [rules, setRules] = useState<AvailabilityRuleItem[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [savingRules, setSavingRules] = useState(false);

  // Daily Slots (Interactive Timeline)
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dailySlots, setDailySlots] = useState<DailySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Blocked Slots & Locker Form
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [startHour, setStartHour] = useState("20");
  const [reason, setReason] = useState("Direct phone booking - Cash Paid");
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

  // Status banners
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 1. Fetch Owner Turfs
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/v1/owner/turfs");
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTurfs(json.data);
          if (!selectedTurfId || !json.data.some((t: TurfSummary) => t.id === selectedTurfId)) {
            setSelectedTurfId(json.data[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading owner turfs", err);
      }
    }
    loadData();
  }, []);

  // 2. Fetch 7-Day Availability Rules when Turf changes
  useEffect(() => {
    if (!selectedTurfId) return;

    async function loadRules() {
      setLoadingRules(true);
      try {
        const res = await fetch(`/api/v1/owner/availability-rules?turfId=${selectedTurfId}`);
        const json = await res.json();
        if (json.data?.rules) {
          setRules(json.data.rules);
        }
      } catch (err) {
        console.error("Error fetching rules", err);
      } finally {
        setLoadingRules(false);
      }
    }

    loadRules();
  }, [selectedTurfId]);

  // 3. Fetch Blocked Intervals & Daily Slots
  useEffect(() => {
    if (!selectedTurfId) return;

    async function loadBlockedAndSlots() {
      try {
        const res = await fetch(`/api/v1/owner/blocked-intervals?turfId=${selectedTurfId}`);
        const json = await res.json();
        if (json.data) {
          setBlockedSlots(json.data);
        }
      } catch (err) {
        console.error("Error fetching blocked intervals", err);
      }

      // Fetch daily slots
      setLoadingSlots(true);
      try {
        const slotRes = await fetch(
          `/api/v1/turfs/${selectedTurfId}/availability?date=${selectedDate}`
        );
        const slotJson = await slotRes.json();
        if (slotJson.data?.slots) {
          setDailySlots(slotJson.data.slots);
        }
      } catch (err) {
        console.error("Error loading slots", err);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadBlockedAndSlots();
  }, [selectedTurfId, selectedDate]);

  // Handle Rule changes
  function handleRateChange(dayIndex: number, newRate: number) {
    setRules((prev) =>
      prev.map((r) => (r.dayOfWeek === dayIndex ? { ...r, hourlyRate: newRate } : r))
    );
  }

  function handleHourChange(dayIndex: number, field: "openHour" | "closeHour", val: number) {
    setRules((prev) =>
      prev.map((r) => (r.dayOfWeek === dayIndex ? { ...r, [field]: val } : r))
    );
  }

  // Quick Strategy: Weekend Surge (+৳300 on Fri & Sat)
  function applyWeekendSurge() {
    const weekdayAvg =
      rules.find((r) => r.dayOfWeek === 1)?.hourlyRate ||
      turfs.find((t) => t.id === selectedTurfId)?.basePricePerHour ||
      1500;

    setRules((prev) =>
      prev.map((r) => {
        if (r.dayOfWeek === 5 || r.dayOfWeek === 6) {
          // Friday or Saturday
          return { ...r, hourlyRate: weekdayAvg + 300 };
        }
        return { ...r, hourlyRate: weekdayAvg };
      })
    );

    setStatusMessage({
      type: "success",
      text: "Applied Weekend Surge (+৳300 on Friday & Saturday). Click 'Save 7-Day Grid' below to apply.",
    });
  }

  // Quick Strategy: Uniform Rate
  function applyUniformRate() {
    const base = turfs.find((t) => t.id === selectedTurfId)?.basePricePerHour || 1500;
    setRules((prev) => prev.map((r) => ({ ...r, hourlyRate: base })));
    setStatusMessage({
      type: "success",
      text: `Reset all 7 days to base rate (৳${base}/hr). Click 'Save 7-Day Grid' to apply.`,
    });
  }

  // Save 7-Day Rules to Server
  async function handleSaveRules() {
    if (!selectedTurfId) return;
    setSavingRules(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/v1/owner/availability-rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turfId: selectedTurfId,
          rules,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatusMessage({
          type: "error",
          text: json.error?.message || "Failed to save schedule rules.",
        });
        return;
      }

      setStatusMessage({
        type: "success",
        text: "7-Day rate & schedule grid saved! Customer booking timetables updated.",
      });

      // Refresh daily slots
      const slotRes = await fetch(
        `/api/v1/turfs/${selectedTurfId}/availability?date=${selectedDate}`
      );
      const slotJson = await slotRes.json();
      if (slotJson.data?.slots) setDailySlots(slotJson.data.slots);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Network error saving schedule rules." });
    } finally {
      setSavingRules(false);
    }
  }

  // One-Click AI Dynamic Rates Preset (Random Forest ML Engine)
  async function handleApplyAiRatesPreset(action: "APPLY" | "RESET") {
    if (!selectedTurfId) return;
    setSavingRules(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/v1/owner/ai-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turfId: selectedTurfId,
          action,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatusMessage({
          type: "error",
          text: json.error?.message || "Failed to apply AI pricing strategy.",
        });
        return;
      }

      if (json.data?.updatedRules) {
        setRules(json.data.updatedRules);
      }

      setStatusMessage({
        type: "success",
        text: json.message || "⚡ AI Dynamic Smart Rates applied successfully across all 7 days!",
      });

      // Refresh daily slots
      const slotRes = await fetch(
        `/api/v1/turfs/${selectedTurfId}/availability?date=${selectedDate}`
      );
      const slotJson = await slotRes.json();
      if (slotJson.data?.slots) setDailySlots(slotJson.data.slots);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Network error applying AI pricing." });
    } finally {
      setSavingRules(false);
    }
  }

  // Quick Lock a specific slot from the interactive timeline
  async function handleQuickLockSlot(slot: DailySlot) {
    if (!selectedTurfId) return;

    try {
      const res = await fetch("/api/v1/owner/blocked-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turfId: selectedTurfId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          reason: "Owner Maintenance / Direct Phone Booking",
        }),
      });

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: `Slot ${slot.timeLabel} locked successfully!`,
        });
        // Refresh
        const refSlots = await fetch(
          `/api/v1/turfs/${selectedTurfId}/availability?date=${selectedDate}`
        );
        const jsonSlots = await refSlots.json();
        if (jsonSlots.data?.slots) setDailySlots(jsonSlots.data.slots);

        const refBlocked = await fetch(
          `/api/v1/owner/blocked-intervals?turfId=${selectedTurfId}`
        );
        const jsonBlocked = await refBlocked.json();
        if (jsonBlocked.data) setBlockedSlots(jsonBlocked.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Handle Unblock Slot
  async function handleUnblockSlot(id: string) {
    try {
      const res = await fetch(`/api/v1/owner/blocked-intervals?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: "Slot unlocked! It is now available again for online bookings.",
        });
        // Refresh
        setBlockedSlots((prev) => prev.filter((s) => s.id !== id));
        const refSlots = await fetch(
          `/api/v1/turfs/${selectedTurfId}/availability?date=${selectedDate}`
        );
        const jsonSlots = await refSlots.json();
        if (jsonSlots.data?.slots) setDailySlots(jsonSlots.data.slots);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Handle Manual Block Submission
  async function handleBlockSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTurfId) return;

    setIsSubmittingBlock(true);
    setStatusMessage(null);

    const startDate = new Date(selectedDate);
    const h = parseInt(startHour, 10);
    if (h === 24) {
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setHours(h, 0, 0, 0);
    }

    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);

    try {
      const res = await fetch("/api/v1/owner/blocked-intervals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turfId: selectedTurfId,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          reason,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatusMessage({
          type: "error",
          text: json.error?.message || "Failed to lock slot.",
        });
        return;
      }

      setStatusMessage({
        type: "success",
        text: "Slot successfully locked for maintenance/offline booking!",
      });

      // Refresh
      const ref = await fetch(`/api/v1/owner/blocked-intervals?turfId=${selectedTurfId}`);
      const refJson = await ref.json();
      if (refJson.data) setBlockedSlots(refJson.data);

      const refSlots = await fetch(
        `/api/v1/turfs/${selectedTurfId}/availability?date=${selectedDate}`
      );
      const jsonSlots = await refSlots.json();
      if (jsonSlots.data?.slots) setDailySlots(jsonSlots.data.slots);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Network error while locking slot." });
    } finally {
      setIsSubmittingBlock(false);
    }
  }

  const selectedTurf = turfs.find((t) => t.id === selectedTurfId);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/owner"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-forest)] hover:text-[var(--color-field)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Owner Overview</span>
          </Link>

          {selectedTurf && (
            <Link
              href={`/owner/turfs/${selectedTurf.id}/edit`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] hover:underline"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Base Venue Specs & Rate</span>
            </Link>
          )}
        </div>

        {/* Page Title & Turf Selector */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] uppercase tracking-wider">
                <CalendarDays className="w-4 h-4" />
                <span>Schedule & Rate Management</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-black text-[var(--color-forest)] tracking-tight mt-1">
                7-Day Rate & Schedule Grid
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Set custom slot prices for peak days (e.g. Weekend Friday surges) and manage maintenance locks.
              </p>
            </div>

            {/* Venue Selector */}
            {turfs.length > 0 && (
              <div className="min-w-[280px]">
                <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-1.5">
                  Select Venue
                </label>
                <select
                  value={selectedTurfId}
                  onChange={(e) => setSelectedTurfId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                >
                  {turfs.map((turf) => (
                    <option key={turf.id} value={turf.id}>
                      {turf.name} ({turf.area} • ৳{turf.basePricePerHour}/hr)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-card-border)]">
            <button
              onClick={() => setActiveTab("grid")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "grid"
                  ? "bg-[var(--color-forest)] text-white shadow-xs"
                  : "bg-[var(--color-paper)] text-neutral-600 hover:text-[var(--color-forest)] border border-[var(--color-card-border)]"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>7-Day Rate & Schedule Grid</span>
            </button>

            <button
              onClick={() => setActiveTab("slots")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "slots"
                  ? "bg-[var(--color-forest)] text-white shadow-xs"
                  : "bg-[var(--color-paper)] text-neutral-600 hover:text-[var(--color-forest)] border border-[var(--color-card-border)]"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Live Daily Slots & Maintenance Locker</span>
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-start gap-3 border text-sm font-medium transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>{statusMessage.text}</div>
          </div>
        )}

        {/* TAB 1: 7-DAY RATE & SCHEDULE GRID */}
        {activeTab === "grid" && (
          <div className="space-y-6">
            {/* Quick Strategy Controls */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--color-card-border)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-forest)] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[var(--color-field)]" />
                  <span>One-Click Rate Strategies</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Quickly configure weekend surge rates or uniform base pricing across all days.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleApplyAiRatesPreset("APPLY")}
                  disabled={savingRules}
                  className="btn-press flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[var(--color-field)] hover:brightness-110 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Random Forest ML demand dynamic pricing"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  <span>⚡ Apply AI Smart Rates</span>
                </button>
                <button
                  type="button"
                  onClick={applyWeekendSurge}
                  disabled={savingRules}
                  className="btn-press flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)] text-[var(--color-forest)] hover:border-[var(--color-field)] text-xs font-bold disabled:opacity-50"
                >
                  Weekend Surge (+৳300)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAiRatesPreset("RESET")}
                  disabled={savingRules}
                  className="btn-press flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white border border-[var(--color-card-border)] text-neutral-700 hover:text-[var(--color-forest)] text-xs font-bold disabled:opacity-50"
                >
                  Reset Base
                </button>
              </div>
            </div>

            {/* 7-Day Grid Cards */}
            {loadingRules ? (
              <div className="bg-white p-12 rounded-3xl border border-[var(--color-card-border)] flex flex-col items-center justify-center gap-3 text-neutral-500">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-field)]" />
                <span className="text-sm font-semibold">Loading 7-day schedule rules...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                  const rule = rules.find((r) => r.dayOfWeek === dayIdx) || {
                    dayOfWeek: dayIdx,
                    openHour: 16,
                    closeHour: 25,
                    hourlyRate: selectedTurf?.basePricePerHour || 1500,
                  };

                  const isWeekend = dayIdx === 5 || dayIdx === 6; // Friday / Saturday

                  return (
                    <div
                      key={dayIdx}
                      className={`bg-white p-5 rounded-3xl border transition-all ${
                        isWeekend
                          ? "border-emerald-300 shadow-sm"
                          : "border-[var(--color-card-border)]"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-3">
                        <span className="font-display font-black text-lg text-[var(--color-forest)]">
                          {DAY_NAMES[dayIdx]}
                        </span>
                        {isWeekend ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 tracking-wider">
                            Weekend Peak
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                            Weekday
                          </span>
                        )}
                      </div>

                      <div className="pt-4 space-y-4">
                        {/* Hourly Rate Input */}
                        <div>
                          <label className="block text-[11px] font-bold text-[var(--color-forest)] uppercase tracking-wider mb-1">
                            Hourly Rate (৳/hr)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--color-field)]">
                              ৳
                            </span>
                            <input
                              type="number"
                              min="500"
                              max="10000"
                              step="50"
                              value={rule.hourlyRate}
                              onChange={(e) =>
                                handleRateChange(dayIdx, Number(e.target.value))
                              }
                              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-bold text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                            />
                          </div>
                        </div>

                        {/* Operating Hours */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                              Opens
                            </label>
                            <select
                              value={rule.openHour}
                              onChange={(e) =>
                                handleHourChange(dayIdx, "openHour", Number(e.target.value))
                              }
                              className="w-full px-2 py-2 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-field)]"
                            >
                              {HOUR_OPTIONS.filter((h) => h.value < 20).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                              Closes
                            </label>
                            <select
                              value={rule.closeHour}
                              onChange={(e) =>
                                handleHourChange(dayIdx, "closeHour", Number(e.target.value))
                              }
                              className="w-full px-2 py-2 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-field)]"
                            >
                              {HOUR_OPTIONS.filter((h) => h.value > 20).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={savingRules || loadingRules}
                onClick={handleSaveRules}
                className="btn-press w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {savingRules ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving 7-Day Schedule...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save 7-Day Schedule & Custom Rates</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE DAILY SLOTS & MAINTENANCE LOCKER */}
        {activeTab === "slots" && (
          <div className="space-y-6">
            {/* Date Selector Banner */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--color-card-border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[var(--color-field)] uppercase tracking-wider block">
                  Select Inspection Date
                </span>
                <h3 className="font-display font-bold text-xl text-[var(--color-forest)]">
                  Slots for {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                />
              </div>
            </div>

            {/* Visual Slots Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-3">
                <h3 className="font-display font-bold text-lg text-[var(--color-forest)]">
                  Hourly Slots Timetable
                </h3>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                    Booked
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    Locked
                  </span>
                </div>
              </div>

              {loadingSlots ? (
                <div className="p-10 flex flex-col items-center justify-center gap-2 text-neutral-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--color-field)]" />
                  <span className="text-xs font-semibold">Loading daily slots...</span>
                </div>
              ) : dailySlots.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">
                  No slots configured for this date. Check operating hours in the 7-Day Grid.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dailySlots.map((slot) => {
                    const isAvail = slot.status === "AVAILABLE";
                    const isBooked = slot.status === "BOOKED";
                    const isBlocked = slot.status === "BLOCKED";
                    const isHeld = slot.status === "HELD";

                    return (
                      <div
                        key={slot.slotId}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                          isAvail
                            ? "bg-emerald-50/40 border-emerald-200"
                            : isBooked
                            ? "bg-blue-50/40 border-blue-200"
                            : isBlocked
                            ? "bg-rose-50/40 border-rose-200"
                            : "bg-neutral-50 border-neutral-200"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-[var(--color-forest)]">
                            {slot.timeLabel}
                          </div>
                          <div className="text-sm font-black text-[var(--color-field)] mt-0.5">
                            ৳{slot.price}
                            {slot.isPeakHour && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded ml-1.5">
                                Peak
                              </span>
                            )}
                          </div>
                          <span
                            className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded mt-1.5 ${
                              isAvail
                                ? "bg-emerald-100 text-emerald-800"
                                : isBooked
                                ? "bg-blue-100 text-blue-800"
                                : isBlocked
                                ? "bg-rose-100 text-rose-800"
                                : "bg-neutral-200 text-neutral-700"
                            }`}
                          >
                            {slot.status}
                          </span>
                        </div>

                        {/* Quick Actions */}
                        <div>
                          {isAvail && (
                            <button
                              type="button"
                              onClick={() => handleQuickLockSlot(slot)}
                              className="btn-press text-[11px] font-bold px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1"
                              title="Lock for direct walk-in / phone booking"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Lock</span>
                            </button>
                          )}
                          {isBlocked && (
                            <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Locked</span>
                            </span>
                          )}
                          {isBooked && (
                            <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Reserved</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Offline Booking / Maintenance Lock Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[var(--color-card-border)] pb-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-[var(--color-forest)]">
                      Lock Slot (Direct Phone / Walk-in)
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Reserve a slot offline so online customers cannot double-book it
                    </p>
                  </div>
                </div>

                <form onSubmit={handleBlockSlot} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--color-forest)] uppercase tracking-wider mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--color-forest)] uppercase tracking-wider mb-1">
                        Start Hour
                      </label>
                      <select
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-xs font-semibold"
                      >
                        <option value="16">4:00 PM</option>
                        <option value="17">5:00 PM</option>
                        <option value="18">6:00 PM</option>
                        <option value="19">7:00 PM</option>
                        <option value="20">8:00 PM</option>
                        <option value="21">9:00 PM</option>
                        <option value="22">10:00 PM</option>
                        <option value="23">11:00 PM</option>
                        <option value="24">12:00 AM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--color-forest)] uppercase tracking-wider mb-1">
                      Reason / Customer Notes
                    </label>
                    <input
                      type="text"
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Phone booking - Tanvir (Cash Paid)"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-xs font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingBlock}
                    className="btn-press w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSubmittingBlock ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                    <span>Lock Slot for Offline Booking</span>
                  </button>
                </form>
              </div>

              {/* Active Locked Slots List */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-3">
                  <h3 className="font-display font-bold text-base text-[var(--color-forest)] flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-neutral-500" />
                    <span>Currently Locked Intervals</span>
                  </h3>
                  <span className="text-xs font-bold text-neutral-500">
                    {blockedSlots.length} Active
                  </span>
                </div>

                {blockedSlots.length === 0 ? (
                  <div className="p-8 text-center text-neutral-400 text-xs">
                    No active maintenance or offline blocks recorded.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {blockedSlots.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-[var(--color-forest)]">
                            {new Date(item.startTime).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            •{" "}
                            {new Date(item.startTime).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-neutral-500 text-[11px] truncate max-w-[200px]">
                            {item.reason}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUnblockSlot(item.id)}
                          className="btn-press text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Unlock</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
