import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { useMotionReduced } from "@/hooks/use-motion-preference";
import { isMotionReduced } from "@/lib/motion-preference";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative isolate overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium leading-none cursor-pointer transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out will-change-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-soft),var(--shadow-hairline)] hover:bg-primary/92 hover:shadow-[var(--shadow-glow)] hover:-translate-y-px",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--shadow-soft)] hover:bg-destructive/90 hover:-translate-y-px",
        outline:
          "border border-border bg-card/60 text-foreground shadow-[var(--shadow-xs)] backdrop-blur-sm hover:bg-secondary hover:border-primary/35 hover:-translate-y-px",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--shadow-xs)] hover:bg-secondary/75 hover:-translate-y-px",
        ghost: "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 px-6 text-[0.9375rem]",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Disable the magnetic cursor pull (ripple + glow stay on). */
  magnetic?: boolean;
}

function spawnRipple(event: React.PointerEvent<HTMLElement>) {
  const host = event.currentTarget;
  if (typeof window === "undefined") return;
  if (isMotionReduced()) return;
  const rect = host.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.setAttribute("aria-hidden", "true");
  ripple.style.cssText = `position:absolute;left:${event.clientX - rect.left - size / 2}px;top:${
    event.clientY - rect.top - size / 2
  }px;width:${size}px;height:${size}px;border-radius:9999px;background:currentColor;opacity:0.28;pointer-events:none;transform:scale(0);animation:fx-ripple 620ms cubic-bezier(0.22,1,0.36,1) forwards;z-index:-1;`;
  host.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 640);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, magnetic = true, onPointerDown, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const reducedMotion = useMotionReduced();
    const innerRef = React.useRef<HTMLButtonElement | null>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLButtonElement);

    React.useEffect(() => {
      const el = innerRef.current;
      if (!el || !magnetic || reducedMotion) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;

      // Listeners stay scoped to the element: a global pointermove per button
      // would force a layout read for every button on the page on every move.
      let raf = 0;
      let rect: DOMRect | null = null;
      let pressed = false;
      // Cap the pull so the button can never slide out from under the cursor —
      // an escaping box swallows the click (pointerup lands off-target).
      const MAX = 6;
      const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v));
      const onEnter = () => {
        rect = el.getBoundingClientRect();
      };
      const onMove = (e: PointerEvent) => {
        if (pressed) return;
        if (!rect) rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.translate = `${clamp(dx * 0.18)}px ${clamp(dy * 0.18)}px`;
        });
      };
      const reset = () => {
        cancelAnimationFrame(raf);
        rect = null;
        pressed = false;
        el.style.translate = "0px 0px";
      };
      // Freeze (and recentre) on press so the pointerup always hits the button.
      const onDown = () => {
        pressed = true;
        cancelAnimationFrame(raf);
        el.style.translate = "0px 0px";
      };
      const onUp = () => {
        pressed = false;
      };
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointerleave", reset);
      return () => {
        cancelAnimationFrame(raf);
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointerleave", reset);
      };

    }, [magnetic, reducedMotion]);

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={innerRef}
        onPointerDown={(e: React.PointerEvent<HTMLButtonElement>) => {
          spawnRipple(e);
          onPointerDown?.(e);
        }}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
