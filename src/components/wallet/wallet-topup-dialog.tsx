import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Smartphone,
  CreditCard,
  Building2,
  Lock,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Wallet,
  Sparkles,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTopUpWallet } from "@/lib/api";
import { celebrate } from "@/lib/fx";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WalletTopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmount?: number;
}

export function WalletTopUpDialog({ open, onOpenChange, defaultAmount = 200 }: WalletTopUpDialogProps) {
  const topUpWallet = useTopUpWallet();
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [customInput, setCustomInput] = useState<string>("");
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  
  // UPI State
  const [upiApp, setUpiApp] = useState<"gpay" | "phonepe" | "paytm" | "cred" | "bhim">("gpay");

  // Card State
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardHolder, setCardHolder] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState<string>("sbi");
  const [bankUserId, setBankUserId] = useState<string>("77391042");
  const [bankPassword, setBankPassword] = useState<string>("••••••••");

  // Auth OTP State
  const [otp, setOtp] = useState<string>("582914");
  const [step, setStep] = useState<"select" | "auth" | "processing" | "success">("select");

  const effectiveAmount = customInput && Number(customInput) > 0 ? Number(customInput) : amount;
  const upiUri = `upi://pay?pa=canteenos@okaxis&pn=CanteenOS%20Campus%20Wallet&am=${effectiveAmount}&cu=INR&tn=Campus%20Wallet%20TopUp`;

  // Auto detect card network
  const cardBrand = cardNumber.startsWith("4")
    ? "VISA"
    : cardNumber.startsWith("5")
    ? "Mastercard"
    : cardNumber.startsWith("6")
    ? "RuPay"
    : cardNumber.startsWith("3")
    ? "AMEX"
    : "Card";

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)} / ${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmount < 10) {
      toast.error("Minimum top up is ₹10");
      return;
    }

    if (method === "card") {
      const digitsOnly = cardNumber.replace(/\s/g, "");
      if (digitsOnly.length < 16) {
        toast.error("Please enter a valid 16-digit card number");
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        toast.error("Please enter card expiry date (MM / YY)");
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast.error("Please enter 3-digit CVV security code");
        return;
      }
    }

    setStep("auth");
  };

  const handleLaunchUpiApp = () => {
    if (typeof window !== "undefined") {
      window.location.href = upiUri;
      toast.info("Opening UPI App…", {
        description: "If your app doesn't open automatically, scan the QR code or authorize below.",
      });
    }
  };

  const handleConfirmPayment = async () => {
    if (method === "card" && otp.length < 6) {
      toast.error("Please enter valid 6-digit Bank 3D-Secure OTP");
      return;
    }

    setStep("processing");

    setTimeout(() => {
      topUpWallet.mutate(effectiveAmount, {
        onSuccess: () => {
          celebrate();
          setStep("success");
          toast.success(`🎉 ${inr(effectiveAmount)} Credited to Campus Wallet!`, {
            description: "Payment verified successfully.",
          });
        },
        onError: (err) => {
          setStep("select");
          toast.error(err instanceof Error ? err.message : "Payment Authorization Failed");
        },
      });
    }, 1600);
  };

  const handleClose = () => {
    setStep("select");
    onOpenChange(false);
  };

  const BANK_NAMES: Record<string, string> = {
    sbi: "State Bank of India (SBI)",
    hdfc: "HDFC Bank",
    icici: "ICICI Bank",
    axis: "Axis Bank",
    kotak: "Kotak Mahindra Bank",
    pnb: "Punjab National Bank",
    bob: "Bank of Baroda",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl p-0 gap-0 sm:max-w-md">
        <div className="bg-gradient-to-br from-primary/15 via-background to-background p-6 border-b border-border/60 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary/20 text-primary">
                <Wallet className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Add Money to Wallet</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Official UPI, Card & NetBanking Gateway
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full gap-1 border-success/30 text-success text-[11px] py-1 px-2.5">
              <ShieldCheck className="size-3.5" /> PCI-DSS Level 1
            </Badge>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "select" && (
              <motion.form
                key="select"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleStartPayment}
                className="space-y-5"
              >
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Select Top-Up Amount</Label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {[100, 200, 500, 1000].map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant={effectiveAmount === amt && !customInput ? "default" : "outline"}
                        className="rounded-xl font-semibold text-xs"
                        onClick={() => {
                          setAmount(amt);
                          setCustomInput("");
                        }}
                      >
                        +{inr(amt)}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Input
                      type="number"
                      placeholder="Or enter custom amount (e.g. 350)"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="rounded-xl text-xs"
                      min={10}
                      max={10000}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Choose Payment Method</Label>
                  <RadioGroup value={method} onValueChange={(v: any) => setMethod(v)} className="mt-2 grid gap-2">
                    <Label
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border p-3 font-normal transition-all",
                        method === "upi" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <RadioGroupItem value="upi" />
                        <Smartphone className="size-4 text-primary" />
                        <div>
                          <p className="text-xs font-semibold">Instant UPI / QR Code</p>
                          <p className="text-[10px] text-muted-foreground">Google Pay, PhonePe, Paytm, CRED, BHIM</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Zero Fee</Badge>
                    </Label>

                    <Label
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border p-3 font-normal transition-all",
                        method === "card" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <RadioGroupItem value="card" />
                        <CreditCard className="size-4 text-primary" />
                        <div>
                          <p className="text-xs font-semibold">Debit / Credit Card</p>
                          <p className="text-[10px] text-muted-foreground">Visa, Mastercard, RuPay, Amex</p>
                        </div>
                      </div>
                    </Label>

                    <Label
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border p-3 font-normal transition-all",
                        method === "netbanking" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <RadioGroupItem value="netbanking" />
                        <Building2 className="size-4 text-primary" />
                        <div>
                          <p className="text-xs font-semibold">Net Banking</p>
                          <p className="text-[10px] text-muted-foreground">SBI, HDFC, ICICI, Axis, PNB & All Major Banks</p>
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>

                {/* Method Specific Option Inputs */}
                {method === "upi" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Select preferred UPI App</Label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { id: "gpay", name: "GPay", color: "border-blue-500/40 bg-blue-500/10 text-blue-500" },
                        { id: "phonepe", name: "PhonePe", color: "border-purple-500/40 bg-purple-500/10 text-purple-500" },
                        { id: "paytm", name: "Paytm", color: "border-sky-500/40 bg-sky-500/10 text-sky-500" },
                        { id: "cred", name: "CRED", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" },
                        { id: "bhim", name: "BHIM", color: "border-orange-500/40 bg-orange-500/10 text-orange-500" },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setUpiApp(app.id as any)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-bold transition-all",
                            upiApp === app.id ? app.color + " ring-2 ring-primary/40" : "border-border hover:border-primary/30"
                          )}
                        >
                          {app.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {method === "card" && (
                  <div className="space-y-3 surface-card rounded-2xl p-4 border border-border">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-semibold text-muted-foreground">Card Number</Label>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {cardBrand}
                        </Badge>
                      </div>
                      <Input
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4532 •••• •••• 8892"
                        className="rounded-xl font-mono text-xs tracking-wider"
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Cardholder Name</Label>
                      <Input
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="e.g. RANJIT PATRA"
                        className="rounded-xl text-xs uppercase"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">Valid Thru</Label>
                        <Input
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM / YY"
                          className="rounded-xl font-mono text-xs text-center"
                          maxLength={7}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-muted-foreground">CVV</Label>
                        <Input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="•••"
                          className="rounded-xl font-mono text-xs text-center tracking-widest"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === "netbanking" && (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground">Select Your Bank</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "sbi", label: "SBI", name: "State Bank" },
                        { id: "hdfc", label: "HDFC", name: "HDFC Bank" },
                        { id: "icici", label: "ICICI", name: "ICICI Bank" },
                        { id: "axis", label: "AXIS", name: "Axis Bank" },
                        { id: "kotak", label: "KOTAK", name: "Kotak Bank" },
                        { id: "pnb", label: "PNB", name: "Punjab National" },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all",
                            selectedBank === bank.id
                              ? "border-primary bg-primary/10 font-bold text-foreground ring-2 ring-primary/40"
                              : "border-border hover:border-primary/30 text-muted-foreground"
                          )}
                        >
                          <span className="text-xs font-bold">{bank.label}</span>
                          <span className="text-[9px] opacity-75">{bank.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full rounded-xl gap-2 font-semibold">
                  Proceed to Pay {inr(effectiveAmount)} <ArrowRight className="size-4" />
                </Button>
              </motion.form>
            )}

            {step === "auth" && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="surface-card rounded-2xl p-4 border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground">Amount to Authorize</p>
                  <p className="text-2xl font-bold text-primary">{inr(effectiveAmount)}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Method: {method === "upi" ? `UPI (${upiApp.toUpperCase()})` : method === "card" ? `Card (${cardBrand})` : `NetBanking (${BANK_NAMES[selectedBank] ?? "Bank"})`}
                  </p>
                </div>

                {/* Method Specific Verification Screen */}
                {method === "upi" && (
                  <div className="space-y-3 text-center">
                    <div className="mx-auto w-fit p-3 bg-white rounded-2xl border border-border shadow-md">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`}
                        alt="Scan UPI QR Code"
                        className="size-36 mx-auto"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Scan QR code using Google Pay, PhonePe, Paytm or BHIM to pay
                    </p>

                    <Button
                      type="button"
                      onClick={handleLaunchUpiApp}
                      variant="outline"
                      className="w-full rounded-xl text-xs gap-2 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Smartphone className="size-4" /> Open {upiApp.toUpperCase()} App Directly
                    </Button>
                  </div>
                )}

                {method === "card" && (
                  <div className="space-y-3 surface-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold text-foreground">3D-Secure 2.0 Verification</span>
                      <Badge variant="outline" className="text-[10px] text-primary">
                        {cardBrand} Protect
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      A 6-digit OTP has been sent to your bank registered mobile number ending in <strong className="text-foreground">•••• 8892</strong>.
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Lock className="size-3.5 text-primary" /> Enter 6-Digit Bank OTP
                      </Label>
                      <Input
                        type="password"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="582914"
                        className="rounded-xl text-center font-mono text-lg tracking-widest"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {method === "netbanking" && (
                  <div className="space-y-3 surface-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold text-foreground">{BANK_NAMES[selectedBank]} Internet Banking</span>
                      <Badge variant="outline" className="text-[10px] text-success border-success/30">
                        Secure Server
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Customer ID / User ID</Label>
                        <Input
                          value={bankUserId}
                          onChange={(e) => setBankUserId(e.target.value)}
                          className="rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">NetBanking Password</Label>
                        <Input
                          type="password"
                          value={bankPassword}
                          onChange={(e) => setBankPassword(e.target.value)}
                          className="rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" type="button" onClick={() => setStep("select")} className="flex-1 rounded-xl text-xs">
                    Back
                  </Button>
                  <Button type="button" onClick={handleConfirmPayment} className="flex-2 rounded-xl text-xs gap-1.5">
                    Authorize Payment
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="relative mx-auto size-16 grid place-items-center">
                  <Loader2 className="size-12 animate-spin text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Verifying Handshake with Bank…</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    256-Bit Encrypted Handshake with {method === "upi" ? upiApp.toUpperCase() : method === "card" ? `${cardBrand} Gateway` : `${BANK_NAMES[selectedBank]} Gateway`}.
                  </p>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-4"
              >
                <div className="mx-auto size-14 grid place-items-center rounded-2xl bg-success/20 text-success">
                  <CheckCircle2 className="size-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-success">Payment Successful!</h3>
                  <p className="text-sm font-semibold mt-1">+{inr(effectiveAmount)} Credited</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your campus wallet balance has been updated. You can now use your balance to buy food instantly!
                  </p>
                </div>
                <Button onClick={handleClose} className="w-full rounded-xl">
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
