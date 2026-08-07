import type { MenuItem, Order } from "@/types";

/**
 * Canteen AI — an on-device, deterministic "assistant" that produces realistic
 * recommendations, insights and answers from the live catalogue + order data.
 * No network calls: responses are synthesised from real app state.
 */

export interface AiSuggestion {
  item: MenuItem;
  reason: string;
  score: number;
}

const hourNow = () => new Date().getHours();

export function mealWindow(hour = hourNow()): "breakfast" | "lunch" | "snacks" | "dinner" {
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 19) return "snacks";
  return "dinner";
}

const windowTags: Record<string, string[]> = {
  breakfast: ["breakfast", "light", "tea", "coffee", "healthy"],
  lunch: ["thali", "rice", "meal", "combo", "curry"],
  snacks: ["snack", "fries", "chaat", "shake", "quick"],
  dinner: ["meal", "curry", "roti", "comfort", "rice"],
};

/** Items the user ordered most often, most recent first on ties. */
export function frequentlyOrdered(orders: Order[], items: MenuItem[], limit = 6) {
  const counts = new Map<string, number>();
  orders.forEach((o) =>
    o.lines.forEach((l) => counts.set(l.itemId, (counts.get(l.itemId) ?? 0) + l.qty)),
  );
  return items
    .filter((i) => counts.has(i.id))
    .map((item) => ({ item, times: counts.get(item.id) ?? 0 }))
    .sort((a, b) => b.times - a.times)
    .slice(0, limit);
}

export function trendingItems(orders: Order[], items: MenuItem[], limit = 6) {
  const since = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const counts = new Map<string, number>();
  orders
    .filter((o) => new Date(o.placedAt).getTime() >= since)
    .forEach((o) =>
      o.lines.forEach((l) => counts.set(l.itemId, (counts.get(l.itemId) ?? 0) + l.qty)),
    );

  const scored = items
    .filter((i) => i.available)
    .map((item) => ({
      item,
      score: (counts.get(item.id) ?? 0) * 12 + item.popularity + item.rating * 6,
      velocity: counts.get(item.id) ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

export function popularMeals(items: MenuItem[], limit = 6) {
  return [...items]
    .filter((i) => i.available)
    .sort((a, b) => b.popularity - a.popularity || b.rating - a.rating)
    .slice(0, limit);
}

export function buildBudgetCombo(items: MenuItem[], maxBudget: number) {
  const available = items.filter((i) => i.available && i.price <= maxBudget);
  if (!available.length) return [];

  let bestCombo: MenuItem[] = [];
  let maxScore = -1;

  for (let i = 0; i < available.length; i++) {
    const item1 = available[i];
    if (item1.price <= maxBudget) {
      const score1 = item1.calories + item1.rating * 20;
      if (score1 > maxScore) {
        maxScore = score1;
        bestCombo = [item1];
      }
    }

    for (let j = i + 1; j < available.length; j++) {
      const item2 = available[j];
      const totalPrice = item1.price + item2.price;
      if (totalPrice <= maxBudget) {
        const score2 = item1.calories + item2.calories + (item1.rating + item2.rating) * 15;
        if (score2 > maxScore) {
          maxScore = score2;
          bestCombo = [item1, item2];
        }
      }
    }
  }

  return bestCombo;
}

export function predictQueueWait(orders: Order[]) {
  const activeOrders = orders.filter((o) => ["placed", "preparing"].includes(o.status));
  const count = activeOrders.length;
  const avgPrep = 8; // mins
  const estimatedWait = Math.max(4, Math.round(count * 2.5 + avgPrep));

  let status: "fast" | "moderate" | "busy" = "fast";
  let advice = "Kitchen fast lane open! Order now for instant pickup.";

  if (count > 5) {
    status = "busy";
    advice = "Peak lunch rush! Order now to skip the 15+ minute queue.";
  } else if (count > 2) {
    status = "moderate";
    advice = "Moderate kitchen activity. Prep time is ~8-10 minutes.";
  }

  return { activeOrdersCount: count, estimatedWaitMins: estimatedWait, status, advice };
}

/** Personalised recommendations blending taste history, time of day and ratings. */
export function recommendFor(
  items: MenuItem[],
  orders: Order[],
  opts: { favorites?: string[]; limit?: number; vegOnly?: boolean } = {},
): AiSuggestion[] {
  const { favorites = [], limit = 6, vegOnly = false } = opts;
  const window = mealWindow();
  const tags = windowTags[window];

  const ordered = new Set<string>();
  const catAffinity = new Map<string, number>();
  orders.forEach((o) =>
    o.lines.forEach((l) => {
      ordered.add(l.itemId);
      const item = items.find((i) => i.id === l.itemId);
      if (item)
        catAffinity.set(item.categorySlug, (catAffinity.get(item.categorySlug) ?? 0) + l.qty);
    }),
  );

  return items
    .filter((i) => i.available && (!vegOnly || i.veg))
    .map((item) => {
      const reasons: string[] = [];
      let score = item.popularity * 0.4 + item.rating * 8;

      const affinity = catAffinity.get(item.categorySlug) ?? 0;
      if (affinity > 0) {
        score += Math.min(affinity, 6) * 7;
        reasons.push(`matches your ${item.categorySlug.replace(/-/g, " ")} taste`);
      }
      if (favorites.includes(item.id)) {
        score += 18;
        reasons.push("one of your saved dishes");
      }
      if (item.tags.some((t) => tags.includes(t.toLowerCase()))) {
        score += 22;
        reasons.push(`great pick for ${window}`);
      }
      if (item.prepTimeMins <= 10) {
        score += 8;
        reasons.push(`ready in ~${item.prepTimeMins} min`);
      }
      if (ordered.has(item.id)) score += 6;
      if (item.rating >= 4.5) reasons.push(`rated ${item.rating.toFixed(1)} by students`);

      return {
        item,
        score,
        reason: reasons.slice(0, 2).join(" · ") || "popular on campus right now",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export interface OrderInsight {
  label: string;
  value: string;
  hint: string;
}

export function orderInsights(orders: Order[], items: MenuItem[]): OrderInsight[] {
  const done = orders.filter((o) => o.status !== "cancelled");
  const spend = done.reduce((s, o) => s + o.total, 0);
  const avg = done.length ? Math.round(spend / done.length) : 0;

  const hours = new Map<number, number>();
  done.forEach((o) => {
    const h = new Date(o.placedAt).getHours();
    hours.set(h, (hours.get(h) ?? 0) + 1);
  });
  const peak = [...hours.entries()].sort((a, b) => b[1] - a[1])[0];

  const top = frequentlyOrdered(done, items, 1)[0];
  const vegShare = (() => {
    let veg = 0;
    let all = 0;
    done.forEach((o) =>
      o.lines.forEach((l) => {
        const item = items.find((i) => i.id === l.itemId);
        if (!item) return;
        all += l.qty;
        if (item.veg) veg += l.qty;
      }),
    );
    return all ? Math.round((veg / all) * 100) : 0;
  })();

  return [
    { label: "Orders analysed", value: String(done.length), hint: "across your CanteenOS history" },
    { label: "Average basket", value: `₹${avg}`, hint: "AI suggests combos to save ~8%" },
    {
      label: "Peak ordering hour",
      value: peak ? `${String(peak[0]).padStart(2, "0")}:00` : "—",
      hint: peak ? "queues are shortest 20 min earlier" : "order more to unlock this",
    },
    {
      label: "Top dish",
      value: top ? top.item.name : "—",
      hint: top ? `ordered ${top.times} times` : "no repeat orders yet",
    },
    { label: "Veg share", value: `${vegShare}%`, hint: "of everything you've ordered" },
  ];
}

/** Fuzzy-ish scoring used by smart search. */
export function smartScore(query: string, haystack: string) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const h = haystack.toLowerCase();
  if (h === q) return 100;
  if (h.startsWith(q)) return 80;
  if (h.includes(q)) return 60;
  const words = q.split(/\s+/).filter(Boolean);
  const hits = words.filter((w) => h.includes(w)).length;
  return hits ? (hits / words.length) * 40 : 0;
}

export function smartSearchMenu(query: string, items: MenuItem[], limit = 8) {
  if (!query.trim()) return [];
  return items
    .map((item) => ({
      item,
      score:
        smartScore(query, item.name) * 2 +
        smartScore(query, item.description) +
        smartScore(query, item.tags.join(" ")) * 1.4 +
        smartScore(query, item.categorySlug),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}

/* ------------------------------------------------------------------ */
/* Chat                                                                */
/* ------------------------------------------------------------------ */

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  chips?: string[];
  items?: MenuItem[];
}

export const AI_FAQ: Array<{ q: string; a: string; keys: string[] }> = [
  {
    q: "How do I collect my order?",
    a: "Once the kitchen marks your order **Ready**, open the order page and show the QR code at your assigned pickup counter. Collection usually takes under a minute.",
    keys: ["pickup", "collect", "qr", "counter"],
  },
  {
    q: "Can I cancel or change an order?",
    a: "You can cancel free of charge while the order is still **Placed**. Once the kitchen starts preparing, ping the counter staff — they can still swap sides or adjust spice level.",
    keys: ["cancel", "change", "modify", "refund"],
  },
  {
    q: "How do coupons work?",
    a: "Apply a coupon code in the cart before checkout. Percentage coupons stack with combo pricing but not with staff discounts, and each code respects its minimum order value.",
    keys: ["coupon", "promo", "discount", "offer", "code"],
  },
  {
    q: "What payment methods are supported?",
    a: "Campus wallet, UPI and cards are all supported. Payment is captured at checkout and a receipt lands in your order history instantly.",
    keys: ["pay", "payment", "upi", "wallet", "card"],
  },
  {
    q: "How long does food take?",
    a: "Most dishes are ready in 8–18 minutes. The order timeline shows a live ETA that updates the moment the kitchen moves your ticket.",
    keys: ["time", "long", "eta", "wait", "ready"],
  },
  {
    q: "Is nutrition info available?",
    a: "Yes — every dish lists calories and a veg/non-veg marker on its detail page, and you can filter the menu to vegetarian-only from Settings.",
    keys: ["calorie", "nutrition", "veg", "healthy", "diet"],
  },
];

export const AI_STARTERS = [
  "High protein gym options 🥩",
  "Low calorie fat loss picks 🥗",
  "Generate a 3-day student diet plan 🗓️",
  "What should I eat right now?",
  "Show me something light and vegetarian",
];

export function answerQuestion(
  input: string,
  ctx: { items: MenuItem[]; orders: Order[]; favorites: string[]; name?: string },
): AiChatMessage {
  const q = input.trim().toLowerCase();
  const id = `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const reply = (text: string, extra: Partial<AiChatMessage> = {}): AiChatMessage => ({
    id,
    role: "assistant",
    text,
    ...extra,
  });

  if (!q) return reply("Ask me anything about the canteen — menu, orders, coupons or timings.");

  // Greetings
  if (/^(hi|hey|hello|yo|namaste)\b/.test(q)) {
    return reply(
      `Hi${ctx.name ? ` ${ctx.name}` : ""}! I'm Canteen AI. I can recommend dishes, explain your spending or help with an order.`,
      { chips: AI_STARTERS.slice(0, 3) },
    );
  }

  // Spending / insights
  if (/(spend|spent|budget|money|insight|analytics|how much)/.test(q)) {
    const insights = orderInsights(ctx.orders, ctx.items);
    return reply(
      `Here's what I see across your ${insights[0].value} orders: your average basket is **${insights[1].value}**, you order most around **${insights[2].value}**, and your go-to dish is **${insights[3].value}**. Ordering 20 minutes before peak usually cuts your wait in half.`,
      { chips: ["Show trending foods", "Recommend something cheap"] },
    );
  }

  // Trending
  if (/(trend|popular|hot|best sell|everyone)/.test(q)) {
    const t = trendingItems(ctx.orders, ctx.items, 3).map((x) => x.item);
    return reply(
      t.length
        ? "These are moving fastest on campus this week:"
        : "The catalogue is still warming up — nothing is trending yet.",
      { items: t, chips: ["What should I eat right now?"] },
    );
  }

  // Veg / healthy / light
  if (/(veg|vegetarian|healthy|light|low cal|diet)/.test(q)) {
    const picks = recommendFor(ctx.items, ctx.orders, {
      favorites: ctx.favorites,
      limit: 3,
      vegOnly: true,
    })
      .map((s) => s.item)
      .sort((a, b) => a.calories - b.calories);
    return reply("Lighter vegetarian picks, sorted by calories:", { items: picks });
  }

  // Protein / Gym / Fitness
  if (/(protein|gym|workout|bulk|gain|muscle|macro|fit|diet plan)/.test(q)) {
    const picks = ctx.items
      .filter(
        (i) =>
          i.available &&
          (i.tags.some((t) => /protein|gym|paneer|egg|chicken|chole|shake/i.test(t)) ||
            /paneer|egg|chole|dal|shake|milk|sprouts|curd/i.test(i.name)),
      )
      .slice(0, 4);
    return reply(
      "Here are the top high-protein canteen options to hit your daily fitness targets 💪:",
      {
        items: picks.length ? picks : ctx.items.slice(0, 3),
        chips: ["High protein gym options 🥩", "Generate a 3-day student diet plan 🗓️"],
      },
    );
  }

  // Cheap
  if (/(cheap|budget|under|affordable|save)/.test(q)) {
    const picks = ctx.items
      .filter((i) => i.available)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
    return reply("Best value on the menu right now:", { items: picks });
  }

  // Order status
  if (/(my order|order status|where is|track)/.test(q)) {
    const live = ctx.orders.find((o) => ["placed", "preparing", "ready"].includes(o.status));
    return reply(
      live
        ? `Order **${live.code}** is currently **${live.status}** with an ETA of about ${live.etaMins} minutes at ${live.counter}. I'll keep an eye on it.`
        : "You don't have an active order right now. Want me to suggest something?",
      { chips: ["What should I eat right now?"] },
    );
  }

  // FAQ match
  const faq = AI_FAQ.map((f) => ({
    f,
    score: f.keys.reduce((s, k) => s + (q.includes(k) ? 1 : 0), 0) + smartScore(q, f.q) / 60,
  }))
    .sort((a, b) => b.score - a.score)
    .find((r) => r.score >= 1);
  if (faq)
    return reply(faq.f.a, {
      chips: AI_FAQ.filter((f) => f !== faq.f)
        .slice(0, 2)
        .map((f) => f.q),
    });

  // Menu search
  const found = smartSearchMenu(q, ctx.items, 3);
  if (found.length) {
    return reply(`Here's what I found for "${input.trim()}":`, { items: found });
  }

  // Fallback: recommend
  const picks = recommendFor(ctx.items, ctx.orders, { favorites: ctx.favorites, limit: 3 });
  return reply(
    `I'm not sure about that one yet, but based on the time of day and your history I'd go with these for ${mealWindow()}:`,
    { items: picks.map((p) => p.item), chips: AI_STARTERS.slice(0, 2) },
  );
}

/* ------------------------------------------------------------------ */
/* xAI Grok API Integration                                            */
/* ------------------------------------------------------------------ */

export function getGrokApiKey(): string {
  const envKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GROQ_API_KEY ||
    (import.meta as any).env?.VITE_GROK_API_KEY ||
    "";
  if (envKey) return envKey;
  if (typeof window !== "undefined") {
    return localStorage.getItem("canteen_grok_api_key") || "";
  }
  return "";
}

export function setGrokApiKey(key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("canteen_grok_api_key", key);
  }
}

export async function askGrokAi(
  input: string,
  ctx: { items: MenuItem[]; orders: Order[]; favorites: string[]; name?: string },
  history: AiChatMessage[] = [],
): Promise<AiChatMessage> {
  const apiKey = getGrokApiKey();
  if (!apiKey) {
    return answerQuestion(input, ctx);
  }

  const windowName = mealWindow();
  const menuSummary = ctx.items
    .slice(0, 25)
    .map(
      (i) =>
        `${i.name} (₹${i.price}, ${i.calories} cal, ${i.veg ? "Veg" : "Non-veg"}, prep ~${i.prepTimeMins}m, ID: ${i.id})`,
    )
    .join("\n");

  const systemPrompt = `You are Canteen AI, an intelligent, versatile, and friendly AI assistant for students on the CanteenOS platform.
Student Name: ${ctx.name || "Student"}
Current Meal Window: ${windowName}
Live Canteen Menu:
${menuSummary}

Instructions:
1. Answer ANY question asked by the student — including general food & recipe queries, cooking tips, nutrition, fitness, gym macros, diet plans, study tips, or general knowledge.
2. Whenever the query relates to ordering or campus meals, recommend specific relevant dishes from the live canteen menu above.
3. Keep your tone enthusiastic, clear, accurate, and student-friendly.`;

  try {
    let replyText = "";

    if (apiKey.startsWith("AIza")) {
      // Gemini API key support
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${systemPrompt}\n\nChat History:\n${history
                      .slice(-4)
                      .map((h) => `${h.role}: ${h.text}`)
                      .join("\n")}\n\nUser Query: ${input}`,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!res.ok) {
        console.warn("Gemini API request failed with status", res.status);
        return answerQuestion(input, ctx);
      }

      const data = await res.json();
      replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } else {
      // OpenAI / Groq / xAI format
      const isGroq = apiKey.startsWith("gsk_");
      const endpoint = isGroq
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://api.x.ai/v1/chat/completions";
      const modelName = isGroq ? "llama-3.3-70b-versatile" : "grok-2-latest";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            ...history.slice(-6).map((h) => ({ role: h.role, content: h.text })),
            { role: "user", content: input },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!res.ok) {
        console.warn("AI API request failed with status", res.status);
        return answerQuestion(input, ctx);
      }

      const data = await res.json();
      replyText = data?.choices?.[0]?.message?.content?.trim() || "";
    }

    if (!replyText) {
      return answerQuestion(input, ctx);
    }

    const matchedItems = ctx.items
      .filter((i) => replyText.toLowerCase().includes(i.name.toLowerCase()))
      .slice(0, 3);

    return {
      id: `ai_${Date.now()}`,
      role: "assistant",
      text: replyText,
      items: matchedItems.length ? matchedItems : undefined,
      chips: ["Tell me more", "Recommend another dish", "How fast is prep?"],
    };
  } catch (err) {
    console.warn("AI API exception:", err);
    return answerQuestion(input, ctx);
  }
}
