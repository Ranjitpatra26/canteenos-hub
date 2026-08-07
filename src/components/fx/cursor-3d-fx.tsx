import { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "motion/react";

const FOOD_EMOJIS = ["🍔", "🍕", "🍟", "🌮", "🍩", "🍦", "☕", "🍱", "🍜", "🥤", "🧁", "🍪", "🥪", "🥟", "🥐"];
const GLITTER_COLORS = ["132, 204, 22", "111, 227, 225", "250, 204, 21", "244, 114, 182", "168, 85, 247"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  type: "glitter" | "emoji";
  emoji?: string;
  color?: string;
  rotation?: number;
  vr?: number;
  twinkleSpeed?: number;
};

/** Helper to draw a glowing 4-point glitter star on canvas */
function drawGlitterStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = `rgba(${color}, ${alpha})`;
  ctx.shadowBlur = 10;
  ctx.shadowColor = `rgba(${color}, 0.8)`;

  // Draw 4-point sparkle star
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.lineTo(0, size);
    ctx.lineTo(size * 0.25, size * 0.25);
  }
  ctx.fill();
  ctx.restore();
}

export function MouseCursor3DFX() {
  const [isPointerFine, setIsPointerFine] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Springs for smooth physics trailing outer ring
  const mouseX = useSpring(0, { stiffness: 400, damping: 28 });
  const mouseY = useSpring(0, { stiffness: 400, damping: 28 });

  // Reticle position (exact)
  const [dotPos, setDotPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsPointerFine(mediaQuery.matches);

    const updateMedia = (e: MediaQueryListEvent) => setIsPointerFine(e.matches);
    mediaQuery.addEventListener("change", updateMedia);

    return () => mediaQuery.removeEventListener("change", updateMedia);
  }, []);

  useEffect(() => {
    const particles: Particle[] = [];

    const spawnGlitter = (x: number, y: number, count = 2) => {
      for (let i = 0; i < count; i++) {
        const color = GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)];
        particles.push({
          x: x + (Math.random() - 0.5) * 12,
          y: y + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6 - 0.2,
          size: Math.random() * 4 + 2,
          alpha: 1.0,
          type: "glitter",
          color,
          twinkleSpeed: Math.random() * 0.04 + 0.02,
        });
      }
    };

    const spawnBurst = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        const angle = (Math.PI * 2 * i) / 7;
        const speed = Math.random() * 3 + 1.5;
        const randomEmoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: Math.random() * 8 + 22,
          alpha: 1.0,
          type: "emoji",
          emoji: randomEmoji,
          rotation: (Math.random() - 0.5) * Math.PI,
          vr: (Math.random() - 0.5) * 0.1,
        });
      }
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 5 + 3,
          alpha: 1.0,
          type: "glitter",
          color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      setDotPos({ x, y });
      mouseX.set(x);
      mouseY.set(y);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("button") ||
          target.closest("a") ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest('[role="button"]') ||
          target.closest(".hover-lift") ||
          target.closest(".surface-card"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }

      spawnGlitter(x, y, 2);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      spawnBurst(e.clientX, e.clientY);
    };

    const handleMouseUp = () => setIsClicking(false);

    // Mobile Touch Handlers
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      setDotPos({ x: touch.clientX, y: touch.clientY });
      mouseX.set(touch.clientX);
      mouseY.set(touch.clientY);
      setIsClicking(true);
      spawnBurst(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      setDotPos({ x: touch.clientX, y: touch.clientY });
      mouseX.set(touch.clientX);
      mouseY.set(touch.clientY);
      spawnGlitter(touch.clientX, touch.clientY, 3);
    };

    const handleTouchEnd = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Canvas rendering loop
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === "emoji") {
          p.alpha -= 0.016;
          p.size *= 0.988;
          if (p.rotation !== undefined && p.vr !== undefined) {
            p.rotation += p.vr;
          }

          if (p.alpha <= 0 || p.size <= 4) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          if (p.rotation) ctx.rotate(p.rotation);
          ctx.font = `${Math.round(p.size)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.emoji ?? "🍔", 0, 0);
          ctx.restore();
        } else {
          p.alpha -= p.twinkleSpeed ?? 0.03;
          p.size *= 0.96;

          if (p.alpha <= 0 || p.size <= 0.3) {
            particles.splice(i, 1);
            continue;
          }

          drawGlitterStar(ctx, p.x, p.y, p.size, p.color ?? "132, 204, 22", Math.max(0, p.alpha));
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* Glitter & Food Emoji Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      {/* Reticle Dot & Outer Ring on fine pointer / desktop mouse */}
      {isPointerFine ? (
        <>
          <motion.div
            style={{
              x: mouseX,
              y: mouseY,
            }}
            animate={{
              scale: isClicking ? 0.7 : isHovered ? 1.6 : 1,
              rotate: isHovered ? 45 : 0,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`absolute -left-5 -top-5 grid size-10 place-items-center rounded-full border transition-colors duration-200 ${
              isHovered
                ? "border-primary bg-primary/20 shadow-[0_0_30px_rgba(132,204,22,0.6)]"
                : "border-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(132,204,22,0.25)]"
            }`}
          >
            <span className="size-full rounded-full border border-dashed border-primary/40 animate-spin-slow opacity-60" />
          </motion.div>

          <div
            style={{
              transform: `translate3d(${dotPos.x}px, ${dotPos.y}px, 0px)`,
            }}
            className="absolute -left-1.5 -top-1.5 grid size-3 place-items-center rounded-full bg-primary shadow-[0_0_10px_2px_rgba(132,204,22,0.9)] transition-transform duration-75"
          >
            <span className="size-1 rounded-full bg-white" />
          </div>
        </>
      ) : null}
    </div>
  );
}

