import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Download,
  Mail,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { generateSecurityWhitepaperPDF } from "@/lib/pdf-branding";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact & IT Support Hub — CanteenOS" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState("");
  const [subject, setSubject] = useState("Sales & Pricing Inquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const downloadSecurityReport = () => {
    try {
      const doc = generateSecurityWhitepaperPDF({
        authorName: "Ranjit Patra",
        authorEmail: "ranjitpatra2611@gmail.com",
      });
      doc.save("CanteenOS-Security-Compliance-Report.pdf");
      toast.success("Security & Compliance Whitepaper downloaded successfully!");
    } catch {
      toast.error("Could not generate Security Whitepaper PDF.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setSubmitted(true);
    toast.success("Inquiry sent to Admin Ranjit Patra! We will reach out within 24 hours.");
  };

  return (
    <div className="min-h-dvh bg-background text-foreground py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Navigation */}
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
            <span className="text-base font-semibold">Contact & Support Hub</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Direct Management Contact Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6">
              <div>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  Official Support
                </span>
                <h1 className="mt-4 text-2xl font-bold">CanteenOS Management</h1>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Get in touch with our campus operations lead, request enterprise security reviews, or upgrade your plan.
                </p>
              </div>

              <div className="space-y-4 text-xs border-t border-border pt-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <UserCheck className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Lead Admin & Manager</p>
                    <p className="text-muted-foreground">Ranjit Patra</p>
                    <a
                      href="mailto:ranjitpatra2611@gmail.com"
                      className="text-primary font-medium hover:underline block mt-0.5"
                    >
                      ranjitpatra2611@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Mail className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Sales & Licensing Desk</p>
                    <a href="mailto:sales@canteenos.com" className="text-muted-foreground hover:underline">
                      sales@canteenos.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Phone className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Helpline & Campus IT</p>
                    <p className="text-muted-foreground">+91 (022) 2854-9000 (Mon–Sat, 9 AM – 7 PM)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Building2 className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">HQ Address</p>
                    <p className="text-muted-foreground">SAKEC Campus Tech Hub, Chembur, Mumbai 400088</p>
                  </div>
                </div>
              </div>

              {/* PDF Security Report Download Card */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <ShieldCheck className="size-4" />
                  <span>Security & Compliance Whitepaper</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Download full PDF detailing RLS database architecture, TLS 1.3 encryption, and SOC2 audit readiness.
                </p>
                <Button
                  onClick={downloadSecurityReport}
                  className="w-full mt-2 gap-2 rounded-xl text-xs"
                >
                  <Download className="size-3.5" /> Download PDF Overview
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Priority Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-4">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/20 text-primary">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <h2 className="text-2xl font-bold">Inquiry Submitted!</h2>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Thank you, <strong className="text-foreground">{name}</strong>. Your message regarding <strong className="text-foreground">{subject}</strong> has been assigned to Admin Ranjit Patra.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                    className="rounded-xl mt-4"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold">Send a Priority Message</h2>
                    <p className="text-xs text-muted-foreground">Our management team usually responds within 2 hours.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="cont-name" className="text-xs">Your Name</Label>
                      <Input
                        id="cont-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ananya Nair"
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cont-email" className="text-xs">Work / Campus Email</Label>
                      <Input
                        id="cont-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@campus.edu"
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="cont-campus" className="text-xs">Campus / Institution</Label>
                      <Input
                        id="cont-campus"
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        placeholder="VIT Vellore / SAKEC"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cont-subject" className="text-xs">Topic / Subject</Label>
                      <select
                        id="cont-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="Password Reset & Account Assistance">Password Reset & Account Assistance</option>
                        <option value="Sales & Pricing Inquiry">Sales & Pricing Inquiry</option>
                        <option value="IT & Security Compliance">IT & Security Compliance</option>
                        <option value="Plan Upgrade & Billing">Plan Upgrade & Billing</option>
                        <option value="Custom Campus Integration">Custom Campus Integration</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cont-msg" className="text-xs">Message</Label>
                    <Textarea
                      id="cont-msg"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your canteen counters, order volume or custom requirements…"
                      className="rounded-xl"
                    />
                  </div>

                  <Button type="submit" className="w-full h-11 rounded-xl gap-2 font-semibold shadow-md">
                    <Send className="size-4" /> Send Priority Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
