import { createFileRoute } from "@tanstack/react-router";
import { LandingNav } from "@/components/landing/landing-nav";
import {
  CtaContact,
  Faq,
  Features,
  Footer,
  Hero,
  HowItWorks,
  LogoMarquee,
  Screens,
  Showcase,
  Stats,
  Testimonials,
} from "@/components/landing/sections";
import {
  CtaBand,
  Enterprise,
  FeatureComparison,
  Integrations,
  Newsletter,
  Pricing,
  Security,
  SuccessStories,
  WhyChooseUs,
} from "@/components/landing/marketing-sections";

const TITLE = "CanteenOS — Smart Canteen Ordering & Kitchen Operations for Campuses";
const DESCRIPTION =
  "CanteenOS runs the whole campus food service loop: one-tap student ordering with QR pickup, a live kitchen kanban, and real-time revenue, inventory and analytics for admins.";

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CanteenOS",
  description: "Smart canteen ordering, kitchen operations and analytics for modern campuses.",
  url: "https://canteenos-hub.vercel.app",
  logo: "/favicon.png",
  sameAs: [
    "https://github.com/Ranjitpatra26",
    "https://www.linkedin.com/in/ranjit-patra-b27816393",
  ],
};

const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CanteenOS",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: DESCRIPTION,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "412",
    bestRating: "5",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "0",
      priceCurrency: "INR",
      description: "Free for the first term. One counter, one kitchen display.",
    },
    {
      "@type": "Offer",
      name: "Campus",
      price: "18000",
      priceCurrency: "INR",
      description: "Per canteen, per month. Full inventory and analytics suite.",
    },
  ],
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    [
      "How long does it take to roll out on a new campus?",
      "Most campuses go live in under two weeks. We import your existing menu, map counters to kitchen stations and run a pilot service before the full switch.",
    ],
    [
      "Can students pay with their existing meal plan?",
      "Yes. CanteenOS supports campus wallets, meal plan deductions, UPI and cards. Payment rules are configurable per canteen.",
    ],
    [
      "Does the kitchen need special hardware?",
      "No. The kitchen display runs in any browser on a tablet or TV. A thermal printer is optional if you still want paper tickets.",
    ],
    [
      "What happens when an item runs out?",
      "The kitchen marks it unavailable on the board and it disappears from the student menu instantly, with in-cart items flagged before checkout.",
    ],
    [
      "Can we run offers and coupons?",
      "Coupons support percentage or flat discounts, minimum order values, usage caps and expiry dates, all managed from the admin console.",
    ],
    [
      "Is our data exportable?",
      "Every report — revenue, inventory movement, customer history — can be exported to CSV, and the API is available on the campus plan.",
    ],
  ].map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "canteen management software, campus food ordering system, cafeteria POS, kitchen display system, college canteen app",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { property: "og:site_name", content: "CanteenOS" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "robots", content: "index, follow, max-image-preview:large" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(organizationLd) },
      { type: "application/ld+json", children: JSON.stringify(softwareLd) },
      { type: "application/ld+json", children: JSON.stringify(faqLd) },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <LandingNav />
      <main>
        <Hero />
        <LogoMarquee />
        <Features />
        <Stats />
        <WhyChooseUs />
        <HowItWorks />
        <Showcase />
        <Screens />
        <SuccessStories />
        <Testimonials />
        <FeatureComparison />
        <Pricing />
        <CtaBand />
        <Security />
        <Enterprise />
        <Integrations />
        <Faq />
        <Newsletter />
        <CtaContact />
      </main>
      <Footer />
    </div>
  );
}
