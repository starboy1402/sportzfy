"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Zap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface TurfOption {
  id: string;
  name: string;
  area: string;
  city: string;
}

export default function NewMatchPostPage() {
  const router = useRouter();

  const [turfs, setTurfs] = useState<TurfOption[]>([]);
  const [loadingTurfs, setLoadingTurfs] = useState(true);

  const [title, setTitle] = useState("Need 1 Goalkeeper for 7v7 Match Tonight!");
  const [selectedTurfId, setSelectedTurfId] = useState("");
  const [sportFormat, setSportFormat] = useState("7v7");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [matchTimeHour, setMatchTimeHour] = useState("20:00");
  const [requiredRole, setRequiredRole] = useState("Goalkeeper");
  const [totalSpots, setTotalSpots] = useState("14");
  const [openSpots, setOpenSpots] = useState("1");
  const [costPerPlayer, setCostPerPlayer] = useState("150");
  const [description, setDescription] = useState(
    "Casual competitive match under floodlights. Looking for a dependable player to complete our squad."
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadTurfs() {
      try {
        const res = await fetch("/api/v1/turfs");
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTurfs(json.data);
          setSelectedTurfId(json.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load turfs", err);
      } finally {
        setLoadingTurfs(false);
      }
    }
    loadTurfs();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTurfId) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const fullMatchDateTime = new Date(`${matchDate}T${matchTimeHour}:00`);

    try {
      const res = await fetch("/api/v1/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          turfId: selectedTurfId,
          sportFormat,
          matchTime: fullMatchDateTime.toISOString(),
          totalSpots: Number(totalSpots),
          openSpots: Number(openSpots),
          costPerPlayer: Number(costPerPlayer),
          requiredRole,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error?.message || "Failed to create match post.");
        return;
      }

      // Success! Redirect to Matches Feed
      router.push("/matches");
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error while creating match post.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-paper)] pb-24">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex-1 w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/matches"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-forest)] hover:text-[var(--color-field)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Open Matches</span>
        </Link>

        {/* Title */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-[var(--color-accent)]" />
            <span>Captain Recruitment Tool</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-[var(--color-forest)] uppercase leading-none">
            Post an Open Match or Challenge
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            Recruit missing players for your squad, or post an open challenge for opposing teams to split the turf bill.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-card-border)] shadow-xs space-y-6">
          {/* Post Title */}
          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Match / Challenge Headline: *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Need 1 Goalkeeper for 7v7 Match Tonight!"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-sm bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
            />
          </div>

          {/* Select Turf */}
          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Playing Venue: *
            </label>
            <select
              value={selectedTurfId}
              onChange={(e) => setSelectedTurfId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
            >
              {turfs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.area}, {t.city})
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
                Match Date:
              </label>
              <input
                type="date"
                required
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
                Kickoff Time:
              </label>
              <input
                type="time"
                required
                value={matchTimeHour}
                onChange={(e) => setMatchTimeHour(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              />
            </div>
          </div>

          {/* Role and Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
                Role Needed:
              </label>
              <select
                value={requiredRole}
                onChange={(e) => setRequiredRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              >
                <option value="Goalkeeper">🧤 Goalkeeper</option>
                <option value="Midfielder">🏃 Midfielder</option>
                <option value="Defender">🛡️ Defender</option>
                <option value="Striker">⚡ Striker</option>
                <option value="Any">⚽ Any Position / Solo Player</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
                Pitch Format:
              </label>
              <select
                value={sportFormat}
                onChange={(e) => setSportFormat(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              >
                <option value="7v7">7v7 Outdoor Pitch</option>
                <option value="6v6">6v6 Artificial Grass</option>
                <option value="5v5">5v5 Enclosed Futsal</option>
              </select>
            </div>
          </div>

          {/* Spots and Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
                Open Spots Available:
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={openSpots}
                onChange={(e) => setOpenSpots(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
                Split Cost Per Player (৳ BDT):
              </label>
              <input
                type="number"
                value={costPerPlayer}
                onChange={(e) => setCostPerPlayer(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-bold text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-[var(--color-forest)] block mb-1">
              Match Rules & Squad Details:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-card-border)] font-medium text-xs bg-[var(--color-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--color-field)]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-press w-full py-4 rounded-2xl bg-[var(--color-field)] hover:bg-[var(--color-field-hover)] text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? "Publishing Match..." : "Publish Open Match Challenge"}
          </button>
        </form>
      </main>
    </div>
  );
}
