"use client";

import Link from "next/link";
import { useState } from "react";
import { Shield, MapPin, Search, User, Menu, X, Trophy } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Chattogram");

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
                  Turf Marketplace
                </span>
              </div>
            </Link>

            {/* City Selector Pill */}
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
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-semibold text-[var(--color-forest)] hover:text-[var(--color-field)] transition-colors"
            >
              Explore Turfs
            </Link>
            <Link
              href="/#matches"
              className="text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-forest)] transition-colors flex items-center gap-1.5"
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
          </nav>

          {/* Right Action / Profile */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/bookings"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-[var(--color-card-border)] shadow-xs hover:border-[var(--color-field)] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[var(--color-mint)] flex items-center justify-center text-[var(--color-forest)] font-bold text-xs">
                SA
              </div>
              <span className="text-xs font-bold text-[var(--color-forest)]">
                Sakib Alif
              </span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
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
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-forest)]"
          >
            Explore Turfs
          </Link>
          <Link
            href="/#matches"
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
          <div className="pt-2 border-t border-[var(--color-card-border)] flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-ink-muted)]">Signed in as:</span>
            <span className="text-xs font-bold text-[var(--color-forest)]">Sakib Alif (Player)</span>
          </div>
        </div>
      )}
    </header>
  );
}
