import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared illustrated error/status screen used by 401, 403, 404, 500,
 * offline and maintenance pages. Pure presentation — no data access.
 */
export function ErrorScreen({
  code,
  title,
  description,
  illustration,
  actions,
  tone = "primary",
}: {
  code: string;
  title: string;
  description: string;
  illustration: ReactNode;
  actions?: ReactNode;
  tone?: "primary" | "accent" | "destructive";
}) {
  const ring =
    tone === "destructive"
      ? "from-destructive/30 via-destructive/5"
      : tone === "accent"
        ? "from-accent/30 via-accent/5"
        : "from-primary/30 via-primary/5";

  return (
    <main className="aurora relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial blur-3xl",
          "bg-gradient-to-br to-transparent",
          ring,
        )}
      />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg rounded-3xl border border-border bg-card/70 p-8 text-center shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto grid size-28 place-items-center"
        >
          {illustration}
        </motion.div>

        <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Error {code}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {actions ?? (
            <Button asChild className="rounded-xl">
              <Link to="/">Back to CanteenOS</Link>
            </Button>
          )}
        </div>
      </motion.div>
    </main>
  );
}

/** Simple animated SVG-ish illustration built from tokens + emoji glyphs. */
export function GlyphArt({ glyph, tone = "primary" }: { glyph: string; tone?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-28 place-items-center rounded-[2rem] border border-border text-5xl",
        tone === "destructive"
          ? "bg-destructive/10"
          : tone === "accent"
            ? "bg-accent/10"
            : "bg-primary/10",
      )}
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-[2rem] border border-primary/25"
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <span role="img" aria-hidden>
        {glyph}
      </span>
    </span>
  );
}
