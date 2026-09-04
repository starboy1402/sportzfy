"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Shield,
  User,
  Briefcase,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<"CUSTOMER" | "OWNER">("CUSTOMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error?.message || "Failed to register account.");
        return;
      }

      // Route based on newly created role
      if (role === "OWNER") {
        router.push("/owner");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error while creating account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-20">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-forest)] flex items-center justify-center text-white mx-auto shadow-md">
            <Shield className="w-7 h-7 text-[var(--color-field)] fill-[var(--color-field)]" />
          </div>
          <h1 className="font-display text-4xl font-bold text-[var(--color-forest)] uppercase tracking-wider">
            JOIN SPORTZ<span className="text-[var(--color-field)]">FY</span>
          </h1>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Create an account to book pitches across Bangladesh or register your sports venue.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              role === "CUSTOMER"
                ? "bg-white border-[var(--color-field)] ring-2 ring-[var(--color-field)]/20 shadow-xs"
                : "bg-[var(--color-paper)] border-[var(--color-card-border)] hover:bg-white"
            }`}
          >
            <User className={`w-5 h-5 mb-1.5 ${role === "CUSTOMER" ? "text-[var(--color-field)]" : "text-[var(--color-ink-muted)]"}`} />
            <span className="font-display text-lg font-bold text-[var(--color-forest)] block">
              Player / Captain
            </span>
            <span className="text-[11px] text-[var(--color-ink-muted)] block mt-0.5">
              Book slots, recruit squads & play
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole("OWNER")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              role === "OWNER"
                ? "bg-white border-[var(--color-field)] ring-2 ring-[var(--color-field)]/20 shadow-xs"
                : "bg-[var(--color-paper)] border-[var(--color-card-border)] hover:bg-white"
            }`}
          >
            <Briefcase className={`w-5 h-5 mb-1.5 ${role === "OWNER" ? "text-[var(--color-field)]" : "text-[var(--color-ink-muted)]"}`} />
            <span className="font-display text-lg font-bold text-[var(--color-forest)] block">
              Turf Venue Owner
            </span>
            <span className="text-[11px] text-[var(--color-ink-muted)] block mt-0.5">
              List turf, manage schedule & revenue
            </span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Full Name: *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mahmudul Hasan"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-semibold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Email Address: *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. mahmudul@example.com"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-semibold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Mobile Number:
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-semibold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Create Password: *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-mono text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-press w-full py-3.5 rounded-2xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{loading ? "Creating Account..." : `Register as ${role}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[var(--color-ink-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[var(--color-field)] hover:underline">
            Sign In here →
          </Link>
        </div>
      </div>
    </main>
  </div>
);
}
