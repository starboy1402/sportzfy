"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Shield,
  User,
  Briefcase,
  Sliders,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  KeyRound,
  Zap,
} from "lucide-react";

type RoleType = "CUSTOMER" | "OWNER" | "ADMIN";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRoleParam = searchParams.get("role");
  const redirectParam = searchParams.get("redirect") || "/";
  const isUnauthorized = searchParams.get("unauthorized") === "true";

  const [activeRole, setActiveRole] = useState<RoleType>(
    initialRoleParam === "admin"
      ? "ADMIN"
      : initialRoleParam === "owner"
      ? "OWNER"
      : "CUSTOMER"
  );

  const [email, setEmail] = useState("player@sportzfy.com");
  const [password, setPassword] = useState("sportzfy123");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    isUnauthorized ? "You must be signed in with the appropriate role to access that area." : null
  );

  // Sync role tabs with presets
  function handleRoleSwitch(role: RoleType) {
    setActiveRole(role);
    setErrorMessage(null);
    if (role === "CUSTOMER") {
      setEmail("player@sportzfy.com");
      setPassword("sportzfy123");
    } else if (role === "OWNER") {
      setEmail("owner@sportzfy.com");
      setPassword("sportzfy123");
    } else if (role === "ADMIN") {
      setEmail("admin@sportzfy.com");
      setPassword("sportzfy123");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          requestedRole: activeRole,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error?.message || "Invalid login credentials.");
        return;
      }

      // Success! Route based on role or redirect parameter
      const userRole = json.data.user.role;
      if (redirectParam && redirectParam !== "/") {
        router.push(redirectParam);
      } else if (userRole === "ADMIN") {
        router.push("/admin");
      } else if (userRole === "OWNER") {
        router.push("/owner");
      } else {
        router.push("/");
      }

      // Trigger a soft refresh to update Navbar
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error while authenticating.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-8 sm:pt-12 w-full space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-forest)] flex items-center justify-center text-white mx-auto shadow-md">
          <Shield className="w-7 h-7 text-[var(--color-field)] fill-[var(--color-field)]" />
        </div>
        <h1 className="font-display text-4xl font-bold text-[var(--color-forest)] uppercase tracking-wider">
          SIGN IN TO SPORTZ<span className="text-[var(--color-field)]">FY</span>
        </h1>
        <p className="text-xs text-[var(--color-ink-muted)]">
          Select your portal to manage turfs, book matches, or govern platform operations.
        </p>
      </div>

      {/* Role Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white border border-[var(--color-card-border)] shadow-xs">
        <button
          type="button"
          onClick={() => handleRoleSwitch("CUSTOMER")}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeRole === "CUSTOMER"
              ? "bg-[var(--color-field)] text-white shadow-xs"
              : "text-[var(--color-forest)] hover:bg-[var(--color-mint)]"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Player</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleSwitch("OWNER")}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeRole === "OWNER"
              ? "bg-[var(--color-forest)] text-white shadow-xs"
              : "text-[var(--color-forest)] hover:bg-[var(--color-mint)]"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Turf Owner</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleSwitch("ADMIN")}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeRole === "ADMIN"
              ? "bg-purple-700 text-white shadow-xs"
              : "text-purple-800 hover:bg-purple-50"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
            Email Address:
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-semibold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[var(--color-forest)]">
              Password:
            </label>
            <span className="text-[10px] text-[var(--color-ink-muted)]">Demo: sportzfy123</span>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-mono text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-press w-full py-3.5 rounded-2xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        >
          <span>{loading ? "Authenticating..." : `Sign In as ${activeRole}`}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* 1-Click Fast Switch Demo Buttons */}
        <div className="pt-4 border-t border-[var(--color-card-border)] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] block text-center">
            ⚡ 1-Click Evaluator Demo Sign-In
          </span>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleRoleSwitch("CUSTOMER")}
              className="p-2 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)] font-bold text-[var(--color-forest)] hover:border-[var(--color-field)] text-center cursor-pointer"
            >
              ⚽ Player
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch("OWNER")}
              className="p-2 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)] font-bold text-[var(--color-forest)] hover:border-[var(--color-field)] text-center cursor-pointer"
            >
              🏟️ Owner
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch("ADMIN")}
              className="p-2 rounded-xl bg-purple-50 border border-purple-200 font-bold text-purple-800 hover:border-purple-400 text-center cursor-pointer"
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </form>

      {/* Footer Register Link */}
      <div className="text-center text-xs text-[var(--color-ink-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-[var(--color-field)] hover:underline">
          Create New Player or Owner Profile →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-20">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-[var(--color-forest)]">Loading Auth Portal...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>
    </div>
  );
}
