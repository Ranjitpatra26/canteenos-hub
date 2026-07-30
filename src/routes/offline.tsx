import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ErrorScreen, GlyphArt } from "@/components/shared/error-screen";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "You're offline — CanteenOS" },
      {
        name: "description",
        content: "CanteenOS can't reach the network right now. Reconnect to keep ordering.",
      },
      { property: "og:title", content: "You're offline — CanteenOS" },
      { property: "og:description", content: "Reconnect to continue using CanteenOS." },
    ],
  }),
  component: OfflinePage,
});

function OfflinePage() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <ErrorScreen
      code="offline"
      title={online ? "You're back online" : "No connection"}
      description={
        online
          ? "Your connection is back. Head to your dashboard and everything will resync automatically."
          : "CanteenOS can't reach the campus network. Your cart is saved locally — reconnect and we'll pick up exactly where you left off."
      }
      tone="accent"
      illustration={<GlyphArt glyph="📡" tone="accent" />}
      actions={
        <>
          <Button className="rounded-xl" onClick={() => window.location.reload()}>
            Retry connection
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/app">Open dashboard</Link>
          </Button>
        </>
      }
    />
  );
}
