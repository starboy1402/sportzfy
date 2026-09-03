"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function OwnerSchedulePage() {
  const [turfs, setTurfs] = useState<TurfSummary[]>([]);
  const [selectedTurfId, setSelectedTurfId] = useState<string>("");
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const todayStr = new Date().toISOString().split("T")[0];
  const [targetDate, setTargetDate] = useState(todayStr);
  const [startHour, setStartHour] = useState("20"); // 8 PM default
  const [reason, setReason] = useState("Direct phone booking - Zahid Bhai (Cash Paid)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Fetch owner turfs
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/v1/owner/turfs");
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTurfs(json.data);
          setSelectedTurfId(json.data[0].id);
        }
      } catch (err) {
        console.error("Error loading owner turfs", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. Fetch blocked slots
  useEffect(() => {
    async function loadBlocked() {
      if (!selectedTurfId) return;
      try {
        const res = await fetch(`/api/v1/owner/blocked-intervals?turfId=${selectedTurfId}`);
        const json = await res.json();
        if (json.data) {
          setBlockedSlots(json.data);
        }
      } catch (err) {
        console.error("Error fetching blocked intervals", err);
      }
    }
    loadBlocked();
  }, [selectedTurfId]);

  // Handle Block Slot
  async function handleBlockSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTurfId) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const startDate = new Date(targetDate);
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
          text: json.error?.message || "Failed to block slot. Check for online bookings.",
        });
        return;
      }

      setStatusMessage({
        type: "success",
        text: "Slot successfully locked! It is now hidden from the public online app.",
      });

      // Refresh list
      const ref = await fetch(`/api/v1/owner/blocked-intervals?turfId=${selectedTurfId}`);
      const refJson = await ref.json();
      if (refJson.data) setBlockedSlots(refJson.data);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Network error while blocking slot." });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Unblock Slot
  async function handleUnblockSlot(id: string) {
    try {
      const res = await fetch(`/api/v1/owner/blocked-intervals?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBlockedSlots((prev) => prev.filter((s) => s.id !== id));
        setStatusMessage({
          type: "success",
          text: "Slot unlocked. It is now open for online players on the website!",
        });
      }
    } catch (err) {
      console.error("Error unblocking slot", err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-8">
        {/* Breadcrumb Back */}
        <Link
          href="/owner"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-forest)] hover:text-[var(--color-field)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Owner Overview</span>
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Walk-In & Maintenance Locker</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-[var(--color-forest)] uppercase">
            Slot Locker & Walk-in Bookings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            When a team books via phone call or WhatsApp, lock the slot here so online players cannot book it simultaneously.
          </p>
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Slot Locking Form (1 col) */}
          <div className="bg-white p-6 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-5 h-fit">
            <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
              Lock A Slot Offline
            </h3>

            <form onSubmit={handleBlockSlot} className="space-y-4 text-xs">
              {/* Select Turf */}
              <div>
                <label className="font-bold text-[var(--color-forest)] block mb-1">
                  Select Venue:
                </label>
                <select
                  value={selectedTurfId}
                  onChange={(e) => setSelectedTurfId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                >
                  {turfs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.area})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Date */}
              <div>
                <label className="font-bold text-[var(--color-forest)] block mb-1">
                  Date:
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                />
              </div>

              {/* Start Hour */}
              <div>
                <label className="font-bold text-[var(--color-forest)] block mb-1">
                  Hour Window:
                </label>
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                >
                  <option value="16">4:00 PM - 5:00 PM</option>
                  <option value="17">5:00 PM - 6:00 PM</option>
                  <option value="18">6:00 PM - 7:00 PM</option>
                  <option value="19">7:00 PM - 8:00 PM</option>
                  <option value="20">8:00 PM - 9:00 PM (Peak)</option>
                  <option value="21">9:00 PM - 10:00 PM (Peak)</option>
                  <option value="22">10:00 PM - 11:00 PM (Peak)</option>
                  <option value="23">11:00 PM - 12:00 AM</option>
                  <option value="24">12:00 AM - 1:00 AM (Night)</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="font-bold text-[var(--color-forest)] block mb-1">
                  Lockout Reason / Customer Note:
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Phone call reservation - Cash received"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-card-border)] font-medium text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-press w-full py-3 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 mt-4 transition-colors disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Locking..." : "Lock Slot Offline"}</span>
              </button>
            </form>
          </div>

          {/* Right: Currently Locked Slots (2 cols) */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--color-card-border)] pb-4">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-forest)] uppercase">
                Active Blocked Slots ({blockedSlots.length})
              </h3>
              <span className="text-xs text-[var(--color-ink-muted)]">
                Protected from online collision
              </span>
            </div>

            {blockedSlots.length === 0 ? (
              <div className="py-12 text-center text-xs text-[var(--color-ink-muted)] space-y-2">
                <ShieldCheck className="w-10 h-10 text-[var(--color-field)] mx-auto opacity-50" />
                <p>No slots are currently blocked for this venue.</p>
                <p className="text-[11px] text-[var(--color-ink-muted)]">
                  All hours are open for players on the public site.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedSlots.map((slot) => {
                  const s = new Date(slot.startTime);
                  const e = new Date(slot.endTime);
                  const dateLabel = s.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  const timeLabel = `${s.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })} - ${e.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}`;

                  return (
                    <div
                      key={slot.id}
                      className="p-4 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-lg font-bold text-[var(--color-forest)]">
                            {dateLabel} • {timeLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            LOCKED
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-ink-muted)]">
                          Note: <span className="font-medium text-[var(--color-forest)]">{slot.reason}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleUnblockSlot(slot.id)}
                        className="btn-press self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock for Online</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
