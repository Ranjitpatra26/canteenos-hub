import { motion } from "motion/react";

interface FoodItem {
  id: string;
  emoji: string;
  label: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: string;
  tint: string;
  delay: number;
}

const FIXED_FOODS: FoodItem[] = [
  // 🔴 Mark 1: Upper Left (Above icon pills)
  {
    id: "mark1-ramen",
    emoji: "🍜",
    label: "Ramen",
    top: "18%",
    left: "10%",
    size: "size-18 text-3xl",
    tint: "from-red-500/20 to-orange-500/10 border-red-500/30",
    delay: 0.1,
  },

  // 🏹 Arrow Shifted: French Fries moved to the upper right area of the LEFT panel (where arrow points)
  {
    id: "arrow-fries",
    emoji: "🍟",
    label: "French Fries",
    top: "14%",
    left: "41%",
    size: "size-18 text-3xl",
    tint: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30",
    delay: 0.3,
  },

  // 🔴 Mark 3: Lower Left (Above 180k+ / 42 stats)
  {
    id: "mark3-cake",
    emoji: "🍰",
    label: "Cake",
    bottom: "18%",
    left: "10%",
    size: "size-20 text-4xl",
    tint: "from-pink-500/20 to-purple-500/10 border-pink-500/30",
    delay: 0.5,
  },

  // Middle & Bottom Left Panel items
  {
    id: "mid-pizza",
    emoji: "🍕",
    label: "Hot Pizza",
    top: "24%",
    left: "29%",
    size: "size-18 text-3xl",
    tint: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    delay: 0.2,
  },
  {
    id: "mid-burger",
    emoji: "🍔",
    label: "Smash Burger",
    bottom: "26%",
    left: "36%",
    size: "size-20 text-4xl",
    tint: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    delay: 0.4,
  },
  {
    id: "mid-coffee",
    emoji: "🥤",
    label: "Cold Frappe",
    bottom: "14%",
    left: "48%",
    size: "size-16 text-3xl",
    tint: "from-teal-500/20 to-emerald-500/10 border-teal-500/30",
    delay: 0.6,
  },

  // Right Side Form items
  {
    id: "right-top-donut",
    emoji: "🍩",
    label: "Donut",
    top: "16%",
    right: "2%",
    size: "size-18 text-3xl",
    tint: "from-pink-500/20 to-rose-500/10 border-pink-500/30",
    delay: 0.3,
  },
  {
    id: "right-bottom-taco",
    emoji: "🌮",
    label: "Crispy Taco",
    bottom: "18%",
    right: "2%",
    size: "size-18 text-3xl",
    tint: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    delay: 0.5,
  },
];

export function FloatingFoodFX() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
      {FIXED_FOODS.map((food) => (
        <motion.div
          key={food.id}
          style={{
            top: food.top,
            left: food.left,
            right: food.right,
            bottom: food.bottom,
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -8, 0],
          }}
          transition={{
            opacity: { duration: 0.6, delay: food.delay },
            scale: { duration: 0.6, delay: food.delay },
            y: {
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: food.delay,
            },
          }}
          className={`absolute hidden lg:flex items-center justify-center rounded-3xl border bg-card/70 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.35)] ${food.tint} ${food.size}`}
        >
          <span className="drop-shadow-[0_10px_12px_rgba(0,0,0,0.5)]">
            {food.emoji}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
