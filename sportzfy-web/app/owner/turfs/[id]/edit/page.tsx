"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Banknote,
  MapPin,
  Sparkles,
  Loader2,
  Building2,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

export default function EditTurfPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [city, setCity] = useState("Chattogram");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [basePricePerHour, setBasePricePerHour] = useState("");
  const [pitchFormats, setPitchFormats] = useState("6v6, 7v7");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // Amenities
  const [hasFloodlights, setHasFloodlights] = useState(true);
  const [hasParking, setHasParking] = useState(true);
  const [hasWashroom, setHasWashroom] = useState(true);
  const [hasChangingRoom, setHasChangingRoom] = useState(true);
  const [hasWater, setHasWater] = useState(true);

  // Fetch current turf data
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function fetchTurfDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/owner/turfs/${id}`);
        const json = await res.json();

        if (!res.ok || !json.data) {
          if (isMounted) {
            setStatusMessage({
              type: "error",
              text: json.error?.message || "Could not find venue details.",
            });
          }
          return;
        }

        const turf = json.data;
        if (isMounted) {
          setName(turf.name || "");
          setCity(turf.city || "Chattogram");
          setArea(turf.area || "");
          setAddress(turf.address || "");
          setBasePricePerHour(String(turf.basePricePerHour || "1500"));
          setPitchFormats(turf.pitchFormats || "6v6, 7v7");
          setDescription(turf.description || "");
          setCoverImage(turf.coverImage || "");
          setHasFloodlights(Boolean(turf.hasFloodlights));
          setHasParking(Boolean(turf.hasParking));
          setHasWashroom(Boolean(turf.hasWashroom));
          setHasChangingRoom(Boolean(turf.hasChangingRoom));
          setHasWater(Boolean(turf.hasWater));
        }
      } catch (err) {
        console.error("Failed to load turf specs:", err);
        if (isMounted) {
          setStatusMessage({
            type: "error",
            text: "Failed to connect to server. Please try again.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTurfDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const numericPrice = Number(basePricePerHour);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid hourly rate greater than 0.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/v1/owner/turfs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          area,
          address: address || `${area}, ${city}`,
          basePricePerHour: numericPrice,
          pitchFormats,
          description,
          coverImage,
          hasFloodlights,
          hasParking,
          hasWashroom,
          hasChangingRoom,
          hasWater,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatusMessage({
          type: "error",
          text: json.error?.message || "Failed to update venue specifications.",
        });
        return;
      }

      setStatusMessage({
        type: "success",
        text: "Venue and slot rates updated successfully! Redirecting...",
      });

      // Brief pause to display success banner, then redirect back to owner portal
      setTimeout(() => {
        router.push("/owner");
      }, 1200);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "Network error while saving venue updates.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/owner"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-forest)] hover:text-[var(--color-field)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Owner Overview</span>
          </Link>

          <Link
            href={`/owner/schedule?turfId=${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] hover:underline"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Manage Slots & Schedule</span>
          </Link>
        </div>

        {/* Page Title */}
        <div className="border-b border-[var(--color-card-border)] pb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Venue Configuration</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-[var(--color-forest)] tracking-tight mt-1">
            Edit Venue & Slot Pricing
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Adjust your hourly rate, pitch formats, and amenities. Rate updates automatically synchronize with your 7-day schedule.
          </p>
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

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-[var(--color-card-border)] flex flex-col items-center justify-center gap-3 text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-field)]" />
            <span className="text-sm font-semibold">Loading venue specifications...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PRICING CARD (KEY HIGHLIGHT) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-mint)] flex items-center justify-center text-[var(--color-field)]">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-forest)]">
                      Base Hourly Rate (৳ / hr)
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Standard hourly booking price applied across your 7-day schedule slots
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 tracking-wider">
                  Live Pricing
                </span>
              </div>

              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-[var(--color-field)]">
                  ৳
                </span>
                <input
                  type="number"
                  required
                  min="500"
                  max="10000"
                  step="50"
                  value={basePricePerHour}
                  onChange={(e) => setBasePricePerHour(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-emerald-200 bg-[var(--color-mint)] text-3xl font-black text-[var(--color-forest)] focus:outline-none focus:border-[var(--color-field)] transition-all"
                  placeholder="1500"
                />
              </div>
              <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-field)]" />
                <span>Existing bookings keep their booked price. Future unreserved slots update instantly.</span>
              </p>
            </div>

            {/* BASIC VENUE DETAILS */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-5">
              <h2 className="text-base font-bold text-[var(--color-forest)] border-b border-[var(--color-card-border)] pb-3">
                Venue Details
              </h2>

              <div>
                <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                  placeholder="e.g. Khulshi Arena Sports Ground"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                  >
                    <option value="Chattogram">Chattogram</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Sylhet">Sylhet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                    Area / Neighborhood *
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                    placeholder="e.g. Khulshi, Halishahar, Dhanmondi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                  Full Street Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                    placeholder="e.g. Road 3, Block B, Khulshi, Chattogram"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                  Pitch Formats Available
                </label>
                <input
                  type="text"
                  value={pitchFormats}
                  onChange={(e) => setPitchFormats(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                  placeholder="e.g. 5v5, 6v6, 7v7"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                  Venue Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                  placeholder="Describe turf quality, grass height, footwear requirements, and parking guidance..."
                />
              </div>
            </div>

            {/* COVER IMAGE */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--color-card-border)] pb-3">
                <ImageIcon className="w-5 h-5 text-[var(--color-forest)]" />
                <h2 className="text-base font-bold text-[var(--color-forest)]">
                  Cover Photo
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              {coverImage && (
                <div className="mt-2 rounded-2xl overflow-hidden border border-[var(--color-card-border)] max-h-56 bg-neutral-100 flex items-center justify-center">
                  <img
                    src={coverImage}
                    alt="Turf Cover Preview"
                    className="w-full h-56 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>
              )}
            </div>

            {/* AMENITIES */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--color-card-border)] pb-3">
                <Sparkles className="w-5 h-5 text-[var(--color-field)]" />
                <h2 className="text-base font-bold text-[var(--color-forest)]">
                  Amenities & Facilities
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-card-border)] hover:bg-[var(--color-mint)] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={hasFloodlights}
                    onChange={(e) => setHasFloodlights(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-field)] focus:ring-[var(--color-field)]"
                  />
                  <span className="text-sm font-semibold text-[var(--color-forest)]">
                    Night Floodlights
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-card-border)] hover:bg-[var(--color-mint)] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={hasParking}
                    onChange={(e) => setHasParking(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-field)] focus:ring-[var(--color-field)]"
                  />
                  <span className="text-sm font-semibold text-[var(--color-forest)]">
                    Dedicated Parking
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-card-border)] hover:bg-[var(--color-mint)] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={hasWashroom}
                    onChange={(e) => setHasWashroom(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-field)] focus:ring-[var(--color-field)]"
                  />
                  <span className="text-sm font-semibold text-[var(--color-forest)]">
                    Washroom Facilities
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-card-border)] hover:bg-[var(--color-mint)] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={hasChangingRoom}
                    onChange={(e) => setHasChangingRoom(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-field)] focus:ring-[var(--color-field)]"
                  />
                  <span className="text-sm font-semibold text-[var(--color-forest)]">
                    Changing Rooms
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-card-border)] hover:bg-[var(--color-mint)] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={hasWater}
                    onChange={(e) => setHasWater(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-field)] focus:ring-[var(--color-field)]"
                  />
                  <span className="text-sm font-semibold text-[var(--color-forest)]">
                    Drinking Water
                  </span>
                </label>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/owner"
                className="btn-press flex-1 py-3.5 rounded-xl border border-[var(--color-card-border)] bg-white text-[var(--color-forest)] font-bold text-sm text-center hover:bg-neutral-50 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-press flex-[2] py-3.5 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Venue & Update Slot Rates</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
