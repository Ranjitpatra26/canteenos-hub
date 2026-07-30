import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorScreen, GlyphArt } from "@/components/shared/error-screen";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/forbidden")({
  head: () => ({
    meta: [
      { title: "Access denied (403) — CanteenOS" },
      {
        name: "description",
        content: "Your CanteenOS role doesn't have permission to open this workspace.",
      },
      { property: "og:title", content: "Access denied — CanteenOS" },
      {
        property: "og:description",
        content: "Your role doesn't grant access to this CanteenOS area.",
      },
    ],
  }),
  component: () => (
    <ErrorScreen
      code="403"
      title="You don't have access to this"
      description="Your role doesn't include permission for this workspace. If you think that's a mistake, ask a canteen admin to update your access from Users & roles."
      tone="destructive"
      illustration={<GlyphArt glyph="⛔" tone="destructive" />}
      actions={
        <>
          <Button asChild className="rounded-xl">
            <Link to="/app">Go to my dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/">Home</Link>
          </Button>
        </>
      }
    />
  ),
});
