import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorScreen, GlyphArt } from "@/components/shared/error-screen";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Scheduled maintenance — CanteenOS" },
      {
        name: "description",
        content: "CanteenOS is briefly down for scheduled maintenance. Ordering resumes shortly.",
      },
      { property: "og:title", content: "Scheduled maintenance — CanteenOS" },
      { property: "og:description", content: "We're upgrading CanteenOS. Back in a few minutes." },
    ],
  }),
  component: () => (
    <ErrorScreen
      code="503"
      title="We're upgrading the kitchen"
      description="CanteenOS is briefly offline for scheduled maintenance. Live orders are safe and will resume the moment we're back — usually under 15 minutes."
      tone="accent"
      illustration={<GlyphArt glyph="🛠️" tone="accent" />}
      actions={
        <>
          <Button className="rounded-xl" onClick={() => window.location.reload()}>
            Check again
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/">Back to home</Link>
          </Button>
        </>
      }
    />
  ),
});
