"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Shield,
  MapPin,
  Search,
  User,
  Menu,
  X,
  Trophy,
  Briefcase,
  Sliders,
  ChevronRight,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Chattogram");

  const isOwnerView = pathname.startsWith("/owner");
  const isAdminView = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-paper)]/95 backdrop-blur-md border-b border-[var(--color-card-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-forest)] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-[var(--color-field)] fill-[var(--color-field)]" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl sm:text-3xl tracking-wider text-[var(--color-forest)] leading-none">
                  SPORTZ<span className="text-[var(--color-field)]">FY</span>
                </span>
                <span className="text-[10px] tracking-widest font-semibold uppercase text-[var(--color-ink-muted)]">
                  {isAdminView
                    ? "Platform Governance"
                    : isOwnerView
                    ? "Owner Workspace"
                    : "Turf Marketplace"}
                </span>
              </div>
            </Link>

            {/* City Selector Pill (for Player View) */}
            {!isOwnerView && !isAdminView && (
              <div className="hidden md:flex items-center gap-1.5 ml-4 px-3 py-1.5 rounded-full bg-[var(--color-mint)] border border-[var(--color-card-border)] text-xs font-semibold text-[var(--color-forest)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-field)]" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent font-medium cursor-pointer outline-none text-[var(--color-forest)] pr-1"
                >
                  <option value="Chattogram">Chattogram</option>
                  <option value="Dhaka">Dhaka</option>
                </select>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {isAdminView ? (
              <>
                <Link
                  href="/admin"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === "/admin"
                      ? "text-[var(--color-field)] font-bold"
                      : "text-[var(--color-forest)] hover:text-[var(--color-field)]"
                  }`}
                >
                  Listing Moderation & KPIs
                </Link>
                <Link
                  href="/owner"
                  className="text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-forest)] transition-colors"
                >
                  Owner Workspace 🏟️
                </Link>
                <Link
                  href="/"
                  className="text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-forest)] transition-colors"
                >
                  Player View ⚽
                </Link>
              </>
            ) : isOwnerView ? (
              <>
                <Link
                  href="/owner"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === "/owner"
                      ? "text-[var(--color-field)] font-bold"
                      : "text-[var(--color-forest)] hover:text-[var(--color-field)]"
                  }`}
                >
                  Venue Overview
                </Link>
                <Link
                  href="/owner/schedule"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === "/owner/schedule"
                      ? "text-[var(--color-field)] font-bold"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]"
                  }`}
                >
                  Slot Locker & Walk-ins
                </Link>
                <Link
                  href="/owner/turfs/new"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === "/owner/turfs/new"
                      ? "text-[var(--color-field)] font-bold"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]"
                  }`}
                >
                  + Add New Turf
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-sm font-semibold text-[var(--color-forest)] hover:text-[var(--color-field)] transition-colors"
                >
                  Explore Turfs
                </Link>
                <Link
                  href="/matches"
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    pathname === "/matches"
                      ? "text-[var(--color-field)] font-bold"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-forest)]"
                  }`}
                >
                  <Trophy className="w-4 h-4 text-[var(--color-accent)]" />
                  Open Matches
                </Link>
                <Link
                  href="/bookings"
                  className="text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-forest)] transition-colors"
                >
                  My Bookings
                </Link>
              </>
            )}
          </nav>

          {/* Right Action: Role Switcher Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Admin Link */}
            <Link
              href="/admin"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-xs ${
                isAdminView
                  ? "bg-purple-700 text-white border-purple-800"
                  : "bg-white text-purple-700 border-purple-200 hover:border-purple-400"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Admin 🛡️</span>
            </Link>

            {/* Direct Switcher between Player and Owner views */}
            <Link
              href={isOwnerView ? "/" : "/owner"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs ${
                isOwnerView
                  ? "bg-[var(--color-forest)] text-white border-[var(--color-forest)]"
                  : "bg-white text-[var(--color-forest)] border-[var(--color-card-border)] hover:border-[var(--color-field)]"
              }`}
            >
              {isOwnerView ? (
                <span>Switch to Player ⚽</span>
              ) : (
                <>
                  <Briefcase className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>Owner Portal 🏟️</span>
                </>
              )}
            </Link>

            {/* User Pill */}
            <Link
              href={isAdminView ? "/admin" : isOwnerView ? "/owner" : "/bookings"}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[var(--color-mint)] border border-[var(--color-card-border)] shadow-xs"
            >
              <div className="w-7 h-7 rounded-full bg-[var(--color-forest)] flex items-center justify-center text-white font-bold text-xs">
                {isAdminView ? "AD" : isOwnerView ? "TI" : "SA"}
              </div>
              <span className="text-xs font-bold text-[var(--color-forest)]">
                {isAdminView ? "Admin (CUET)" : isOwnerView ? "Eco Sports" : "Sakib Alif"}
              </span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/admin"
              className="px-2 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800"
            >
              Admin
            </Link>
            <Link
              href={isOwnerView ? "/" : "/owner"}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--color-mint)] text-[var(--color-forest)] border border-[var(--color-card-border)]"
            >
              {isOwnerView ? "Player" : "Owner"}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--color-forest)] hover:bg-[var(--color-mint)] transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--color-paper)] border-b border-[var(--color-card-border)] px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-bold text-purple-700"
          >
            Admin Governance Portal 🛡️
          </Link>
          <Link
            href="/owner"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-forest)]"
          >
            Turf Owner Workspace 🏟️
          </Link>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-forest)]"
          >
            Explore Turfs (Player) ⚽
          </Link>
          <Link
            href="/matches"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-ink-muted)]"
          >
            Open Matches & Squad Hub
          </Link>
          <Link
            href="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-ink-muted)]"
          >
            My Booked Passes
          </Link>
        </div>
      )}
    </header>
  );
}
