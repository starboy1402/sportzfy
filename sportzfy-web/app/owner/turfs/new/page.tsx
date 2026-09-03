"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Shield,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

export default function NewTurfPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [city, setCity] = useState("Chattogram");
  const [area, setArea] = useState("Halishahar");
  const [address, setAddress] = useState("");
  const [basePricePerHour, setBasePricePerHour] = useState("1400");
  const [pitchFormats, setPitchFormats] = useState("6v6, 7v7");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop&q=80"
  );

  // Amenities
  const [hasFloodlights, setHasFloodlights] = useState(true);
  const [hasParking, setHasParking] = useState(true);
  const [hasWashroom, setHasWashroom] = useState(true);
  const [hasChangingRoom, setHasChangingRoom] = useState(true);
  const [hasWater, setHasWater] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/owner/turfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          area,
          address: address || `${area}, ${city}`,
          basePricePerHour: Number(basePricePerHour),
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
        setErrorMessage(json.error?.message || "Failed to create venue.");
        return;
      }

      // Success! Redirect to Owner Dashboard
      router.push("/owner");
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error while submitting venue listing.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/owner"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-forest)] hover:text-[var(--color-field)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Owner Overview</span>
        </Link>

        {/* Heading */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] uppercase tracking-wider">
            <Plus className="w-4 h-4" />
            <span>Venue Onboarding</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-[var(--color-forest)] uppercase">
            List a New Turf Pitch
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            Register your artificial grass football or futsal venue to receive online bookings across Bangladesh.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-6">
          {/* Turf Name */}
          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Venue / Turf Name: *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chittagong Football Arena"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-sm bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
            />
          </div>

          {/* City and Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
                City:
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-semibold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              >
                <option value="Chattogram">Chattogram</option>
                <option value="Dhaka">Dhaka</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
                Area / Zone: *
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Halishahar, Kazir Dewri, Dhanmondi"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-semibold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              />
            </div>
          </div>

          {/* Detailed Address */}
          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Exact Address / Landmark:
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Road 5, Block B, Near Central Mosque"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-medium text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
            />
          </div>

          {/* Pitch Formats & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
                Pitch Formats Supported:
              </label>
              <input
                type="text"
                value={pitchFormats}
                onChange={(e) => setPitchFormats(e.target.value)}
                placeholder="e.g. 5v5, 6v6, 7v7"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
                Base Price Per Hour (৳ BDT): *
              </label>
              <input
                type="number"
                required
                value={basePricePerHour}
                onChange={(e) => setBasePricePerHour(e.target.value)}
                placeholder="1400"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-sm bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              />
            </div>
          </div>

          {/* Cover Photo URL */}
          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Cover Image URL:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-mono text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              />
              <img
                src={coverImage}
                alt="Preview"
                className="w-12 h-12 rounded-xl object-cover border border-[var(--color-card-border)] shrink-0"
              />
            </div>
          </div>

          {/* Verified Amenities Checkboxes */}
          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-2">
              Select Verified Facilities:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-card-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFloodlights}
                  onChange={(e) => setHasFloodlights(e.target.checked)}
                  className="rounded text-[var(--color-field)] focus:ring-0"
                />
                <span className="font-semibold text-[var(--color-forest)]">LED Floodlights</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-card-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasParking}
                  onChange={(e) => setHasParking(e.target.checked)}
                  className="rounded text-[var(--color-field)] focus:ring-0"
                />
                <span className="font-semibold text-[var(--color-forest)]">Free Parking</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-card-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasChangingRoom}
                  onChange={(e) => setHasChangingRoom(e.target.checked)}
                  className="rounded text-[var(--color-field)] focus:ring-0"
                />
                <span className="font-semibold text-[var(--color-forest)]">Dressing Room</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-card-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWashroom}
                  onChange={(e) => setHasWashroom(e.target.checked)}
                  className="rounded text-[var(--color-field)] focus:ring-0"
                />
                <span className="font-semibold text-[var(--color-forest)]">Washroom</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-paper)] border border-[var(--color-card-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWater}
                  onChange={(e) => setHasWater(e.target.checked)}
                  className="rounded text-[var(--color-field)] focus:ring-0"
                />
                <span className="font-semibold text-[var(--color-forest)]">Drinking Water</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Venue Description & Pitch Quality:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe grass quality, rubber pellet infill, goalpost sizes, etc."
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-medium text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-press w-full py-4 rounded-2xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? "Publishing Venue..." : "Publish Turf Listing"}
          </button>
        </form>
      </main>
    </div>
  );
}
