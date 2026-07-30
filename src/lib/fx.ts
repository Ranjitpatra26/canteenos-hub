import confetti from "canvas-confetti";
import { isMotionReduced } from "@/lib/motion-preference";

const LIME = "#c8f24a";
const CYAN = "#6fe3e1";
const WHITE = "#ffffff";

function reduced() {
  return typeof window !== "undefined" && isMotionReduced();
}

/** Celebration burst used on successful checkout. */
export function celebrate() {
  if (reduced()) return;
  const colors = [LIME, CYAN, WHITE];
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors, scalar: 0.9 });
  setTimeout(
    () => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors }),
    180,
  );
  setTimeout(
    () => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors }),
    300,
  );
}

/** Small sparkle burst from a specific element (e.g. the cart button). */
export function sparkleFrom(el: HTMLElement | null) {
  if (reduced() || !el) return;
  const r = el.getBoundingClientRect();
  confetti({
    particleCount: 26,
    spread: 50,
    scalar: 0.6,
    startVelocity: 22,
    colors: [LIME, CYAN],
    origin: {
      x: (r.left + r.width / 2) / window.innerWidth,
      y: (r.top + r.height / 2) / window.innerHeight,
    },
  });
}

/**
 * Flying add-to-cart animation: clones a token from the source element and
 * arcs it toward the cart target (or the top-right of the viewport).
 */
export function flyToCart(source: HTMLElement | null, label: string) {
  if (typeof document === "undefined" || !source || reduced()) return;
  const start = source.getBoundingClientRect();
  const target =
    document.querySelector<HTMLElement>("[data-cart-target]")?.getBoundingClientRect() ??
    ({ left: window.innerWidth - 80, top: 24, width: 40, height: 40 } as DOMRect);

  const node = document.createElement("div");
  node.textContent = label;
  node.setAttribute("aria-hidden", "true");
  node.style.cssText = `position:fixed;left:${start.left + start.width / 2 - 22}px;top:${
    start.top + start.height / 2 - 22
  }px;width:44px;height:44px;display:grid;place-items:center;font-size:24px;border-radius:9999px;background:color-mix(in oklab, var(--primary) 22%, var(--card));border:1px solid color-mix(in oklab, var(--primary) 45%, transparent);box-shadow:var(--shadow-glow);z-index:9999;pointer-events:none;`;
  document.body.appendChild(node);

  const dx = target.left + target.width / 2 - (start.left + start.width / 2);
  const dy = target.top + target.height / 2 - (start.top + start.height / 2);

  const anim = node.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 90}px) scale(1.15) rotate(-12deg)`,
        opacity: 1,
        offset: 0.5,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.25) rotate(20deg)`, opacity: 0.2 },
    ],
    { duration: 820, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  );
  anim.onfinish = () => node.remove();
}
