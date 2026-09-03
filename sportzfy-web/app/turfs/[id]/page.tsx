"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  MapPin,
  Star,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Flame,
  Zap,
  Info,
} from "lucide-react";

interface Slot {
  slotId: string;
  startTime: string;
  endTime: string;
  timeLabel: string;
  isPeakHour: boolean;
  price: number;
  status: "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED";
  holdExpiresAt: string | null;
}

interface TurfDetail {
  id: string;
  name: string;
  slug: string;
  city: string;
  area: string;
  address: string;
  description: string;
  pitchFormats: string;
  basePricePerHour: number;
  rating: number;
  reviewCount: number;
  coverImage: string;
  hasFloodlights: boolean;
  hasWashroom: boolean;
  hasChangingRoom: boolean;
  hasParking: boolean;
  hasWater: boolean;
  images: Array<{ url: string; caption?: string }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: { name: string; avatarUrl?: string };
  }>;
}

export default function TurfDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [turf, setTurf] = useState<TurfDetail | null>(null);
  const [loadingTurf, setLoadingTurf] = useState(true);

  // Date selection (defaults to Today)
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Slots state
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Hold action state
  const [holdingSlot, setHoldingSlot] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Turf Details
  useEffect(() => {
    async function fetchTurf() {
      try {
        const res = await fetch(`/api/v1/turfs/${id}`);
        const json = await res.json();
        if (json.data) {
          setTurf(json.data);
        }
      } catch (err) {
        console.error("Failed to load turf", err);
      } finally {
        setLoadingTurf(false);
      }
    }
    fetchTurf();
  }, [id]);

  // Fetch Slots when Date or Turf changes
  useEffect(() => {
    async function fetchSlots() {
      if (!id) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      setErrorMessage(null);
      try {
        const res = await fetch(`/api/v1/turfs/${id}/availability?date=${selectedDate}`);
        const json = await res.json();
        if (json.data?.slots) {
          setSlots(json.data.slots);
        }
      } catch (err) {
        console.error("Failed to load availability", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [id, selectedDate]);

  // Handle Acquire Slot Hold (Atomic Lock)
  async function handleAcquireHold() {
    if (!selectedSlot || !turf) return;
    setHoldingSlot(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/holds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turfId: turf.id,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          price: selectedSlot.price,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error?.message || "Failed to hold slot. It may have just been booked.");
        // Refresh slots immediately to show new status
        const refresh = await fetch(`/api/v1/turfs/${id}/availability?date=${selectedDate}`);
        const refJson = await refresh.json();
        if (refJson.data?.slots) setSlots(refJson.data.slots);
        return;
      }

      // Hold acquired successfully! Redirect to Checkout
      const holdId = json.data.id;
      router.push(`/checkout/${holdId}`);
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error while securing slot. Please try again.");
    } finally {
      setHoldingSlot(false);
    }
  }

  if (loadingTurf) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[var(--color-field)] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-forest)]">
              Loading Turf & Pitch Specs...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-[var(--color-accent)] mx-auto mb-4" />
          <h2 className="font-display text-3xl text-[var(--color-forest)] uppercase">Turf Not Found</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mt-2">
            The requested venue listing could not be found or has been removed.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-forest)] text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-28">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex-1 w-full">
        {/* Breadcrumb Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-forest)] hover:text-[var(--color-field)] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all turfs</span>
        </Link>

        {/* Hero Turf Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Left: Photos & Specs (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Cover Photo */}
            <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-3xl overflow-hidden shadow-md border border-[var(--color-card-border)] bg-[var(--color-mint)]">
              <img
                src={turf.coverImage}
                alt={turf.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--color-field)] text-white font-bold text-xs uppercase tracking-wide inline-block mb-2">
                    {turf.pitchFormats}
                  </span>
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase leading-none">
                    {turf.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" />
                    {turf.address}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-[var(--color-forest)] text-xs font-bold shadow-xs shrink-0 self-start sm:self-auto">
                  <Star className="w-4 h-4 text-[var(--color-accent)] fill-[var(--color-accent)]" />
                  <span>{turf.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-[var(--color-ink-muted)]">
                    ({turf.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* About & Amenities */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
              <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
                Pitch Overview & Specifications
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                {turf.description}
              </p>

              <div className="pt-4 border-t border-[var(--color-card-border)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] block mb-3">
                  Verified Pitch Facilities
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold text-[var(--color-forest)]">
                  {turf.hasFloodlights && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                      <CheckCircle className="w-4 h-4 text-[var(--color-field)] shrink-0" />
                      <span>Pro LED Floodlights</span>
                    </div>
                  )}
                  {turf.hasParking && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                      <CheckCircle className="w-4 h-4 text-[var(--color-field)] shrink-0" />
                      <span>Free Bike/Car Parking</span>
                    </div>
                  )}
                  {turf.hasChangingRoom && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                      <CheckCircle className="w-4 h-4 text-[var(--color-field)] shrink-0" />
                      <span>Dressing & Shower Room</span>
                    </div>
                  )}
                  {turf.hasWashroom && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                      <CheckCircle className="w-4 h-4 text-[var(--color-field)] shrink-0" />
                      <span>Clean Washrooms</span>
                    </div>
                  )}
                  {turf.hasWater && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                      <CheckCircle className="w-4 h-4 text-[var(--color-field)] shrink-0" />
                      <span>Drinking Water</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pricing & Safe Lock Guarantee Card (1 col) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-5">
              <div>
                <span className="text-xs uppercase font-bold text-[var(--color-ink-muted)] block">
                  Base Hourly Rate
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-display text-4xl font-bold text-[var(--color-forest)]">
                    ৳{turf.basePricePerHour}
                  </span>
                  <span className="text-xs text-[var(--color-ink-muted)] font-semibold">/ hour (Evening)</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="p-4 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-card-border)] space-y-2.5 text-xs text-[var(--color-forest)]">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-field)] shrink-0" />
                  <span>Zero Double-Booking Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--color-ink-muted)]">
                  When you select a slot, Sportzfy places an atomic <strong>5-minute hold</strong> while you confirm your bKash payment. No other user can take your slot.
                </p>
              </div>

              <div className="space-y-2 text-xs text-[var(--color-ink-muted)]">
                <div className="flex justify-between py-1 border-b border-[var(--color-card-border)]">
                  <span>Standard Slot Duration</span>
                  <span className="font-bold text-[var(--color-forest)]">60 Minutes</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--color-card-border)]">
                  <span>Peak Hours (8 PM - 11 PM)</span>
                  <span className="font-bold text-[var(--color-accent-hover)]">+৳150 surge</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--color-card-border)]">
                  <span>Cancellation Policy</span>
                  <span className="font-bold text-[var(--color-forest)]">Full refund up to 4 hrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. THE LIVE INTERACTIVE SLOT AVAILABILITY TIMETABLE */}
        <section id="slots-timetable" className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-card-border)] pb-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Real-Time Availability Engine</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-forest)] uppercase">
                Select Your Playing Slot
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)]">
                Green slots are open. Click to reserve and acquire your 5-minute checkout lock.
              </p>
            </div>

            {/* Date Picker Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDate === todayStr
                    ? "bg-[var(--color-forest)] text-white shadow-xs"
                    : "bg-[var(--color-mint)] text-[var(--color-forest)] border border-[var(--color-card-border)] hover:border-[var(--color-field)]"
                }`}
              >
                Today (Tonight)
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow.toISOString().split("T")[0]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDate !== todayStr
                    ? "bg-[var(--color-forest)] text-white shadow-xs"
                    : "bg-[var(--color-mint)] text-[var(--color-forest)] border border-[var(--color-card-border)] hover:border-[var(--color-field)]"
                }`}
              >
                Tomorrow Night
              </button>
            </div>
          </div>

          {/* Error conflict alert if any */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Slots Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--color-ink-muted)] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[var(--color-field)]" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
              <span>Held (In Checkout)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span>Booked (Sold Out)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--color-accent-hover)] ml-auto">
              <Flame className="w-3.5 h-3.5 fill-[var(--color-accent)]" />
              <span>Peak Demand (8 PM - 11 PM)</span>
            </div>
          </div>

          {/* Grid of Slots */}
          {loadingSlots ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-[var(--color-field)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs font-bold text-[var(--color-ink-muted)]">
                Syncing live slot states...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.slotId === slot.slotId;
                const isAvailable = slot.status === "AVAILABLE";

                return (
                  <button
                    key={slot.slotId}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setErrorMessage(null);
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all relative ${
                      isSelected
                        ? "border-[var(--color-field)] bg-[var(--color-mint)] ring-2 ring-[var(--color-field)] shadow-md"
                        : isAvailable
                        ? "border-[var(--color-card-border)] bg-white hover:border-[var(--color-field)] hover:shadow-xs cursor-pointer"
                        : slot.status === "HELD"
                        ? "border-amber-200 bg-amber-50/60 opacity-80 cursor-not-allowed"
                        : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {/* Top Row: Time & Badge */}
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl font-bold text-[var(--color-forest)]">
                        {slot.timeLabel}
                      </span>

                      {slot.isPeakHour && isAvailable && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent-hover)] font-bold text-[10px] flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-[var(--color-accent)]" />
                          Peak
                        </span>
                      )}

                      {slot.status === "HELD" && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Hold Active
                        </span>
                      )}

                      {slot.status === "BOOKED" && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                          Booked
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Price & Status */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--color-card-border)]/70">
                      <span className="font-bold text-[var(--color-forest)]">
                        ৳{slot.price}
                      </span>
                      <span
                        className={`font-semibold ${
                          isAvailable
                            ? isSelected
                              ? "text-[var(--color-field)] font-bold"
                              : "text-[var(--color-field)]"
                            : "text-[var(--color-ink-muted)]"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : isAvailable ? "Tap to Select" : "Unavailable"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 3. MOBILE & DESKTOP STICKY BOTTOM BOOKING BAR */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--color-card-border)] shadow-2xl p-4 sm:py-4 sm:px-8 anim-rise">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-card-border)] flex items-center justify-center text-[var(--color-forest)]">
                <Clock className="w-5 h-5 text-[var(--color-field)]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase text-[var(--color-ink-muted)] tracking-wider">
                  Selected Playing Slot
                </span>
                <span className="font-display text-xl font-bold text-[var(--color-forest)] leading-none">
                  {selectedSlot.timeLabel} • ৳{selectedSlot.price}
                </span>
              </div>
            </div>

            <button
              onClick={handleAcquireHold}
              disabled={holdingSlot}
              className="btn-press w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-sm tracking-wide shadow-md disabled:opacity-50"
            >
              {holdingSlot ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Locking Slot (5m Hold)...</span>
                </>
              ) : (
                <>
                  <span>Lock Slot & Proceed to bKash</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
