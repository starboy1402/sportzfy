"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import confetti from "canvas-confetti";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar,
  CreditCard,
  QrCode,
  Download,
  Share2,
} from "lucide-react";

interface HoldData {
  id: string;
  turfId: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
  expiresAt: string;
  remainingSeconds: number;
  turf: {
    id: string;
    name: string;
    area: string;
    city: string;
    address: string;
    coverImage: string;
    pitchFormats: string;
  };
}

interface ConfirmedBooking {
  id: string;
  referenceCode: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  qrCode: string;
  turf: {
    name: string;
    area: string;
    city: string;
    address: string;
  };
  user: {
    name: string;
    phone: string;
  };
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ holdId: string }>;
}) {
  const router = useRouter();
  const { holdId } = use(params);

  const [hold, setHold] = useState<HoldData | null>(null);
  const [loadingHold, setLoadingHold] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const [isExpired, setIsExpired] = useState(false);

  // Payment method selection
  const [selectedMethod, setSelectedMethod] = useState<"BKASH" | "NAGAD" | "ROCKET">("BKASH");

  // Simulator Modal State
  const [showSimulator, setShowSimulator] = useState(false);
  const [simStep, setSimStep] = useState<1 | 2 | 3>(1);
  const [walletNumber, setWalletNumber] = useState("01812345678");
  const [otp, setOtp] = useState("1234");
  const [pin, setPin] = useState("1234");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);

  // 1. Fetch Hold info
  useEffect(() => {
    async function loadHold() {
      try {
        const res = await fetch(`/api/v1/holds/${holdId}`);
        const json = await res.json();
        if (json.data) {
          setHold(json.data);
          setSecondsLeft(json.data.remainingSeconds);
          if (json.data.isExpired || json.data.status !== "ACTIVE") {
            setIsExpired(true);
          }
        } else {
          setIsExpired(true);
        }
      } catch (err) {
        console.error("Failed to fetch hold", err);
        setIsExpired(true);
      } finally {
        setLoadingHold(false);
      }
    }
    loadHold();
  }, [holdId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (secondsLeft <= 0 || isExpired || confirmedBooking) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isExpired, confirmedBooking]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  // 3. Confirm Booking via Simulator
  async function handleConfirmBooking() {
    setIsProcessingPayment(true);

    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdId,
          paymentMethod: selectedMethod,
          accountNumber: walletNumber,
          transactionId: `${selectedMethod.slice(0, 3)}${Date.now().toString().slice(-7)}`,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error?.message || "Failed to confirm booking.");
        return;
      }

      // Success!
      setConfirmedBooking(json.data);
      setShowSimulator(false);

      // Trigger celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#064E3B", "#F59E0B"],
      });
    } catch (err) {
      console.error(err);
      alert("Error confirming booking. Please check connection.");
    } finally {
      setIsProcessingPayment(false);
    }
  }

  if (loadingHold) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[var(--color-field)] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-forest)]">
              Verifying Slot Hold Lock...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // EXPIRED STATE
  if (isExpired && !confirmedBooking) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)]">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-display text-4xl text-[var(--color-forest)] uppercase">Hold Expired</h2>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-2 leading-relaxed">
            Your 5-minute reservation timer has passed. To prevent double-booking, the slot has been returned to the public pool.
          </p>
          <Link
            href={hold ? `/turfs/${hold.turf.id}` : "/"}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white text-xs font-bold tracking-wide transition-colors"
          >
            <span>Select Another Slot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // SUCCESS / CONFIRMED TICKET STATE
  if (confirmedBooking) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-16">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 pt-8 w-full">
          {/* Top Success Badge */}
          <div className="text-center space-y-2 mb-6 anim-rise">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[var(--color-field)] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-forest)] uppercase">
              Match Slot Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)]">
              Your digital match entry pass has been generated and recorded.
            </p>
          </div>

          {/* The Match Entry Pass Card */}
          <div className="bg-white rounded-3xl border border-[var(--color-card-border)] shadow-xl overflow-hidden anim-rise d2">
            {/* Header Stadium Stripe */}
            <div className="bg-[var(--color-forest)] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 block">
                  Official Match Pass
                </span>
                <span className="font-display text-2xl font-bold">
                  {confirmedBooking.referenceCode}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[var(--color-field)] text-white font-bold text-xs">
                PAID & GUARANTEED
              </span>
            </div>

            {/* Pass Body */}
            <div className="p-6 space-y-5">
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)]">
                <img
                  src={confirmedBooking.qrCode}
                  alt="Entry QR Code"
                  className="w-44 h-44 object-contain rounded-lg"
                />
                <span className="text-[10px] font-bold text-[var(--color-ink-muted)] mt-2 uppercase tracking-wider">
                  Show at turf entry gate to scan
                </span>
              </div>

              {/* Match Facts */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-[var(--color-card-border)]">
                  <span className="text-[var(--color-ink-muted)] font-medium">Turf Venue:</span>
                  <span className="font-bold text-[var(--color-forest)]">{confirmedBooking.turf.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--color-card-border)]">
                  <span className="text-[var(--color-ink-muted)] font-medium">Location:</span>
                  <span className="font-bold text-[var(--color-forest)]">{confirmedBooking.turf.area}, {confirmedBooking.turf.city}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--color-card-border)]">
                  <span className="text-[var(--color-ink-muted)] font-medium">Player Name:</span>
                  <span className="font-bold text-[var(--color-forest)]">{confirmedBooking.user.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--color-card-border)]">
                  <span className="text-[var(--color-ink-muted)] font-medium">Payment Method:</span>
                  <span className="font-bold text-[var(--color-forest)]">{confirmedBooking.paymentMethod} (TxID: {confirmedBooking.transactionId})</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[var(--color-ink-muted)] font-medium">Total Paid:</span>
                  <span className="font-display text-xl font-bold text-[var(--color-field)]">
                    ৳{confirmedBooking.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-[var(--color-mint)] border-t border-[var(--color-card-border)] flex items-center justify-between gap-3">
              <Link
                href="/bookings"
                className="btn-press flex-1 text-center py-3 rounded-xl bg-[var(--color-forest)] text-white text-xs font-bold tracking-wide"
              >
                Go to My Bookings
              </Link>
              <Link
                href="/"
                className="btn-press px-5 py-3 rounded-xl bg-white border border-[var(--color-card-border)] text-[var(--color-forest)] text-xs font-bold tracking-wide"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE CHECKOUT FLOW
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 flex-1 w-full">
        {/* Top Urgency Header */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[var(--color-forest)] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[var(--color-field)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
                Slot Temporarily Held
              </span>
              <span className="text-sm font-semibold">
                Complete payment before the timer releases your slot
              </span>
            </div>
          </div>

          {/* The 5-minute Timer Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl bg-[var(--color-accent)] text-[var(--color-forest-dark)] font-bold text-base shadow-xs">
            <Clock className="w-5 h-5 animate-pulse" />
            <span className="font-mono text-lg">{timeFormatted}</span>
          </div>
        </div>

        {/* Two-Column Checkout Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Venue & Slot Summary (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
              <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
                Reservation Details
              </h3>

              <div className="flex items-center gap-4 p-3 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)]">
                <img
                  src={hold?.turf.coverImage}
                  alt={hold?.turf.name}
                  className="w-16 h-16 object-cover rounded-xl shrink-0"
                />
                <div>
                  <h4 className="font-display text-xl font-bold text-[var(--color-forest)]">
                    {hold?.turf.name}
                  </h4>
                  <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" />
                    {hold?.turf.area}, {hold?.turf.city}
                  </p>
                </div>
              </div>

              {/* Time Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                    Duration
                  </span>
                  <span className="font-bold text-[var(--color-forest)]">60 Minutes</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                    Pitch Format
                  </span>
                  <span className="font-bold text-[var(--color-forest)]">{hold?.turf.pitchFormats}</span>
                </div>
              </div>
            </div>

            {/* Select Local Payment Provider */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
              <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
                Select Mobile Wallet (Bangladesh)
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("BKASH")}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    selectedMethod === "BKASH"
                      ? "border-pink-500 bg-pink-50/70 ring-2 ring-pink-500 font-bold"
                      : "border-[var(--color-card-border)] hover:border-pink-300"
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ৳
                  </span>
                  <span className="text-xs font-bold text-pink-700">bKash</span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("NAGAD")}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    selectedMethod === "NAGAD"
                      ? "border-orange-500 bg-orange-50/70 ring-2 ring-orange-500 font-bold"
                      : "border-[var(--color-card-border)] hover:border-orange-300"
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ৳
                  </span>
                  <span className="text-xs font-bold text-orange-700">Nagad</span>
                </button>

                {/* Rocket */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod("ROCKET")}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    selectedMethod === "ROCKET"
                      ? "border-purple-500 bg-purple-50/70 ring-2 ring-purple-500 font-bold"
                      : "border-[var(--color-card-border)] hover:border-purple-300"
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ৳
                  </span>
                  <span className="text-xs font-bold text-purple-700">Rocket</span>
                </button>
              </div>

              <span className="text-[11px] text-[var(--color-ink-muted)] block">
                *Uses academic testing sandbox simulator. Instant OTP & PIN confirmation without deducting actual currency.
              </span>
            </div>
          </div>

          {/* Right: Payment Summary (1 col) */}
          <div>
            <div className="bg-white p-6 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-5">
              <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
                Payment Summary
              </h3>

              <div className="space-y-2.5 text-xs text-[var(--color-ink-muted)]">
                <div className="flex justify-between py-1 border-b border-[var(--color-card-border)]">
                  <span>Slot Base Fee</span>
                  <span className="font-bold text-[var(--color-forest)]">৳{hold?.price}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--color-card-border)]">
                  <span>Floodlights Fee</span>
                  <span className="font-bold text-[var(--color-field)]">FREE (Included)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--color-card-border)]">
                  <span>Booking Platform Fee</span>
                  <span className="font-bold text-[var(--color-field)]">৳0</span>
                </div>
                <div className="flex justify-between py-2 pt-3 text-sm">
                  <span className="font-bold text-[var(--color-forest)]">Payable Total:</span>
                  <span className="font-display text-2xl font-bold text-[var(--color-forest)]">
                    ৳{hold?.price}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowSimulator(true)}
                className="btn-press w-full py-4 rounded-2xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2"
              >
                <span>Pay ৳{hold?.price} with {selectedMethod}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 4. INTERACTIVE BKASH / NAGAD SANDBOX SIMULATOR MODAL */}
      {showSimulator && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 anim-rise">
          <div className="bg-white rounded-3xl shadow-2xl border border-[var(--color-card-border)] w-full max-w-md overflow-hidden">
            {/* Simulator Header */}
            <div
              className={`p-5 text-white flex items-center justify-between ${
                selectedMethod === "BKASH"
                  ? "bg-pink-600"
                  : selectedMethod === "NAGAD"
                  ? "bg-orange-600"
                  : "bg-purple-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-wider">
                  {selectedMethod} PAYMENT
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  SANDBOX
                </span>
              </div>
              <span className="font-display text-xl">৳{hold?.price}</span>
            </div>

            {/* Modal Steps */}
            <div className="p-6 space-y-5">
              {simStep === 1 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--color-forest)] block">
                    Enter Your {selectedMethod} Account Number:
                  </label>
                  <input
                    type="tel"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                    placeholder="e.g. 01812345678"
                  />
                  <span className="text-[11px] text-[var(--color-ink-muted)] block">
                    *Sample synthetic test wallet number is prefilled.
                  </span>
                  <button
                    onClick={() => setSimStep(2)}
                    className="w-full py-3 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-xs tracking-wide transition-colors mt-2"
                  >
                    Send Verification Code (OTP)
                  </button>
                </div>
              )}

              {simStep === 2 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--color-forest)] block">
                    Enter 4-Digit Verification Code (OTP):
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                    maxLength={4}
                  />
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg font-semibold block text-center">
                    Simulator Auto-Fill: OTP is 1234
                  </span>
                  <button
                    onClick={() => setSimStep(3)}
                    className="w-full py-3 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-xs tracking-wide transition-colors mt-2"
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              {simStep === 3 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--color-forest)] block">
                    Enter 4-Digit PIN to Confirm:
                  </label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                    maxLength={4}
                  />
                  <span className="text-[11px] text-[var(--color-ink-muted)] block text-center">
                    Simulates instant webhook callback and slot conversion.
                  </span>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isProcessingPayment}
                    className="w-full py-3 rounded-xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying with {selectedMethod}...</span>
                      </>
                    ) : (
                      <span>Confirm & Lock Match Pass</span>
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowSimulator(false)}
                className="w-full text-center text-xs font-semibold text-[var(--color-ink-muted)] hover:underline pt-2"
              >
                Cancel payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
