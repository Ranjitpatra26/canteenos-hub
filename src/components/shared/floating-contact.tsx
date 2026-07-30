import { Link, useRouterState } from "@tanstack/react-router";
import { Headphones } from "lucide-react";
import { motion } from "motion/react";

export function FloatingContactSymbol() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Do not display inside contact or checkout pages to avoid redundancy
  if (pathname === "/contact" || pathname === "/checkout-plan") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-5 left-5 z-50 select-none"
    >
      <Link
        to="/contact"
        aria-label="Contact & IT Support Hub"
        title="Contact & IT Support Hub"
        className="group relative grid size-11 place-items-center rounded-full border border-primary/40 bg-background/80 text-primary shadow-[0_0_20px_-3px_rgba(132,204,22,0.25)] backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_30px_0px_rgba(132,204,22,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {/* Subtle Ambient Pulse Halo */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 blur-md opacity-60 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

        {/* Active Status Pulse Dot */}
        <span className="absolute top-0 right-0 flex size-3 -translate-y-0.5 translate-x-0.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-3 rounded-full bg-primary border-2 border-background" />
        </span>

        {/* Headphones Symbol */}
        <Headphones className="relative z-10 size-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
      </Link>
    </motion.div>
  );
}
