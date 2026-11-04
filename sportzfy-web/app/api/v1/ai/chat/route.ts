import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export interface ChatActionCard {
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

interface AiAnalysis {
  reply: string;
  intent: "TURF_SEARCH" | "MATCH_SEARCH" | "PRICING" | "FAQ" | "GREETING";
  filters?: {
    city?: string;
    area?: string;
    format?: string;
    maxPrice?: number;
    role?: string;
  };
  suggestedPrompts?: string[];
}

const SYSTEM_INSTRUCTION = `You are the AI Concierge for Sportzfy, Bangladesh's Premier Sports Turf & Community Marketplace.
Your job is to assist players and turf owners with friendliness, expertise, and precision. You understand English and Bangla/Banglish fluently.

Platform Knowledge:
- 5-Minute Slot Hold Lock: Clicking an available pitch timetable slot locks it for 5 minutes via atomic database transactions, preventing double-booking or hijacking while paying.
- Match Recruitment: Squads post open spots specifying sport format and required role (Goalkeeper, Striker, Midfielder, Defender) and split costs.
- Dynamic Pricing: Random Forest ML predicts slot demand. Strict safety clamps keep prices between 0.80x (off-peak discounts down to 1200 BDT) and 1.30x (weekend/floodlight peaks up to 1800 BDT).
- Verified Turf Locations: Venues across Chattogram (Halishahar, Khulshi, Panchlaish, Agrabad, Patenga, Nasirabad, Raozan), Dhaka (Dhanmondi, Banani, Mirpur, Gulshan, Uttara), and Sylhet (Upashahar).
- Instant Checkout: bKash, Nagad, and local cards with digital QR pass generation.

Output MUST strictly be valid JSON matching this schema:
{
  "reply": "Warm, markdown-formatted conversational answer. If the user spoke in Banglish, reply warmly in friendly Banglish or English.",
  "intent": "TURF_SEARCH" | "MATCH_SEARCH" | "PRICING" | "FAQ" | "GREETING",
  "filters": {
    "city": "Chattogram" | "Dhaka" | "Sylhet" (optional),
    "area": string (optional),
    "format": "5v5" | "6v6" | "7v7" (optional),
    "maxPrice": number (optional),
    "role": "Goalkeeper" | "Striker" | "Midfielder" | "Defender" (optional)
  },
  "suggestedPrompts": ["Short suggested follow-up 1", "Short suggested follow-up 2", "Short suggested follow-up 3"]
}`;

/**
 * ⚡ Groq LPU Engine (~500ms ultra-low latency)
 */
async function analyzeWithGroq(
  userQuery: string,
  history: Array<{ role: string; content: string }>,
  apiKey: string,
): Promise<AiAnalysis | null> {
  try {
    const messages = [
      { role: "system", content: SYSTEM_INSTRUCTION },
      ...history.slice(-3).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: userQuery },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey} `,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 600,
      }),
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn("Groq API returned non-200 status:", res.status);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as AiAnalysis;
  } catch (err) {
    console.warn("Groq call bypassed, falling back to secondary:", err);
    return null;
  }
}

/**
 * 🧠 Google Gemini Engine (~1.5s fallback)
 */
async function analyzeWithGemini(
  userQuery: string,
  history: Array<{ role: string; content: string }>,
  apiKey: string,
): Promise<AiAnalysis | null> {
  try {
    const contents = [
      ...history.slice(-3).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      {
        role: "user",
        parts: [{ text: userQuery }],
      },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          generationConfig: {
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("Gemini API returned non-200 status:", response.status);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    return JSON.parse(text) as AiAnalysis;
  } catch (err) {
    console.warn(
      "Gemini API call bypassed, falling back to local NLU engine:",
      err,
    );
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let activeProvider: "GROQ_LPU" | "GEMINI_FLASH" | "LOCAL_FALLBACK" =
    "LOCAL_FALLBACK";

  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const messages = body.messages || [];
    const lastUserMessage =
      messages.filter((m: { role: string }) => m.role === "user").pop()
        ?.content || "";

    const queryLower = lastUserMessage.toLowerCase().trim();

    // Fetch user preferences if authenticated
    let userCity = "Chattogram";
    let userRole = "Goalkeeper";
    if (currentUser) {
      const profile = await prisma.profile.findUnique({
        where: { userId: currentUser.id },
      });
      if (profile?.preferredCity) userCity = profile.preferredCity;
      if (profile?.favoritePosition) userRole = profile.favoritePosition;
    }

    // 1. Try Groq LPU Engine (Primary Ultra-Fast ~500ms)
    let aiAnalysis: AiAnalysis | null = null;
    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (groqKey) {
      aiAnalysis = await analyzeWithGroq(
        lastUserMessage,
        messages.slice(0, -1),
        groqKey,
      );
      if (aiAnalysis) activeProvider = "GROQ_LPU";
    }

    // 2. Try Gemini Engine (Secondary Fallback ~1.5s)
    if (!aiAnalysis) {
      const geminiKey = process.env.GEMINI_API_KEY?.trim();
      if (geminiKey) {
        aiAnalysis = await analyzeWithGemini(
          lastUserMessage,
          messages.slice(0, -1),
          geminiKey,
        );
        if (aiAnalysis) activeProvider = "GEMINI_FLASH";
      }
    }

    const durationMs = Date.now() - startTime;
    console.log(
      `[AI Concierge] Provider: ${activeProvider} | Latency: ${durationMs}ms | Query: "${lastUserMessage.slice(0, 45)}"`,
    );

    // If an AI engine (Groq or Gemini) successfully analyzed the request:
    if (aiAnalysis) {
      const actionCards: ChatActionCard[] = [];

      // Normalize city
      let targetCity: string | undefined = aiAnalysis.filters?.city;
      if (targetCity) {
        const lower = targetCity.toLowerCase();
        if (lower.includes("dhaka")) targetCity = "Dhaka";
        else if (lower.includes("sylhet")) targetCity = "Sylhet";
        else if (lower.includes("chattogram") || lower.includes("chittagong"))
          targetCity = "Chattogram";
      }

      // Normalize format
      let targetFormat: string | undefined = aiAnalysis.filters?.format;
      if (targetFormat) {
        if (targetFormat.includes("5")) targetFormat = "5v5";
        else if (targetFormat.includes("6")) targetFormat = "6v6";
        else if (targetFormat.includes("7")) targetFormat = "7v7";
      }

      // Normalize role
      let targetRole: string | undefined = aiAnalysis.filters?.role;
      if (targetRole) {
        const lower = targetRole.toLowerCase();
        if (
          lower.includes("keep") ||
          lower.includes("gk") ||
          lower.includes("goal")
        )
          targetRole = "Goalkeeper";
        else if (
          lower.includes("strik") ||
          lower.includes("attack") ||
          lower.includes("forward")
        )
          targetRole = "Striker";
        else if (lower.includes("mid")) targetRole = "Midfielder";
        else if (lower.includes("def")) targetRole = "Defender";
      }

      if (aiAnalysis.intent === "TURF_SEARCH") {
        const where: Record<string, unknown> = { status: "APPROVED" };
        if (targetCity) where.city = targetCity;
        else where.city = userCity;

        if (aiAnalysis.filters?.area) {
          where.area = {
            contains: aiAnalysis.filters.area,
            mode: "insensitive",
          };
        }
        if (targetFormat) {
          where.pitchFormats = { contains: targetFormat, mode: "insensitive" };
        }
        if (aiAnalysis.filters?.maxPrice) {
          where.basePricePerHour = { lte: aiAnalysis.filters.maxPrice };
        }

        const turfs = await prisma.turf.findMany({
          where,
          take: 3,
          orderBy: { rating: "desc" },
        });

        for (const t of turfs) {
          actionCards.push({
            type: "TURF",
            id: t.id,
            title: t.name,
            subtitle: `${t.pitchFormats} • ★ ${t.rating}`,
            area: t.area,
            city: t.city,
            badge: `${t.pitchFormats.split(",")[0].trim()} Floodlit`,
            price: t.basePricePerHour,
            coverImage: t.coverImage,
            actionUrl: `/turfs/${t.id}`,
          });
        }

        return NextResponse.json({
          data: {
            reply: aiAnalysis.reply,
            actionCards,
            suggestedPrompts: aiAnalysis.suggestedPrompts || [
              "⚽ Show available 5v5 slots",
              "💰 When are the cheapest rates?",
              "🧤 Find open squad matches",
            ],
            telemetry: {
              provider: activeProvider,
              latencyMs: Date.now() - startTime,
            },
          },
        });
      }

      if (aiAnalysis.intent === "MATCH_SEARCH") {
        const where: Record<string, unknown> = {
          status: "OPEN",
          openSpots: { gt: 0 },
        };
        if (targetRole) where.requiredRole = { in: [targetRole, "Any"] };
        if (targetFormat) where.sportFormat = targetFormat;
        if (aiAnalysis.filters?.area) {
          where.area = {
            contains: aiAnalysis.filters.area,
            mode: "insensitive",
          };
        }

        const matches = await prisma.matchPost.findMany({
          where,
          take: 3,
          include: {
            turf: {
              select: { name: true, area: true, city: true, coverImage: true },
            },
            hostUser: { select: { name: true, phone: true } },
          },
          orderBy: { matchTime: "asc" },
        });

        for (const m of matches) {
          actionCards.push({
            type: "MATCH",
            id: m.id,
            title: m.title,
            subtitle: `Host: ${m.hostUser.name} • ${m.turf.name}`,
            area: m.area,
            city: m.turf.city,
            badge: `${m.openSpots} spots left • Role: ${m.requiredRole}`,
            price: m.costPerPlayer,
            matchTime: new Date(m.matchTime).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
            coverImage: m.turf.coverImage,
            actionUrl: `/matches`,
          });
        }

        return NextResponse.json({
          data: {
            reply: aiAnalysis.reply,
            actionCards,
            suggestedPrompts: aiAnalysis.suggestedPrompts || [
              "⚽ Show all turfs",
              "🧤 Squads looking for a Goalkeeper",
              "💰 How does payment splitting work?",
            ],
            telemetry: {
              provider: activeProvider,
              latencyMs: Date.now() - startTime,
            },
          },
        });
      }

      // For FAQ, PRICING, or GREETING
      return NextResponse.json({
        data: {
          reply: aiAnalysis.reply,
          actionCards: [],
          suggestedPrompts: aiAnalysis.suggestedPrompts || [
            "⚽ Search available turfs",
            "🧤 Find open squad matches",
            "⏱️ How does the 5-min Hold work?",
          ],
          telemetry: {
            provider: activeProvider,
            latencyMs: Date.now() - startTime,
          },
        },
      });
    }

    // ==========================================
    // ZERO-KEY DETERMINISTIC LOCAL NLU FALLBACK
    // ==========================================

    // 1. Entity Extraction
    let detectedCity: string | undefined;
    if (queryLower.includes("dhaka")) detectedCity = "Dhaka";
    else if (
      queryLower.includes("chattogram") ||
      queryLower.includes("chittagong")
    )
      detectedCity = "Chattogram";
    else if (queryLower.includes("sylhet")) detectedCity = "Sylhet";

    const areas = [
      "halishahar",
      "khulshi",
      "dhanmondi",
      "agrabad",
      "nasirabad",
      "bayezid",
      "panchlaish",
      "patenga",
      "banani",
      "mirpur",
      "gulshan",
      "uttara",
      "mohammadpur",
      "chandgaon",
      "gec",
      "raozan",
    ];
    const detectedArea = areas.find((a) => queryLower.includes(a));

    let detectedFormat: string | undefined;
    if (
      queryLower.includes("5v5") ||
      queryLower.includes("5-a-side") ||
      queryLower.includes("5 a side")
    )
      detectedFormat = "5v5";
    else if (queryLower.includes("6v6") || queryLower.includes("6-a-side"))
      detectedFormat = "6v6";
    else if (queryLower.includes("7v7") || queryLower.includes("7-a-side"))
      detectedFormat = "7v7";

    const priceMatch = queryLower.match(
      /(?:under|below|less than|max|budget|within|upto|up to)\s*(?:৳|bdt)?\s*(\d{3,4})/i,
    );
    const detectedMaxPrice = priceMatch
      ? parseInt(priceMatch[1], 10)
      : undefined;

    let detectedRole: string | undefined;
    if (
      queryLower.includes("goalkeeper") ||
      queryLower.includes("keeper") ||
      queryLower.includes("gk") ||
      queryLower.includes("goalie")
    )
      detectedRole = "Goalkeeper";
    else if (
      queryLower.includes("striker") ||
      queryLower.includes("forward") ||
      queryLower.includes("attacker")
    )
      detectedRole = "Striker";
    else if (
      queryLower.includes("midfielder") ||
      queryLower.includes("midfield")
    )
      detectedRole = "Midfielder";
    else if (queryLower.includes("defender") || queryLower.includes("defense"))
      detectedRole = "Defender";

    // 2. Intent Classification
    const isGreeting =
      /^(hi|hello|hey|assalamu alaikum|salam|hola|good morning|good evening)/i.test(
        queryLower,
      ) && queryLower.split(" ").length <= 4;

    const isMatchIntent =
      queryLower.includes("match") ||
      queryLower.includes("squad") ||
      queryLower.includes("team") ||
      queryLower.includes("roster") ||
      queryLower.includes("player") ||
      queryLower.includes("join") ||
      (detectedRole !== undefined &&
        !queryLower.includes("turf") &&
        !queryLower.includes("book"));

    const isPricingIntent =
      (queryLower.includes("rate") ||
        queryLower.includes("price") ||
        queryLower.includes("pricing") ||
        queryLower.includes("surge") ||
        queryLower.includes("offpeak") ||
        queryLower.includes("off-peak") ||
        queryLower.includes("discount") ||
        queryLower.includes("cheap")) &&
      !isMatchIntent &&
      !detectedArea &&
      !detectedMaxPrice;

    const isHoldFaqIntent =
      queryLower.includes("hold") ||
      queryLower.includes("5 min") ||
      queryLower.includes("5-min") ||
      queryLower.includes("timer") ||
      queryLower.includes("lock") ||
      queryLower.includes("refund") ||
      queryLower.includes("cancel") ||
      queryLower.includes("bkash") ||
      queryLower.includes("payment");

    const actionCards: ChatActionCard[] = [];
    let replyText = "";
    let suggestedPrompts: string[] = [];

    // 3. Execution & Synthesis
    if (isGreeting) {
      const userName = currentUser ? currentUser.name.split(" ")[0] : "Player";
      replyText = `Assalamu Alaikum, **${userName}**! ⚽ I'm your **Sportzfy AI Concierge**. I can find available turf slots, recommend open squads needing your position, or explain dynamic rates. What are you looking for today?`;
      suggestedPrompts = [
        "⚽ Find 7v7 turfs in Chattogram",
        "🧤 Squads looking for a Goalkeeper",
        "💰 When are the cheapest rates?",
        "⏱️ How does the 5-min Hold work?",
      ];
    } else if (isMatchIntent) {
      const where: Record<string, unknown> = {
        status: "OPEN",
        openSpots: { gt: 0 },
      };

      if (detectedRole) where.requiredRole = { in: [detectedRole, "Any"] };
      if (detectedFormat) where.sportFormat = detectedFormat;
      if (detectedArea)
        where.area = { contains: detectedArea, mode: "insensitive" };

      const matches = await prisma.matchPost.findMany({
        where,
        take: 3,
        include: {
          turf: {
            select: { name: true, area: true, city: true, coverImage: true },
          },
          hostUser: { select: { name: true, phone: true } },
        },
        orderBy: { matchTime: "asc" },
      });

      if (matches.length > 0) {
        replyText = `I found **${matches.length} open squad${matches.length > 1 ? "s" : ""}** looking for players${
          detectedRole ? ` (specifically seeking a **${detectedRole}**)` : ""
        }${detectedArea ? ` around **${detectedArea.toUpperCase()}**` : ""}! You can join any roster below:`;

        for (const m of matches) {
          actionCards.push({
            type: "MATCH",
            id: m.id,
            title: m.title,
            subtitle: `Host: ${m.hostUser.name} • ${m.turf.name}`,
            area: m.area,
            city: m.turf.city,
            badge: `${m.openSpots} spots left • Role: ${m.requiredRole}`,
            price: m.costPerPlayer,
            matchTime: new Date(m.matchTime).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
            coverImage: m.turf.coverImage,
            actionUrl: `/matches`,
          });
        }

        suggestedPrompts = [
          "⚽ Show turfs with open slots",
          "🧤 Find more goalkeeper squads",
          "💰 How much does it cost to join?",
        ];
      } else {
        replyText = `I couldn't find any open squads matching those exact filters right now. However, you can browse all open matches or create your own recruitment post after booking a pitch!`;
        suggestedPrompts = [
          "📋 View all open matches",
          "⚽ Book a pitch and host a match",
          "🧤 Find any squads needing players",
        ];
      }
    } else if (isPricingIntent) {
      replyText = `💡 **Smart Pricing Insights from our Random Forest Engine:**
- **Weekend Prime-Time (Fri & Sat • 8 PM – 11 PM)**: Highest demand floodlit slots surge by **+15% to +20%** (up to ৳1,800/hr).
- **Weekday Off-Peak (Sun – Thu • 2 PM – 5 PM)**: Save money with off-peak rates starting as low as **৳1,200/hr** (-20% discount).
- **Safety Clamps**: Sportzfy guarantees prices are strictly capped between **0.80x and 1.30x** base rate so prices never spike unfairly.`;

      suggestedPrompts = [
        "⚽ Find 7v7 turfs under ৳1500",
        "📍 Turfs in Halishahar",
        "📍 Turfs in Dhanmondi",
      ];
    } else if (isHoldFaqIntent) {
      replyText = `🛡️ **Sportzfy Platform Guarantees & Booking Rules:**
1. **5-Minute Slot Hold Lock**: When you click a slot, it is reserved exclusively for your account for **5 minutes**. No other player can hijack or book that slot while you pay.
2. **bKash & Nagad Checkout**: Payments are confirmed instantly. You receive a booking reference code and SMS/email confirmation.
3. **Cancellations & Rescheduling**: Cancellations requested >24 hours prior receive full refund credits.
4. **Owner Disbursements**: Venue owners receive payouts directly to bKash/Nagad within 2–6 hours of request.`;

      suggestedPrompts = [
        "⚽ Search available turfs",
        "🧤 Find open squad matches",
        "💰 When are the cheapest rates?",
      ];
    } else {
      const where: Record<string, unknown> = { status: "APPROVED" };

      if (detectedCity) where.city = detectedCity;
      if (detectedArea)
        where.area = { contains: detectedArea, mode: "insensitive" };
      if (detectedFormat)
        where.pitchFormats = { contains: detectedFormat, mode: "insensitive" };
      if (detectedMaxPrice) where.basePricePerHour = { lte: detectedMaxPrice };

      if (
        !detectedCity &&
        !detectedArea &&
        !detectedFormat &&
        !detectedMaxPrice
      ) {
        where.city = userCity;
      }

      const turfs = await prisma.turf.findMany({
        where,
        take: 3,
        orderBy: { rating: "desc" },
      });

      if (turfs.length > 0) {
        const filtersSummary: string[] = [];
        if (detectedFormat) filtersSummary.push(`format **${detectedFormat}**`);
        if (detectedArea)
          filtersSummary.push(`in **${detectedArea.toUpperCase()}**`);
        if (detectedCity) filtersSummary.push(`in **${detectedCity}**`);
        if (detectedMaxPrice)
          filtersSummary.push(`under **৳${detectedMaxPrice}**`);

        replyText = `Found **${turfs.length} verified venue${turfs.length > 1 ? "s" : ""}**${
          filtersSummary.length > 0
            ? " matching " + filtersSummary.join(", ")
            : ` in **${userCity}**`
        }! Click any venue card below to inspect timetable and hold a slot:`;

        for (const t of turfs) {
          actionCards.push({
            type: "TURF",
            id: t.id,
            title: t.name,
            subtitle: `${t.pitchFormats} • ★ ${t.rating}`,
            area: t.area,
            city: t.city,
            badge: `${t.pitchFormats.split(",")[0].trim()} Floodlit`,
            price: t.basePricePerHour,
            coverImage: t.coverImage,
            actionUrl: `/turfs/${t.id}`,
          });
        }

        suggestedPrompts = [
          "🧤 Are there open matches at these turfs?",
          "💰 Show me off-peak weekday discounts",
          "⚽ Show 5v5 turfs instead",
        ];
      } else {
        replyText = `No venues found matching those exact filters. Try relaxing your price limit or changing the area!`;
        suggestedPrompts = [
          "⚽ Show all turfs in Chattogram",
          "⚽ Show all turfs in Dhaka",
          "🧤 Find open squad matches",
        ];
      }
    }

    return NextResponse.json({
      data: {
        reply: replyText,
        actionCards,
        suggestedPrompts,
        telemetry: {
          provider: activeProvider,
          latencyMs: Date.now() - startTime,
        },
      },
    });
  } catch (error) {
    console.error("Error in AI chat route:", error);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to process chat message.",
        },
      },
      { status: 500 },
    );
  }
}
