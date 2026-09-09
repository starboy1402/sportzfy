"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  Tag,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Clock,
  Flame,
  ArrowRight,
} from "lucide-react";

interface TurfCardData {
  id: string;
  name: string;
  slug: string;
  city: string;
  area: string;
  address: string;
  coverImage: string;
  pitchFormats: string;
  basePricePerHour: number;
  currentDynamicPrice: number;
  priceMultiplier: number;
  pricingBadge: string;
  rating: number;
  reviewCount: number;
  totalBookings: number;
  distanceKm: number;
  distanceLabel: string;
  hasFloodlights: boolean;
  hasParking: boolean;
}

interface MatchPostData {
  id: string;
  title: string;
  description: string;
  sportFormat: string;
  matchTime: string;
  area: string;
  totalSpots: number;
  openSpots: number;
  costPerPlayer: number;
  turf: {
    name: string;
    slug: string;
    area: string;
    city: string;
    coverImage: string;
    basePricePerHour: number;
  };
  hostName: string;
}

interface ShelfData {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  turfs: TurfCardData[];
}

interface ShelvesApiResponse {
  success: boolean;
  meta: {
    referenceCoords: { lat: number; lng: number };
    totalVenuesFound: number;
  };
  shelves: ShelfData[];
  squadsShelf: {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    matches: MatchPostData[];
  };
}

export default function FoodpandaDiscoveryShelves() {
  const [data, setData] = useState<ShelvesApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationName, setLocationName] = useState("Chattogram (GEC Circle)");

  // Detect Geolocation
  const requestLocation = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          setLocationName("Your Current GPS Location");
          setLocating(false);
        },
        (err) => {
          console.warn("Geolocation permission declined or unavailable:", err.message);
          setLocating(false);
        },
        { timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    let url = "/api/v1/turfs/shelves";
    if (userLocation) {
      url += `?lat=${userLocation.lat}&lng=${userLocation.lng}`;
    }
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((resData: ShelvesApiResponse) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load discovery shelves:", err);
        setLoading(false);
      });
  }, [userLocation]);

  if (loading) {
    return (
      <div className="py-8 space-y-8 animate-pulse">
        <div className="h-8 bg-emerald-100/60 rounded-xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-emerald-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-12 py-6">
      {/* Geolocation & Discovery Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50 border border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Discovery Engine
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Live Dynamic Rates
              </span>
            </div>
            <p className="text-xs text-emerald-950 font-medium mt-0.5">
              Distances computed from <strong className="text-emerald-900">{locationName}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={requestLocation}
          disabled={locating}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-900 hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{locating ? "Locating..." : "Use My Exact Location"}</span>
        </button>
      </div>

      {/* RENDER SHELVES */}
      {data.shelves.map((shelf) => (
        <ShelfCarousel key={shelf.id} shelf={shelf} />
      ))}

      {/* SQUADS NEEDING PLAYERS SHELF */}
      {data.squadsShelf && data.squadsShelf.matches.length > 0 && (
        <SquadsShelf shelf={data.squadsShelf} />
      )}
    </div>
  );
}

function ShelfCarousel({ shelf }: { shelf: ShelfData }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const getShelfIcon = (iconName: string) => {
    switch (iconName) {
      case "MapPin":
        return <MapPin className="w-5 h-5 text-emerald-600" />;
      case "Tag":
        return <Tag className="w-5 h-5 text-amber-600" />;
      case "Star":
        return <Star className="w-5 h-5 text-amber-500 fill-amber-500" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-teal-600" />;
      default:
        return <Flame className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            {getShelfIcon(shelf.icon)}
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide text-emerald-950">
              {shelf.title}
            </h3>
            <p className="text-xs text-emerald-900/70">{shelf.subtitle}</p>
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="p-2 rounded-xl bg-white border border-emerald-100 text-emerald-900 hover:bg-emerald-50 transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="p-2 rounded-xl bg-white border border-emerald-100 text-emerald-900 hover:bg-emerald-50 transition-all cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {shelf.turfs.map((turf) => (
          <div
            key={turf.id}
            className="w-[280px] sm:w-[310px] shrink-0 snap-start bg-white rounded-2xl border border-emerald-100 hover:border-emerald-400 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
          >
            {/* Image Container */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <img
                src={turf.coverImage}
                alt={turf.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                {/* Distance Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-white shadow-xs">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {turf.distanceLabel}
                </span>

                {/* Rating Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-semibold text-emerald-950 shadow-xs">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {turf.rating.toFixed(1)}
                </span>
              </div>

              {/* Bottom Dynamic Pricing Pill */}
              <div className="absolute bottom-2 left-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                    turf.priceMultiplier < 1.0
                      ? "bg-emerald-600/90 text-white"
                      : turf.priceMultiplier > 1.0
                      ? "bg-amber-500/90 text-white"
                      : "bg-black/60 text-emerald-200"
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {turf.pricingBadge}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {turf.area}, {turf.city}
                </div>
                <h4 className="font-display text-lg sm:text-xl font-bold text-emerald-950 leading-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {turf.name}
                </h4>

                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {turf.pitchFormats.split(",").slice(0, 3).map((fmt) => (
                    <span
                      key={fmt.trim()}
                      className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100"
                    >
                      {fmt.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-3 border-t border-emerald-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-900/60 uppercase">Hourly Rate</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-emerald-950">
                      ৳{turf.currentDynamicPrice}
                    </span>
                    {turf.currentDynamicPrice !== turf.basePricePerHour && (
                      <span className="text-xs text-slate-400 line-through">
                        ৳{turf.basePricePerHour}
                      </span>
                    )}
                    <span className="text-xs text-emerald-900/60 font-medium">/ hr</span>
                  </div>
                </div>

                <Link
                  href={`/turfs/${turf.slug || turf.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                >
                  <span>Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SquadsShelf({ shelf }: { shelf: ShelvesApiResponse["squadsShelf"] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t border-emerald-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide text-emerald-950">
              {shelf.title}
            </h3>
            <p className="text-xs text-emerald-900/70">{shelf.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/matches"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mr-2"
          >
            <span>View All Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="p-2 rounded-xl bg-white border border-emerald-100 text-emerald-900 hover:bg-emerald-50 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="p-2 rounded-xl bg-white border border-emerald-100 text-emerald-900 hover:bg-emerald-50 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Match Cards Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {shelf.matches.map((match) => {
          const matchDate = new Date(match.matchTime);
          const dateLabel = matchDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          const timeLabel = matchDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          return (
            <div
              key={match.id}
              className="w-[290px] sm:w-[320px] shrink-0 snap-start bg-gradient-to-br from-white via-white to-amber-50/40 rounded-2xl border border-amber-200/80 hover:border-amber-400 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between p-4 space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                    <Flame className="w-3 h-3 text-amber-600" />
                    {match.openSpots} SPOTS OPEN
                  </span>

                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100">
                    {match.sportFormat}
                  </span>
                </div>

                <div>
                  <h4 className="font-display text-lg sm:text-xl font-bold text-emerald-950 leading-tight line-clamp-1">
                    {match.title}
                  </h4>
                  <div className="text-xs text-emerald-900/80 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{match.turf.name} • {match.area}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-emerald-900/70 pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{dateLabel}, {timeLabel}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-amber-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-900/60 uppercase">Split Cost</div>
                  <div className="text-base font-bold text-emerald-950">
                    ৳{match.costPerPlayer}{" "}
                    <span className="text-xs text-emerald-900/60 font-medium">/ player</span>
                  </div>
                </div>

                <Link
                  href={`/matches/${match.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                >
                  <span>Join Squad</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
