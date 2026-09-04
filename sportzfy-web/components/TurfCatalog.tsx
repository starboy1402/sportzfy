"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  Search,
  Users,
  Flame,
  ArrowRight,
  Sparkles,
  Filter,
} from "lucide-react";

export interface TurfItem {
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
}

export default function TurfCatalog({ turfs }: { turfs: TurfItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedFormat, setSelectedFormat] = useState("All");

  const filteredTurfs = useMemo(() => {
    return turfs.filter((t) => {
      const matchesSearch =
        searchQuery === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = selectedCity === "All" || t.city.toLowerCase() === selectedCity.toLowerCase();

      const matchesFormat =
        selectedFormat === "All" ||
        t.pitchFormats.toLowerCase().includes(selectedFormat.toLowerCase());

      return matchesSearch && matchesCity && matchesFormat;
    });
  }, [turfs, searchQuery, selectedCity, selectedFormat]);

  return (
    <div className="space-y-8">
      {/* Interactive Live Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[var(--color-card-border)] shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[var(--color-field)] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by venue name or area (e.g. Halishahar)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-card-border)] font-semibold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)] text-[var(--color-forest)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-xs text-[var(--color-ink-muted)] hover:text-black font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] shrink-0">
              City:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full text-xs">
              {["All", "Chattogram", "Dhaka"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCity(c)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCity === c
                      ? "bg-[var(--color-forest)] text-white shadow-xs"
                      : "bg-[var(--color-paper)] text-[var(--color-forest)] border border-[var(--color-card-border)] hover:border-[var(--color-field)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Pitch Format Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] shrink-0">
              Pitch:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full text-xs">
              {["All", "7v7", "6v6", "5v5"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFormat(f)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                    selectedFormat === f
                      ? "bg-[var(--color-field)] text-white shadow-xs"
                      : "bg-[var(--color-paper)] text-[var(--color-forest)] border border-[var(--color-card-border)] hover:border-[var(--color-field)]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filter Summary */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-card-border)] text-xs text-[var(--color-ink-muted)]">
          <span>
            Showing <strong className="text-[var(--color-forest)]">{filteredTurfs.length}</strong> of {turfs.length} verified venues
          </span>
          {(searchQuery || selectedCity !== "All" || selectedFormat !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCity("All");
                setSelectedFormat("All");
              }}
              className="text-xs font-bold text-[var(--color-field)] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Turfs */}
      {filteredTurfs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[var(--color-card-border)] shadow-xs">
          <MapPin className="w-10 h-10 text-[var(--color-ink-muted)] mx-auto mb-2 opacity-40" />
          <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] uppercase">
            No Turfs Match Your Filter
          </h3>
          <p className="text-xs text-[var(--color-ink-muted)] mt-1">
            Try adjusting your search keywords or clearing city/format filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCity("All");
              setSelectedFormat("All");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-field)] text-white font-bold text-xs"
          >
            Show All Turfs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTurfs.map((turf) => (
            <div
              key={turf.id}
              className="turf-card bg-white rounded-2xl sm:rounded-3xl border border-[var(--color-card-border)] overflow-hidden flex flex-col group hover:shadow-md hover:border-[var(--color-field)] transition-all"
            >
              {/* Image & Status Badges */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[var(--color-mint)]">
                <img
                  src={turf.coverImage}
                  alt={turf.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top Floating Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[var(--color-forest)]/90 backdrop-blur-md text-white text-[11px] font-bold tracking-wide">
                    {turf.pitchFormats}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-xs text-xs font-bold text-[var(--color-forest)]">
                  <Star className="w-3.5 h-3.5 text-[var(--color-accent)] fill-[var(--color-accent)]" />
                  <span>{turf.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-[var(--color-ink-muted)]">({turf.reviewCount})</span>
                </div>

                {/* Bottom area overlay */}
                <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" />
                  <span>
                    {turf.area}, {turf.city}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[var(--color-forest)] leading-tight group-hover:text-[var(--color-field)] transition-colors">
                    {turf.name}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-ink-muted)] line-clamp-2 leading-relaxed">
                    {turf.description}
                  </p>

                  {/* Amenities Pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {turf.hasFloodlights && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--color-mint)] text-[var(--color-forest)] text-[10px] font-bold">
                        ⚡ Floodlights
                      </span>
                    )}
                    {turf.hasParking && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--color-mint)] text-[var(--color-forest)] text-[10px] font-bold">
                        🅿 Parking
                      </span>
                    )}
                    {turf.hasChangingRoom && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--color-mint)] text-[var(--color-forest)] text-[10px] font-bold">
                        🚿 Changing Room
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Price & CTA */}
                <div className="pt-3 border-t border-[var(--color-card-border)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--color-ink-muted)] block">
                      Hourly Rate
                    </span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-display text-2xl font-bold text-[var(--color-forest)]">
                        ৳{turf.basePricePerHour}
                      </span>
                      <span className="text-xs text-[var(--color-ink-muted)] font-semibold">/hour</span>
                    </div>
                  </div>

                  <Link
                    href={`/turfs/${turf.slug || turf.id}`}
                    className="btn-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white text-xs font-bold tracking-wide shadow-xs transition-colors"
                  >
                    <span>Check Slots</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
