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

  const redirectParam = searchParams.get("redirect") || "/";
  const emailParam = searchParams.get("email") || "";
  const isUnauthorized = searchParams.get("unauthorized") === "true";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    isUnauthorized ? "You must be signed in with the appropriate role to access that area." : null
  );
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Sync email param if URL changes
  useEffect(() => {
    if (emailParam && !email) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // One-click demo account filler for quick testing
  function handleFillDemo(demoEmail: string, demoLabel: string) {
    setEmail(demoEmail);
    setPassword("sportzfy123");
    setErrorMessage(null);
    setInfoMessage(`Filled demo credentials for ${demoLabel}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error?.message || "Invalid email or password.");
        return;
      }

      // Success! Route based on user role or redirect parameter
      const userRole = json.data.user.role;
      if (redirectParam && redirectParam !== "/" && redirectParam !== "/login") {
        router.push(redirectParam);
      } else if (userRole === "ADMIN") {
        router.push("/admin");
      } else if (userRole === "OWNER") {
        router.push("/owner");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error while authenticating. Please try again.");
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
          Access your player bookings, turf venue management, or platform operations.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Info Banner */}
      {infoMessage && (
        <div className="p-3 rounded-2xl bg-[var(--color-mint)] border border-[var(--color-field)]/30 text-[var(--color-forest)] text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-[var(--color-field)]" />
          <span>{infoMessage}</span>
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
            placeholder="e.g. yourname@example.com"
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-semibold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[var(--color-forest)]">
              Password:
            </label>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-mono text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-press w-full py-3.5 rounded-2xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
        >
          <span>{loading ? "Authenticating..." : "Sign In →"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* 1-Click Fast Switch Demo Buttons */}
        <div className="pt-4 border-t border-[var(--color-card-border)] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] block text-center">
            ⚡ Quick Demo Accounts (1-Click Fill)
          </span>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleFillDemo("player@sportzfy.com", "Demo Player (Sakib)")}
              className="p-2 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)] font-bold text-[var(--color-forest)] hover:border-[var(--color-field)] text-center cursor-pointer transition-all"
            >
              ⚽ Player
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("owner@sportzfy.com", "Demo Owner (Tariqul)")}
              className="p-2 rounded-xl bg-[var(--color-mint)] border border-[var(--color-card-border)] font-bold text-[var(--color-forest)] hover:border-[var(--color-field)] text-center cursor-pointer transition-all"
            >
              🏟️ Owner
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("admin@sportzfy.com", "Demo Admin")}
              className="p-2 rounded-xl bg-purple-50 border border-purple-200 font-bold text-purple-800 hover:border-purple-400 text-center cursor-pointer transition-all"
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
