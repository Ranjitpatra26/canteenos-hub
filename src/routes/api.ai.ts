import { createFileRoute } from "@tanstack/react-router";
import type { AiChatMessage } from "@/lib/canteen-ai";

export const Route = createFileRoute("/api/ai" as any)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { input, ctx, history = [], apiKey: clientApiKey } = body;

          const apiKey =
            clientApiKey ||
            process.env.VITE_GEMINI_API_KEY ||
            process.env.VITE_GROQ_API_KEY ||
            process.env.VITE_GROK_API_KEY ||
            process.env.GROQ_API_KEY ||
            "";

          if (!apiKey) {
            return new Response(JSON.stringify({ error: "No API key configured" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const windowName = ctx?.windowName || "lunch";
          const items = ctx?.items || [];
          const menuSummary = items
            .slice(0, 25)
            .map(
              (i: any) =>
                `${i.name} (₹${i.price}, ${i.calories} cal, ${i.veg ? "Veg" : "Non-veg"}, prep ~${i.prepTimeMins}m, ID: ${i.id})`,
            )
            .join("\n");

          const systemPrompt = `You are Canteen AI, an intelligent, versatile, and friendly AI assistant for students on the CanteenOS platform.
Student Name: ${ctx?.name || "Student"}
Current Meal Window: ${windowName}
Live Canteen Menu:
${menuSummary}

Instructions:
1. Answer ANY question asked by the student — including general food & recipe queries, cooking tips, nutrition, fitness, gym macros, diet plans, study tips, or general knowledge.
2. Whenever the query relates to ordering or campus meals, recommend specific relevant dishes from the live canteen menu above.
3. Keep your tone enthusiastic, clear, accurate, and student-friendly.`;

          let replyText = "";

          if (apiKey.startsWith("AIza")) {
            // Gemini API
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
                          text: `${systemPrompt}\n\nChat History:\n${(history as AiChatMessage[])
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
              const errText = await res.text();
              console.warn("Gemini API error:", res.status, errText);
              return new Response(JSON.stringify({ error: `Gemini API status ${res.status}` }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
              });
            }

            const data = await res.json();
            replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          } else {
            // OpenAI / Groq / xAI API
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
                  ...(history as AiChatMessage[]).slice(-6).map((h) => ({ role: h.role, content: h.text })),
                  { role: "user", content: input },
                ],
                temperature: 0.7,
                max_tokens: 500,
              }),
            });

            if (!res.ok) {
              const errText = await res.text();
              console.warn("Groq/xAI API error:", res.status, errText);
              return new Response(
                JSON.stringify({ error: `LLM API status ${res.status}` }),
                {
                  status: 500,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }

            const data = await res.json();
            replyText = data?.choices?.[0]?.message?.content?.trim() || "";
          }

          if (!replyText) {
            return new Response(JSON.stringify({ error: "Empty reply from LLM" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ text: replyText }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("API AI Route Error:", err);
          return new Response(JSON.stringify({ error: err.message || "Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
