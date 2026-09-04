"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Printer,
  X,
  Sparkles,
  CheckCircle2,
  Phone,
  Zap,
} from "lucide-react";

export interface BookingWithDetails {
  id: string;
  referenceCode: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  createdAt: string;
  qrCode: string;
  turf: {
    id: string;
    slug: string;
    name: string;
    area: string;
    city: string;
    address: string;
    coverImage: string;
    pitchFormats: string;
    hasFloodlights: boolean;
    hasParking: boolean;
    hasWashroom: boolean;
    hasChangingRoom: boolean;
    hasWater: boolean;
  };
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function BookingsClientList({
  bookings,
}: {
  bookings: BookingWithDetails[];
}) {
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);

  function formatTime(isoString: string) {
    const d = new Date(isoString);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const minStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minStr} ${ampm}`;
  }

  function formatDate(isoString: string) {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((b) => {
          const startDateStr = formatDate(b.startTime);
          const timeRange = `${formatTime(b.startTime)} - ${formatTime(b.endTime)}`;

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBooking(b)}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-[var(--color-card-border)] p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[var(--color-field)] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {/* Visual Icon Badge */}
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-card-border)] group-hover:bg-[var(--color-field)] group-hover:text-white transition-colors flex items-center justify-center text-[var(--color-forest)] shrink-0">
                  <Ticket className="w-7 h-7 transition-transform group-hover:scale-110" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-2xl font-bold text-[var(--color-forest)] group-hover:text-[var(--color-field)] transition-colors">
                      {b.turf.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {b.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[var(--color-ink-muted)]">
                    <span className="flex items-center gap-1 font-semibold text-[var(--color-forest)]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-field)]" />
                      {startDateStr}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-[var(--color-forest)]">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-field)]" />
                      {timeRange}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" />
                      {b.turf.area}, {b.turf.city}
                    </span>
                  </div>

                  <div className="text-[11px] text-[var(--color-ink-muted)] flex items-center gap-2 pt-0.5">
                    <span className="font-mono font-bold text-[var(--color-forest)]">
                      Pass Ref: {b.referenceCode}
                    </span>
                    <span>•</span>
                    <span className="text-[var(--color-field)] font-bold group-hover:underline inline-flex items-center gap-0.5">
                      Click to view ticket & QR pass →
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--color-card-border)] shrink-0">
                <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)]">
                  Paid via {b.paymentMethod}
                </span>
                <span className="font-display text-2xl font-bold text-[var(--color-forest)]">
                  ৳{b.totalAmount}
                </span>
                <span className="mt-1 hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[var(--color-field)] group-hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-card-border)] relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="bg-[var(--color-forest)] text-white p-5 sm:p-6 relative">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-mint)]">
                <Sparkles className="w-4 h-4 text-[var(--color-field)]" />
                <span>Official Match Entry Pass</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase leading-tight pr-8">
                {selectedBooking.turf.name}
              </h2>

              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-field)] shrink-0" />
                {selectedBooking.turf.address}
              </p>
            </div>

            {/* Perforated Divider */}
            <div className="relative flex items-center justify-between px-2 bg-white -my-3 z-10">
              <div className="w-6 h-6 rounded-full bg-black/60 -ml-5 shrink-0" />
              <div className="w-full border-b-2 border-dashed border-[var(--color-card-border)] mx-2" />
              <div className="w-6 h-6 rounded-full bg-black/60 -mr-5 shrink-0" />
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)] text-center">
                <div className="p-2 bg-white rounded-2xl shadow-xs border border-[var(--color-card-border)] mb-2">
                  <img
                    src={selectedBooking.qrCode}
                    alt={`QR Pass for ${selectedBooking.referenceCode}`}
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-forest)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-field)]" />
                  <span>Gate Verification Pass:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-[var(--color-card-border)] text-[var(--color-field)]">
                    {selectedBooking.referenceCode}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                  Present this QR code to the venue operator upon pitch arrival.
                </p>
              </div>

              {/* Slot & Match Timing Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-[var(--color-field)]" />
                    Match Date
                  </span>
                  <span className="font-display text-lg font-bold text-[var(--color-forest)] block">
                    {formatDate(selectedBooking.startTime)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-[var(--color-field)]" />
                    Match Interval
                  </span>
                  <span className="font-display text-lg font-bold text-[var(--color-forest)] block">
                    {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                  </span>
                </div>
              </div>

              {/* Player & Payment Summary */}
              <div className="space-y-2 p-4 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)] text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[var(--color-card-border)]">
                  <span className="text-[var(--color-ink-muted)]">Booked Player:</span>
                  <span className="font-bold text-[var(--color-forest)]">{selectedBooking.user.name}</span>
                </div>
                {selectedBooking.user.phone && (
                  <div className="flex justify-between items-center py-1 border-b border-[var(--color-card-border)]">
                    <span className="text-[var(--color-ink-muted)]">Contact Phone:</span>
                    <span className="font-mono font-semibold text-[var(--color-forest)]">{selectedBooking.user.phone}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1 border-b border-[var(--color-card-border)]">
                  <span className="text-[var(--color-ink-muted)]">Pitch Format:</span>
                  <span className="font-bold text-[var(--color-forest)]">{selectedBooking.turf.pitchFormats}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--color-card-border)]">
                  <span className="text-[var(--color-ink-muted)]">Payment Provider:</span>
                  <span className="font-bold text-[var(--color-forest)]">{selectedBooking.paymentMethod}</span>
                </div>
                {selectedBooking.transactionId && (
                  <div className="flex justify-between items-center py-1 border-b border-[var(--color-card-border)]">
                    <span className="text-[var(--color-ink-muted)]">Transaction ID:</span>
                    <span className="font-mono font-semibold text-[var(--color-forest)]">{selectedBooking.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-[var(--color-forest)]">Total Paid:</span>
                  <span className="font-display text-xl font-bold text-[var(--color-forest)]">
                    ৳{selectedBooking.totalAmount}
                  </span>
                </div>
              </div>

              {/* Venue Amenities */}
              <div>
                <span className="text-[11px] font-bold text-[var(--color-forest)] uppercase tracking-wider block mb-2">
                  Venue Amenities Included:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {selectedBooking.turf.hasFloodlights && (
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--color-mint)] text-[var(--color-forest)] font-semibold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[var(--color-field)]" /> Floodlights
                    </span>
                  )}
                  {selectedBooking.turf.hasParking && (
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--color-mint)] text-[var(--color-forest)] font-semibold">
                      Parking
                    </span>
                  )}
                  {selectedBooking.turf.hasWashroom && (
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--color-mint)] text-[var(--color-forest)] font-semibold">
                      Washrooms
                    </span>
                  )}
                  {selectedBooking.turf.hasChangingRoom && (
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--color-mint)] text-[var(--color-forest)] font-semibold">
                      Changing Room
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-press flex-1 py-3 px-4 rounded-xl bg-[var(--color-paper)] hover:bg-emerald-50 border border-[var(--color-card-border)] text-[var(--color-forest)] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Pass</span>
                </button>

                <Link
                  href={`/turfs/${selectedBooking.turf.slug || selectedBooking.turf.id}`}
                  className="btn-press flex-1 py-3 px-4 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <span>Turf Details</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
