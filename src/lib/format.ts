export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const compactNumber = (n: number) =>
  new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export const timeAgo = (iso: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
};

export const clockTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const tintStyle = (tint: string, alpha = 0.18) => ({
  backgroundColor: `hsl(${tint} / ${alpha})`,
  color: `hsl(${tint})`,
});

export const tintGradient = (tint: string) => ({
  backgroundImage: `radial-gradient(120% 100% at 20% 0%, hsl(${tint} / 0.45), transparent 65%), linear-gradient(140deg, hsl(${tint} / 0.22), transparent 70%)`,
});

/** GST + delivery pricing rules shared by cart, checkout and order summaries. */
export const GST_RATE = 0.05;
export const DELIVERY_FEE = 20;
export const PACKAGING_FEE = 8;
