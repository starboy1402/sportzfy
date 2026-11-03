"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Trophy,
  Calendar,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Sparkles,
  ArrowLeft,
  Camera,
  ExternalLink,
  Briefcase,
} from "lucide-react";

interface UserProfileData {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: "CUSTOMER" | "OWNER" | "ADMIN";
  avatarUrl?: string | null;
  createdAt: string;
  profile?: {
    bio?: string | null;
    preferredFormat?: string | null;
    favoritePosition?: string | null;
    preferredCity?: string | null;
  } | null;
  _count?: {
    bookings: number;
    matchPosts: number;
    reviews: number;
    turfs: number;
  };
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
];

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserProfileData | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [preferredFormat, setPreferredFormat] = useState("7v7");
  const [favoritePosition, setFavoritePosition] = useState("Striker");
  const [preferredCity, setPreferredCity] = useState("Chattogram");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load current user profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/user/profile");
        const json = await res.json();

        if (!res.ok || !json.data) {
          if (res.status === 401) {
            router.push("/login?redirect=/profile");
            return;
          }
          setStatusMessage({
            type: "error",
            text: json.error?.message || "Failed to load profile details.",
          });
          return;
        }

        const u = json.data;
        setUserData(u);
        setName(u.name || "");
        setPhone(u.phone || "");
        setAvatarUrl(u.avatarUrl || "");
        setBio(u.profile?.bio || "");
        setPreferredFormat(u.profile?.preferredFormat || "7v7");
        setFavoritePosition(u.profile?.favoritePosition || "Striker");
        setPreferredCity(u.profile?.preferredCity || "Chattogram");
      } catch (err) {
        console.error(err);
        setStatusMessage({
          type: "error",
          text: "Network error loading profile.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/v1/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          avatarUrl,
          bio,
          preferredFormat,
          favoritePosition,
          preferredCity,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatusMessage({
          type: "error",
          text: json.error?.message || "Failed to update profile.",
        });
        return;
      }

      setStatusMessage({
        type: "success",
        text: "Your profile information has been saved successfully!",
      });

      if (json.data?.user) {
        setUserData((prev) => (prev ? { ...prev, ...json.data.user } : null));
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "Network error saving profile changes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-forest)] hover:text-[var(--color-field)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>

          {userData?.role === "OWNER" && (
            <Link
              href="/owner"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-field)] hover:underline"
            >
              <Briefcase className="w-4 h-4" />
              <span>Go to Owner Workspace</span>
            </Link>
          )}

          {userData?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:underline"
            >
              <Shield className="w-4 h-4" />
              <span>Go to Admin Console</span>
            </Link>
          )}
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-start gap-3 border text-sm font-medium transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>{statusMessage.text}</div>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-16 rounded-3xl border border-[var(--color-card-border)] flex flex-col items-center justify-center gap-3 text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-field)]" />
            <span className="text-sm font-semibold">Loading profile information...</span>
          </div>
        ) : userData ? (
          <div className="space-y-6">
            {/* PROFILE OVERVIEW HERO CARD */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar with Live Preview */}
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-[var(--color-mint)] border-2 border-emerald-200 flex items-center justify-center text-3xl font-black text-[var(--color-forest)] shadow-sm">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span>{name ? name.slice(0, 2).toUpperCase() : "SP"}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider border-2 border-white shadow-xs">
                    Online
                  </span>
                </div>

                {/* Identity & Metadata */}
                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h1 className="font-display text-2xl sm:text-3xl font-black text-[var(--color-forest)] tracking-tight">
                      {name || "User Profile"}
                    </h1>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider w-fit mx-auto sm:mx-0 ${
                        userData.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : userData.role === "OWNER"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {userData.role === "CUSTOMER" ? "Player Member" : userData.role}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 flex items-center justify-center sm:justify-start gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{userData.email}</span>
                    <span className="text-emerald-600 font-bold ml-1">✓ Verified</span>
                  </p>

                  <p className="text-xs text-neutral-400">
                    Member since{" "}
                    {new Date(userData.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Activity Stats Pill */}
                <div className="grid grid-cols-2 gap-3 w-full sm:w-auto text-center">
                  <div className="p-3 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)]">
                    <div className="font-display font-black text-xl text-[var(--color-forest)]">
                      {userData._count?.bookings || 0}
                    </div>
                    <div className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                      Bookings
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-card-border)]">
                    <div className="font-display font-black text-xl text-[var(--color-field)]">
                      {favoritePosition || "Striker"}
                    </div>
                    <div className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                      Position
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PROFILE EDIT FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PERSONAL INFORMATION */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-[var(--color-card-border)] pb-3">
                  <User className="w-5 h-5 text-[var(--color-forest)]" />
                  <h2 className="text-base font-bold text-[var(--color-forest)]">
                    Personal Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sakib Alif"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                      Phone Number (WhatsApp / Contact)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+880 1712-345678"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Email (Readonly) */}
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Email Address (Account Identifier)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={userData.email}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-neutral-100 text-neutral-500 font-medium text-sm cursor-not-allowed"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Email is linked to your booking receipts and verified session. Contact support for email changes.
                  </p>
                </div>
              </div>

              {/* AVATAR & PHOTO CUSTOMIZATION */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[var(--color-card-border)] pb-3">
                  <Camera className="w-5 h-5 text-[var(--color-forest)]" />
                  <h2 className="text-base font-bold text-[var(--color-forest)]">
                    Profile Avatar
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                    Custom Photo URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                  />
                </div>

                {/* Quick Avatar Presets */}
                <div>
                  <span className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Or select a player avatar:
                  </span>
                  <div className="flex items-center gap-3">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setAvatarUrl(preset)}
                        className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                          avatarUrl === preset
                            ? "border-[var(--color-field)] scale-105 shadow-xs"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={preset}
                          alt="Preset"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ATHLETIC & MATCH PREFERENCES */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-[var(--color-card-border)] pb-3">
                  <Trophy className="w-5 h-5 text-[var(--color-field)]" />
                  <h2 className="text-base font-bold text-[var(--color-forest)]">
                    Player Specs & Match Preferences
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Primary City */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                      Primary City
                    </label>
                    <select
                      value={preferredCity}
                      onChange={(e) => setPreferredCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                    >
                      <option value="Chattogram">Chattogram</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Sylhet">Sylhet</option>
                    </select>
                  </div>

                  {/* Preferred Pitch Format */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                      Preferred Format
                    </label>
                    <select
                      value={preferredFormat}
                      onChange={(e) => setPreferredFormat(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                    >
                      <option value="5v5">5v5 (Fast Futsal)</option>
                      <option value="6v6">6v6 (Standard Turf)</option>
                      <option value="7v7">7v7 (Full Box Pitch)</option>
                      <option value="8v8">8v8 (Large Arena)</option>
                    </select>
                  </div>

                  {/* Favorite Position */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                      Favorite Position
                    </label>
                    <select
                      value={favoritePosition}
                      onChange={(e) => setFavoritePosition(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                    >
                      <option value="Striker">Striker (Forward)</option>
                      <option value="Winger">Winger</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Defender">Defender</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                    </select>
                  </div>
                </div>

                {/* Player Bio */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-forest)] uppercase tracking-wider mb-2">
                    Player Bio & Playing Experience
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Attacking forward playing in Chattogram 7v7 evening matches. Available for weekend tournaments."
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-forest)] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
                  />
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-press flex-1 py-4 rounded-xl bg-[var(--color-forest)] hover:bg-[var(--color-field)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </main>
    </div>
  );
}
