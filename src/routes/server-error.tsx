import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ErrorScreen, GlyphArt } from "@/components/shared/error-screen";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/server-error")({
  head: () => ({
    meta: [
      { title: "Something broke (500) — CanteenOS" },
      {
        name: "description",
        content: "CanteenOS hit an unexpected server error. Retry or head back to your dashboard.",
      },
      { property: "og:title", content: "Server error — CanteenOS" },
      { property: "og:description", content: "An unexpected error occurred on CanteenOS." },
    ],
  }),
  component: ServerErrorPage,
});

function ServerErrorPage() {
  const router = useRouter();
  return (
    <ErrorScreen
      code="500"
      title="Our kitchen dropped a plate"
      description="An unexpected error occurred while preparing this page. The team has been notified — retrying usually works straight away."
      tone="destructive"
      illustration={<GlyphArt glyph="🍽️" tone="destructive" />}
      actions={
        <>
          <Button className="rounded-xl" onClick={() => router.invalidate()}>
            Try again
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/">Go home</Link>
          </Button>
        </>
      }
    />
  );
}
