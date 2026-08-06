import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, CornerDownLeft, Mic, MicOff, Plus, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/format";
import { useMenuItems, useMyOrders } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import {
  AI_STARTERS,
  answerQuestion,
  askGrokAi,
  type AiChatMessage,
} from "@/lib/canteen-ai";
import type { MenuItem } from "@/types";
import { toast } from "sonner";
import { foodImage } from "@/lib/food-images";

function Bubble({
  msg,
  onAdd,
  onChip,
}: {
  msg: AiChatMessage;
  onAdd: (i: MenuItem) => void;
  onChip: (s: string) => void;
}) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex w-full gap-2.5", isUser && "justify-end")}
    >
      {!isUser ? (
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="size-3.5" />
        </span>
      ) : null}
      <div className={cn("max-w-[85%] space-y-2", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card/70 text-foreground backdrop-blur",
          )}
        >
          {msg.text.split("**").map((chunk, i) =>
            i % 2 ? (
              <strong key={i} className="font-semibold">
                {chunk}
              </strong>
            ) : (
              <span key={i}>{chunk}</span>
            ),
          )}
        </div>

        {msg.items?.length ? (
          <ul className="w-full space-y-2">
            {msg.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-2.5 shadow-[var(--shadow-xs)] transition-colors hover:border-primary/40 hover:bg-secondary/50"
              >
                <img
                  src={foodImage(item)}
                  alt={item.name}
                  loading="lazy"
                  width={72}
                  height={72}
                  className="size-9 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{item.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {inr(item.price)} · {item.prepTimeMins} min · {item.veg ? "Veg" : "Non-veg"}
                  </span>
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0 rounded-lg"
                  aria-label={`Add ${item.name} to cart`}
                  onClick={() => onAdd(item)}
                >
                  <Plus className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        {msg.chips?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {msg.chips.map((c) => (
              <button
                key={c}
                onClick={() => onChip(c)}
                className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {c}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function CanteenAiWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);

  const { data: items = [] } = useMenuItems();
  const { data: orders = [] } = useMyOrders();
  const { favorites, add } = useCart();
  const { profile } = useAuth();
  const firstName = (profile?.full_name ?? "").split(" ")[0];
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm **Canteen AI**. I can recommend high-protein gym picks 🥩, calculate your daily macros 📊, or take voice orders 🎙️!",
      chips: AI_STARTERS.slice(0, 3),
    },
  ]);

  const ctx = useMemo(
    () => ({ items, orders, favorites, name: firstName || undefined }),
    [items, orders, favorites, firstName],
  );

  useEffect(() => {
    const el = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking, open]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || thinking) return;
    const userMsg: AiChatMessage = { id: `u_${Date.now()}`, role: "user", text: clean };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setThinking(true);

    // Auto-detect voice order commands e.g. "add paneer" or "order chai"
    const matchedItem = items.find((i) =>
      clean.toLowerCase().includes(i.name.toLowerCase()),
    );
    if (/add|order|buy|want/i.test(clean) && matchedItem) {
      add(matchedItem.id, 1);
      toast.success(`Voice Order: ${matchedItem.name} added to cart! 🛒`);
    }

    try {
      const response = await askGrokAi(clean, ctx, nextHistory);
      setMessages((m) => [...m, response]);
    } catch {
      setMessages((m) => [...m, answerQuestion(clean, ctx)]);
    } finally {
      setThinking(false);
    }
  }

  const recognitionRef = useRef<any>(null);

  function startVoiceRecognition() {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice ordering requires Chrome, Edge, Safari, or Brave.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      let finalTranscript = "";

      recognition.onstart = () => {
        setListening(true);
        toast.info("Listening... Speak your order! 🎙️");
      };

      recognition.onresult = (e: any) => {
        let currentText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const text = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript += text;
          } else {
            currentText += text;
          }
        }
        const textToDisplay = finalTranscript || currentText;
        if (textToDisplay) {
          setInput(textToDisplay);
        }
      };

      recognition.onerror = (event: any) => {
        setListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast.error("Microphone blocked! Click 🔒 next to localhost:8080 in address bar to allow mic access.");
        } else if (event.error === "no-speech") {
          toast.info("No speech heard. Click mic and try speaking your order!");
        } else if (event.error !== "aborted") {
          toast.error("Could not catch voice. Please try speaking again!");
        }
      };

      recognition.onend = () => {
        setListening(false);
        if (finalTranscript.trim()) {
          send(finalTranscript.trim());
        }
      };

      recognition.start();
    } catch (err) {
      setListening(false);
      toast.error("Could not start microphone. Check browser permissions!");
    }
  }

  function handleAdd(item: MenuItem) {
    add(item.id, 1);
    toast.success(`${item.name} added to cart`);
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Canteen AI" : "Open Canteen AI assistant"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 z-40 grid size-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ width: 52, height: 52 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "bot"}
            initial={{ opacity: 0, rotate: -40, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 40, scale: 0.7 }}
            transition={{ duration: 0.16 }}
          >
            {open ? <X className="size-5" /> : <Bot className="size-5" />}
          </motion.span>
        </AnimatePresence>
        {!open ? (
          <span className="absolute -right-0.5 -top-0.5 size-3 animate-pulse rounded-full bg-accent" />
        ) : null}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.aside
            role="dialog"
            aria-label="Canteen AI assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-40 flex h-[min(560px,75vh)] w-[min(384px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-border bg-background/90 shadow-2xl backdrop-blur-xl"
          >
            <header className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Canteen AI</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Picks · protein & gym macros · voice ordering 🎙️
                </p>
              </div>
              <Badge variant="outline" className="rounded-full text-[10px]">
                Grok AI
              </Badge>
            </header>

            <ScrollArea className="flex-1" ref={scrollRef}>
              <div className="space-y-4 p-4">
                {messages.map((m) => (
                  <Bubble key={m.id} msg={m} onAdd={handleAdd} onChip={send} />
                ))}
                {thinking ? (
                  <div className="flex items-center gap-2 pl-9 text-xs text-muted-foreground">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                    <span>Canteen AI is thinking…</span>
                  </div>
                ) : null}
              </div>
            </ScrollArea>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? "Listening..." : "Ask or speak to order..."}
                aria-label="Message Canteen AI"
                className="rounded-xl"
                autoFocus
              />

              <Button
                type="button"
                variant={listening ? "default" : "outline"}
                size="icon"
                className="shrink-0 rounded-xl"
                aria-label="Voice command"
                onClick={startVoiceRecognition}
              >
                {listening ? <Mic className="size-4 animate-bounce text-red-500" /> : <Mic className="size-4" />}
              </Button>

              <Button
                type="submit"
                size="icon"
                className="shrink-0 rounded-xl"
                aria-label="Send message"
              >
                <CornerDownLeft className="size-4" />
              </Button>
            </form>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
