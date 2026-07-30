import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorScreen, GlyphArt } from "@/components/shared/error-screen";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Sign in required (401) — CanteenOS" },
      {
        name: "description",
        content: "You need to sign in to your CanteenOS account to view this page.",
      },
      { property: "og:title", content: "Sign in required — CanteenOS" },
      {
        property: "og:description",
        content: "Authentication is required for this CanteenOS page.",
      },
    ],
  }),
  component: () => (
    <ErrorScreen
      code="401"
      title="Sign in to continue"
      description="This part of CanteenOS is only available to signed-in members. Log in with your campus account to pick up where you left off."
      illustration={<GlyphArt glyph="🔐" />}
      actions={
        <>
          <Button asChild className="rounded-xl">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/register">Create account</Link>
          </Button>
        </>
      }
    />
  ),
});
