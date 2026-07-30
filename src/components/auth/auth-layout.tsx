import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ChefHat, Quote, UtensilsCrossed, Coffee, Soup, Croissant } from "lucide-react";
import { AccentCanvas } from "@/components/three/accent-canvas";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="aurora relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card/40 p-12 lg:flex">
        {/* large ambient glow behind the brand mark */}
        <div className="pointer-events-none absolute -left-24 -top-24 size-[28rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-12 right-12 size-96 rounded-full bg-chart-2/10 blur-[100px]" />

        <Link to="/" className="group relative z-10 flex items-center gap-3">
          <span className="relative grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_0_40px_-8px_var(--primary)] transition-shadow duration-500 group-hover:shadow-[0_0_60px_-6px_var(--primary)]">
            <ChefHat className="size-7" strokeWidth={2} />
          </span>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">CanteenOS</span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Smart Campus Dining
            </span>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md"
        >
          {/* floating food icon cluster */}
          <div className="mb-8 flex items-center gap-3">
            {[
              { icon: Soup, delay: 0 },
              { icon: UtensilsCrossed, delay: 0.15 },
              { icon: Coffee, delay: 0.3 },
              { icon: Croissant, delay: 0.45 },
            ].map(({ icon: Icon, delay }) => (
              <motion.span
                key={Icon.displayName}
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4 + delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="grid size-10 place-items-center rounded-xl border border-border bg-background/60 backdrop-blur-md"
              >
                <Icon className="size-5 text-primary" />
              </motion.span>
            ))}
          </div>

          <Quote className="size-8 text-primary" />
          <p className="mt-6 text-2xl font-semibold leading-snug tracking-tight">
            Lunch rush queues went from 22 minutes to under 7. The kanban board alone changed how
            our kitchen works.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Dr. Sunita Rao — Dean of Student Affairs, VIT Vellore
          </p>
        </motion.div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { v: "180k+", l: "Meals / month" },
            { v: "42", l: "Campuses" },
            { v: "4.8", l: "Avg. rating" },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-2xl font-bold text-primary">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        {/* subtle 3D accent filling the panel's negative space */}
        <AccentCanvas
          variant="orbit"
          className="pointer-events-none absolute -right-10 top-1/4 hidden size-72 opacity-70 xl:block"
        />
      </div>


      <main className="relative flex items-center justify-center overflow-hidden px-4 py-12 sm:px-8">
        {/* subtle 3D accents in the negative space around the form */}
        <AccentCanvas
          variant="orbit"
          className="pointer-events-none absolute -right-6 -top-6 size-40 opacity-25 sm:size-48"
        />


        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-primary/5 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ChefHat className="size-5" />
            </span>
            <span className="text-base font-semibold">CanteenOS</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
        </motion.div>
      </main>


    </div>
  );
}
