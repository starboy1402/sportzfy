"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Users,
  MapPin,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface ActionCard {
  type: "TURF" | "MATCH";
  id: string;
  title: string;
  subtitle: string;
  area: string;
  city: string;
  badge?: string;
  price?: number;
  openSpots?: number;
  matchTime?: string;
  coverImage?: string;
  actionUrl: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actionCards?: ActionCard[];
  timestamp: string;
}

const INITIAL_PROMPTS = [
  "⚽ 7v7 Turfs in Chattogram",
  "🧤 Squads seeking a Goalkeeper",
  "💰 Off-peak discount rates",
  "⏱️ How does 5-min Hold work?",
];

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Assalamu Alaikum! ⚽ I'm your **Sportzfy AI Concierge**. I can find available turf slots, recommend open squads needing your position, or explain dynamic rates. What are you looking for today?",
      timestamp: "Just now",
    },
  ]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(INITIAL_PROMPTS);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const json = await res.json();

      if (json.data) {
        const botReply: Message = {
          id: `bot_${Date.now()}`,
          role: "assistant",
          content: json.data.reply,
          actionCards: json.data.actionCards,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botReply]);
        if (json.data.suggestedPrompts?.length > 0) {
          setSuggestedPrompts(json.data.suggestedPrompts);
        }
      } else {
        throw new Error("No response");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I had trouble reaching the database right now. Please try asking again!",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome_reset",
        role: "assistant",
        content:
          "Conversation cleared! ⚽ How can I help you with pitches, matches, or booking rules?",
        timestamp: "Just now",
      },
    ]);
    setSuggestedPrompts(INITIAL_PROMPTS);
  };

  return (
    <>
      {/* FLOATING LAUNCHER BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Sportzfy AI Concierge"
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[var(--color-forest)] via-[#064e3b] to-[var(--color-field)] text-white font-bold text-sm shadow-xl shadow-emerald-950/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/40"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-emerald-300 fill-emerald-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span>Sportzfy AI</span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white tracking-wider">
              Live
            </span>
          </button>
        )}
      </div>

      {/* CHAT DRAWER / WINDOW */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[85vh] bg-white rounded-3xl shadow-2xl border border-[var(--color-card-border)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[var(--color-forest)] via-[#0d2a1f] to-[var(--color-forest-dark)] text-white p-4 flex items-center justify-between border-b border-emerald-900/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--color-field)] to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-base tracking-wide uppercase">
                    Sportzfy AI Concierge
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-emerald-200/80 font-medium">
                  Live Slot & Matchmaking Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Clear conversation"
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                } space-y-1.5`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 px-1 font-medium">
                  {m.role === "assistant" ? (
                    <>
                      <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                      <span>Sportzfy AI</span>
                    </>
                  ) : (
                    <span>You</span>
                  )}
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[var(--color-forest)] text-white rounded-br-xs font-medium shadow-xs"
                      : "bg-white text-neutral-800 rounded-bl-xs border border-neutral-200/80 shadow-xs"
                  }`}
                >
                  {m.content}
                </div>

                {/* ACTION CARDS (IF ANY) */}
                {m.actionCards && m.actionCards.length > 0 && (
                  <div className="w-full space-y-2.5 pt-1 max-w-[94%]">
                    {m.actionCards.map((card) => (
                      <div
                        key={card.id}
                        className="bg-white rounded-2xl p-3 border border-emerald-200/70 shadow-xs hover:border-emerald-500 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-start gap-2.5">
                          {card.coverImage && (
                            <img
                              src={card.coverImage}
                              alt={card.title}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-neutral-100"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-neutral-900 truncate text-xs">
                                {card.title}
                              </h4>
                              {card.badge && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold shrink-0">
                                  {card.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                              {card.subtitle}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-neutral-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-600" />
                                {card.area}
                              </span>
                              {card.price && (
                                <span className="text-[var(--color-forest)] font-bold">
                                  ৳{card.price}/hr
                                </span>
                              )}
                              {card.matchTime && (
                                <span className="text-amber-700 flex items-center gap-0.5 font-bold">
                                  <Calendar className="w-3 h-3" />
                                  {card.matchTime}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Link
                          href={card.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="w-full py-1.5 px-3 rounded-xl bg-[var(--color-mint)] hover:bg-[var(--color-field)] hover:text-white text-[var(--color-forest)] font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>{card.type === "TURF" ? "View Slot Timetable" : "View Squad Roster"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs py-2 px-1">
                <div className="w-7 h-7 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-emerald-600">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-2xl border border-neutral-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTED PROMPTS CHIPS */}
          {suggestedPrompts.length > 0 && !loading && (
            <div className="px-3 py-2 bg-white border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-[var(--color-mint)] hover:text-[var(--color-forest)] text-neutral-600 font-semibold text-[10px] transition-colors shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-neutral-200/80 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything... e.g. '7v7 turf in Halishahar'"
              disabled={loading}
              className="flex-1 bg-neutral-100/80 text-neutral-900 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-[var(--color-forest)] text-white hover:bg-[var(--color-field)] transition-colors disabled:opacity-40 disabled:hover:bg-[var(--color-forest)] shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

