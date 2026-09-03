import Link from "next/link";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Calendar, MapPin, Clock, ArrowRight, ShieldCheck, Ticket } from "lucide-react";

export const revalidate = 0;

export default async function BookingsPage() {
  const currentUser = await getCurrentUser();
  const where = currentUser && currentUser.role !== "ADMIN" ? { userId: currentUser.id } : {};

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      turf: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 flex-1 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] uppercase tracking-wider">
              <Ticket className="w-4 h-4" />
              <span>Player Pass Wallet</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-[var(--color-forest)] uppercase">
              My Match Bookings
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)]">
              View your confirmed match entry passes and reservation details.
            </p>
          </div>

          <Link
            href="/"
            className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
          >
            <span>Book Another Slot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[var(--color-card-border)] shadow-xs">
            <Ticket className="w-12 h-12 text-[var(--color-ink-muted)] mx-auto mb-3 opacity-40" />
            <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
              No Bookings Yet
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1 max-w-sm mx-auto">
              You haven&apos;t reserved any pitches yet. Explore our approved turfs and lock your favorite evening slot!
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-field)] text-white font-bold text-xs shadow-xs"
            >
              Explore Turfs Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-[var(--color-card-border)] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-card-border)] flex items-center justify-center text-[var(--color-forest)] shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[var(--color-field)]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-2xl font-bold text-[var(--color-forest)]">
                        {b.turf.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {b.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-ink-muted)]">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" />
                        {b.turf.area}, {b.turf.city}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-[var(--color-forest)]">
                        Ref: {b.referenceCode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--color-card-border)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)]">
                    Paid via {b.paymentMethod}
                  </span>
                  <span className="font-display text-2xl font-bold text-[var(--color-forest)]">
                    ৳{b.totalAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
