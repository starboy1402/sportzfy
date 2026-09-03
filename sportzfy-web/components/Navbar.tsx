"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "OWNER" | "ADMIN";
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Chattogram");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const isOwnerView = pathname.startsWith("/owner");
  const isAdminView = pathname.startsWith("/admin");

  // Fetch logged in session
  async function checkSession() {
    try {
      const res = await fetch("/api/v1/auth/me");
      const json = await res.json();
      if (json.data?.user) {
        setCurrentUser(json.data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    checkSession();
  }, [pathname]);

  // Handle Logout
  async function handleLogout() {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      setCurrentUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

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

            {/* City Selector Pill */}
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

          {/* Right Action: Auth & Role Profile */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Quick Role Link */}
            {currentUser?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-700 text-white border border-purple-800 shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Admin Console 🛡️</span>
              </Link>
            ) : currentUser?.role === "OWNER" ? (
              <Link
                href="/owner"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--color-forest)] text-white border border-[var(--color-forest)] shadow-xs"
              >
                <Briefcase className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Owner Portal 🏟️</span>
              </Link>
            ) : (
              <Link
                href="/login?role=owner"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-[var(--color-forest)] border border-[var(--color-card-border)] hover:border-[var(--color-field)] shadow-xs"
              >
                <Briefcase className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Turf Owner?</span>
              </Link>
            )}

            {/* Auth Profile / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[var(--color-mint)] border border-[var(--color-card-border)] shadow-xs">
                <div className="w-7 h-7 rounded-full bg-[var(--color-forest)] flex items-center justify-center text-white font-bold text-xs">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--color-forest)] leading-none">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <span className="text-[9px] font-semibold text-[var(--color-field)] uppercase">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-lg text-[var(--color-ink-muted)] hover:text-red-600 hover:bg-white transition-colors ml-1 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="btn-press flex items-center gap-1 px-4 py-2 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="btn-press flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-[var(--color-card-border)] text-[var(--color-forest)] font-bold text-xs shadow-xs hover:border-[var(--color-field)]"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--color-forest)] text-white"
              >
                Sign In
              </Link>
            )}
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
          {currentUser && (
            <div className="p-3 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)] mb-2">
              <span className="text-xs font-bold text-[var(--color-forest)] block">{currentUser.name}</span>
              <span className="text-[10px] font-semibold text-[var(--color-field)] uppercase">{currentUser.role} ({currentUser.email})</span>
            </div>
          )}

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-forest)]"
          >
            Explore Turfs ⚽
          </Link>
          <Link
            href="/matches"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-forest)]"
          >
            Open Matches & Squad Hub 🏆
          </Link>
          <Link
            href="/bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-forest)]"
          >
            My Booked Passes 🎟️
          </Link>
          <Link
            href="/owner"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[var(--color-forest)] pt-2 border-t border-[var(--color-card-border)]"
          >
            Turf Owner Workspace 🏟️
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-bold text-purple-700"
          >
            Admin Governance Portal 🛡️
          </Link>
        </div>
      )}
    </header>
  );
}
