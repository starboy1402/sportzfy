"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Users,
  Star,
  Sparkles,
  ArrowRight,
  Loader2,
  X,
  Flame,
} from "lucide-react";

interface TurfSearchResult {
  id: string;
  name: string;
  slug: string;
  city: string;
  area: string;
  basePricePerHour: number;
  rating: number;
  pitchFormats: string;
  coverImage: string;
}

const TRENDING_AREAS = [
  "Khulshi",
  "Halishahar",
  "Dhanmondi",
  "Kazir Dewri",
  "Chandgaon",
  "Gulshan",
];

export default function HeroGlobalSearch() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All");
  const [format, setFormat] = useState("All");

  const [results, setResults] = useState<TurfSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced real-time search
  useEffect(() => {
    if (!query.trim() && city === "All" && format === "All") {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (city !== "All") params.set("city", city);
        if (format !== "All") params.set("format", format);

        const res = await fetch(`/api/v1/turfs?${params.toString()}`);
        const json = await res.json();
        if (json.data) {
          setResults(json.data.slice(0, 5));
        }
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, city, format]);

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setShowDropdown(false);

    // Scroll to #turfs-grid and pass query parameters
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city !== "All") params.set("city", city);
    if (format !== "All") params.set("format", format);

    router.push(`/?${params.toString()}#turfs-grid`, { scroll: false });

    const gridEl = document.getElementById("turfs-grid");
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleChipClick(areaName: string) {
    setQuery(areaName);
    setShowDropdown(true);
  }

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto relative">
      {/* SEARCH CARD CONTAINER */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border-2 border-emerald-200/80 shadow-lg hover:shadow-xl transition-all space-y-2 sm:space-y-0"
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          {/* 1. KEYWORD / AREA INPUT (sm:col-span-5) */}
          <div className="sm:col-span-5 relative flex items-center">
            <Search className="w-4 h-4 text-[var(--color-field)] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              placeholder="Search turf or neighborhood (e.g. Khulshi)..."
              className="w-full pl-10 pr-8 py-3 rounded-xl sm:rounded-2xl bg-[var(--color-paper)] text-xs sm:text-sm font-semibold text-[var(--color-forest)] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-field)] border border-[var(--color-card-border)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. CITY SELECTOR (sm:col-span-3) */}
          <div className="sm:col-span-3 relative flex items-center">
            <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-3 py-3 rounded-xl sm:rounded-2xl bg-[var(--color-paper)] text-xs sm:text-sm font-semibold text-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)] border border-[var(--color-card-border)] cursor-pointer"
            >
              <option value="All">All Cities</option>
              <option value="Chattogram">Chattogram</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Sylhet">Sylhet</option>
            </select>
          </div>

          {/* 3. PITCH FORMAT (sm:col-span-2) */}
          <div className="sm:col-span-2 relative flex items-center">
            <Users className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full pl-8 pr-2 py-3 rounded-xl sm:rounded-2xl bg-[var(--color-paper)] text-xs sm:text-sm font-semibold text-[var(--color-forest)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)] border border-[var(--color-card-border)] cursor-pointer"
            >
              <option value="All">All Formats</option>
              <option value="5v5">5v5</option>
              <option value="6v6">6v6</option>
              <option value="7v7">7v7</option>
            </select>
          </div>

          {/* 4. ACTION BUTTON (sm:col-span-2) */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="btn-press w-full py-3 rounded-xl sm:rounded-2xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>

      {/* LIVE INSTANT DROPDOWN PREVIEW */}
      {showDropdown && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-[var(--color-card-border)] shadow-xl z-50 overflow-hidden anim-rise">
          <div className="p-3 bg-[var(--color-paper)] border-b border-[var(--color-card-border)] flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--color-forest)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-field)]" />
              <span>Matching Venues ({results.length})</span>
            </span>
            <span className="text-neutral-400 text-[11px]">
              Press Enter to see all
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-neutral-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-field)]" />
              <span>Searching verified pitches...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 text-xs">
              No turfs found matching &quot;{query}&quot;. Try searching &quot;Khulshi&quot; or &quot;Halishahar&quot;.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
              {results.map((turf) => (
                <Link
                  key={turf.id}
                  href={`/turfs/${turf.id}`}
                  onClick={() => setShowDropdown(false)}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-[var(--color-mint)]/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-[var(--color-card-border)]">
                      <img
                        src={turf.coverImage}
                        alt={turf.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-[var(--color-forest)] group-hover:text-[var(--color-field)] transition-colors">
                        {turf.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[var(--color-field)]" />
                        <span>{turf.area}, {turf.city}</span>
                        <span>•</span>
                        <span className="font-semibold text-neutral-600">{turf.pitchFormats}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-black text-[var(--color-forest)]">
                      ৳{turf.basePricePerHour}
                      <span className="text-[10px] font-normal text-neutral-500">/hr</span>
                    </div>
                    <div className="text-[10px] font-bold text-amber-700 flex items-center justify-end gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{turf.rating}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="p-2.5 bg-neutral-50 border-t border-neutral-100 text-center">
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="text-xs font-bold text-[var(--color-field)] hover:underline inline-flex items-center gap-1"
            >
              <span>View All Results in Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TRENDING SEARCH CHIPS */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-1 text-xs">
        <span className="font-bold text-[var(--color-forest)] flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
          <span>Trending:</span>
        </span>
        {TRENDING_AREAS.map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => handleChipClick(area)}
            className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-white border border-[var(--color-card-border)] hover:border-[var(--color-field)] text-[var(--color-forest)] font-semibold text-[11px] shadow-2xs transition-all cursor-pointer"
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}
