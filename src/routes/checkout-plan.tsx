import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChefHat,
  CreditCard,
  Download,
  Building2,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { generateTaxInvoicePDF } from "@/lib/pdf-branding";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const checkoutSearchSchema = z.object({
  plan: z.string().optional(),
});

export const Route = createFileRoute("/checkout-plan")({
  validateSearch: (search) => checkoutSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "Plan Checkout & Payment — CanteenOS" }],
  }),
  component: CheckoutPlanPage,
});

const PLANS = {
  starter: {
    name: "Starter Plan",
    priceMonthly: 0,
    priceAnnual: 0,
    priceLabel: "Free Pilot",
    period: "for the first term",
    desc: "1 counter, 1 kitchen display. Up to 300 orders/day with QR pickup.",
    features: [
      "Up to 300 orders / day",
      "Student ordering + QR pickup",
      "Kitchen kanban board",
      "Basic sales reporting",
      "Email support",
    ],
  },
  campus: {
    name: "Campus Plan",
    priceMonthly: 18000,
    priceAnnual: 14400,
    priceLabel: "₹18,000",
    period: "per canteen / month",
    desc: "Full operating system for a live canteen with inventory, suppliers and analytics.",
    features: [
      "Unlimited daily orders",
      "Inventory, suppliers & POs",
      "Full analytics suite + CSV export",
      "Coupons, wallets & meal plans",
      "Role-based access & audit log",
      "Priority 4h SLA support",
    ],
  },
  enterprise: {
    name: "Enterprise Plan",
    priceMonthly: 45000,
    priceAnnual: 36000,
    priceLabel: "Custom / ₹45,000",
    period: "multi-campus agreement",
    desc: "Group-level rollouts with SAML SSO, data residency and dedicated success manager.",
    features: [
      "Everything in Campus plan",
      "SAML SSO & SCIM provisioning",
      "Multi-campus consolidated reporting",
      "API access & data warehouse sync",
      "Custom SLA & security review",
      "Named success manager",
    ],
  },
};

function CheckoutPlanPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const planKey = (search?.plan ?? "campus").toLowerCase();
  const plan = PLANS[planKey as keyof typeof PLANS] ?? PLANS.campus;

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("upi");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState("Ranjit Patra");
  const [email, setEmail] = useState("ranjitpatra2611@gmail.com");
  const [campus, setCampus] = useState("Main Campus Canteen");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");

  const basePrice = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;
  const tax = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + tax;

  const downloadInvoice = async () => {
    try {
      const doc = await generateTaxInvoicePDF({
        planKey,
        planName: plan.name,
        billingCycle,
        basePrice,
        tax,
        totalAmount,
        customerName: name,
        campus,
        email,
        phone,
      });
      doc.save(`CanteenOS-Invoice-${planKey}.pdf`);
      toast.success("Tax Invoice PDF downloaded!");
    } catch {
      toast.error("Could not generate PDF. Invoice summary shown on screen.");
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      toast.success(`Payment of ₹${totalAmount.toLocaleString("en-IN")} successful! ${plan.name} activated.`);
      downloadInvoice();
    }, 1500);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground font-bold text-xs">
              COS
            </span>
            <span className="text-base font-semibold">CanteenOS Checkout</span>
          </div>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md rounded-3xl border border-primary/40 bg-card p-8 text-center shadow-2xl"
          >
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/20 text-primary">
              <CheckCircle2 className="size-10" />
            </div>
            <h2 className="mt-5 text-2xl font-bold">Payment Successful!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your <strong className="text-foreground">{plan.name}</strong> subscription is now active for{" "}
              <strong className="text-foreground">{campus}</strong>.
            </p>

            <div className="mt-6 rounded-2xl bg-background/60 p-4 text-left text-xs space-y-2 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold text-primary">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing Cycle:</span>
                <span className="capitalize font-medium">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono">TXN_{Math.floor(1000000 + Math.random() * 9000000)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={downloadInvoice} className="w-full gap-2 rounded-xl">
                <Download className="size-4" /> Download Tax Invoice PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => void navigate({ to: "/admin" })}
                className="w-full rounded-xl"
              >
                Go to Admin Dashboard
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Column: Plan Summary & Billing Toggle */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                    {plan.priceLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
                <h1 className="mt-4 text-2xl font-bold">{plan.name}</h1>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{plan.desc}</p>

                {/* Billing Cycle Selector */}
                <div className="mt-6 rounded-2xl bg-background p-1.5 flex gap-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                      billingCycle === "monthly"
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annual")}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      billingCycle === "annual"
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Annual <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5">Save 20%</span>
                  </button>
                </div>

                {/* Features List */}
                <ul className="mt-6 space-y-2.5 text-xs">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="size-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Price Calculation */}
                <div className="mt-6 border-t border-border pt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Price</span>
                    <span>₹{basePrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                    <span>Total Due</span>
                    <span className="text-primary">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Form & Simulated Payment */}
            <div className="lg:col-span-7">
              <form onSubmit={handlePayment} className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold">Billing & Contact Information</h2>
                  <p className="text-xs text-muted-foreground">Enter your campus & invoice details below.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="b-name" className="text-xs">Full Name</Label>
                    <Input
                      id="b-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="b-campus" className="text-xs">Campus / Canteen Name</Label>
                    <Input
                      id="b-campus"
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="b-email" className="text-xs">Work Email</Label>
                    <Input
                      id="b-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="b-phone" className="text-xs">Phone Number</Label>
                    <Input
                      id="b-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3 pt-2">
                  <Label className="text-xs font-semibold">Select Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as "card" | "upi" | "netbanking")}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div
                      onClick={() => setPaymentMethod("upi")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "upi"
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-background/50 hover:bg-background text-muted-foreground"
                      }`}
                    >
                      <QrCode className="size-5 mb-1" />
                      <span className="text-xs">UPI / QR</span>
                    </div>

                    <div
                      onClick={() => setPaymentMethod("card")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-background/50 hover:bg-background text-muted-foreground"
                      }`}
                    >
                      <CreditCard className="size-5 mb-1" />
                      <span className="text-xs">Card</span>
                    </div>

                    <div
                      onClick={() => setPaymentMethod("netbanking")}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === "netbanking"
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-background/50 hover:bg-background text-muted-foreground"
                      }`}
                    >
                      <Building2 className="size-5 mb-1" />
                      <span className="text-xs">PO / NetBank</span>
                    </div>
                  </RadioGroup>
                </div>

                {/* Payment Details Container */}
                {paymentMethod === "upi" ? (
                  <div className="rounded-2xl border border-primary/20 bg-background/80 p-4 text-center space-y-3">
                    <p className="text-xs font-medium text-foreground">Scan UPI QR Code with any UPI App (GPay / PhonePe / Paytm)</p>
                    <div className="mx-auto grid size-36 place-items-center rounded-2xl bg-white p-2 shadow-inner">
                      {/* Simulated QR Pattern */}
                      <div className="size-full rounded-lg bg-black/90 p-2 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="size-7 bg-white rounded-sm p-1"><div className="size-full bg-black"/></div>
                          <div className="size-7 bg-white rounded-sm p-1"><div className="size-full bg-black"/></div>
                        </div>
                        <p className="text-[9px] text-white font-mono text-center">canteenos@upi</p>
                        <div className="flex justify-between">
                          <div className="size-7 bg-white rounded-sm p-1"><div className="size-full bg-black"/></div>
                          <div className="size-3 bg-white rounded-full"/>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">UPI ID: <span className="font-mono text-primary">canteenos.pay@sbi</span> · Instant Verification</p>
                  </div>
                ) : paymentMethod === "card" ? (
                  <div className="space-y-3 rounded-2xl border border-border bg-background/60 p-4">
                    <div className="space-y-1">
                      <Label htmlFor="c-num" className="text-xs">Card Number</Label>
                      <Input
                        id="c-num"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="rounded-xl font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="c-exp" className="text-xs">Expiry</Label>
                        <Input
                          id="c-exp"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          className="rounded-xl font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="c-cvv" className="text-xs">CVV</Label>
                        <Input
                          id="c-cvv"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="rounded-xl font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-background/60 p-4 text-xs space-y-1 text-muted-foreground">
                    <p className="font-semibold text-foreground">Campus Purchase Order / Bank Transfer</p>
                    <p>Bank: HDFC Bank Campus Branch</p>
                    <p>Account: 50200049281044 · IFSC: HDFC0001248</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-sm font-semibold rounded-2xl gap-2 shadow-lg shadow-primary/20"
                >
                  <Lock className="size-4" />
                  {loading ? "Processing Simulated Payment..." : `Pay ₹${totalAmount.toLocaleString("en-IN")} & Activate ${plan.name}`}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
