import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ArrowRight, Ticket } from "lucide-react";
import QRCode from "qrcode";
import BookingsClientList, { BookingWithDetails } from "@/components/BookingsClientList";

export const revalidate = 0;

export default async function BookingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login?redirect=/bookings");
  }

  const where = currentUser.role === "ADMIN" ? {} : { userId: currentUser.id };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      turf: true,
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedBookings: BookingWithDetails[] = await Promise.all(
    bookings.map(async (b) => {
      const qrData = JSON.stringify({
        ref: b.referenceCode,
        turf: b.turf.name,
        time: b.startTime,
        player: b.user.name,
        status: b.status,
      });

      const qrCode = await QRCode.toDataURL(qrData, {
        width: 250,
        margin: 2,
        color: { dark: "#064E3B", light: "#FFFFFF" },
      });

      return {
        id: b.id,
        referenceCode: b.referenceCode,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        totalAmount: b.totalAmount,
        status: b.status,
        paymentMethod: b.paymentMethod,
        transactionId: b.transactionId,
        createdAt: b.createdAt.toISOString(),
        qrCode,
        turf: {
          id: b.turf.id,
          slug: b.turf.slug,
          name: b.turf.name,
          area: b.turf.area,
          city: b.turf.city,
          address: b.turf.address,
          coverImage: b.turf.coverImage,
          pitchFormats: b.turf.pitchFormats,
          hasFloodlights: b.turf.hasFloodlights,
          hasParking: b.turf.hasParking,
          hasWashroom: b.turf.hasWashroom,
          hasChangingRoom: b.turf.hasChangingRoom,
          hasWater: b.turf.hasWater,
        },
        user: {
          name: b.user.name,
          email: b.user.email,
          phone: b.user.phone,
        },
      };
    })
  );

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
              View your confirmed match entry passes, scannable QR tickets, and reservation details.
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
        {formattedBookings.length === 0 ? (
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
          <BookingsClientList bookings={formattedBookings} />
        )}
      </main>
    </div>
  );
}
