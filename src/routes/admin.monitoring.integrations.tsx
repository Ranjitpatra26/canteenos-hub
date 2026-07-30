import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pill, SectionCard } from "@/components/shared/panels";
import { KeyValue } from "@/components/monitoring/monitoring-ui";
import { Button } from "@/components/ui/button";
import {
  captureMessage,
  integrationStatus,
  listProviders,
  monitoringConfig,
  trackEvent,
} from "@/lib/monitoring";

export const Route = createFileRoute("/admin/monitoring/integrations")({
  head: () => ({
    meta: [
      { title: "Monitoring integrations — CanteenOS" },
      {
        name: "description",
        content:
          "Sentry and PostHog integration readiness, environment variables and the telemetry facade used across CanteenOS.",
      },
      { property: "og:title", content: "Monitoring integrations — CanteenOS" },
      { property: "og:description", content: "Sentry and PostHog readiness for CanteenOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Integrations,
});

function Integrations() {
  const [providers, setProviders] = useState<string[]>([]);
  const integrations = integrationStatus();

  useEffect(() => setProviders(listProviders()), []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {integrations.map((it, i) => (
          <SectionCard key={it.id} index={i}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[0.9375rem] font-semibold tracking-tight">{it.name}</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{it.purpose}</p>
              </div>
              <Pill tone={it.active ? "success" : it.configured ? "warning" : "muted"}>
                {it.active ? "Active" : it.configured ? "Configured" : "Not configured"}
              </Pill>
            </div>
            <div className="mt-4 grid gap-x-8">
              <KeyValue label="Environment variable">{it.envVar}</KeyValue>
              <KeyValue label="Environment">{monitoringConfig.environment}</KeyValue>
              <KeyValue label="Release">{monitoringConfig.release}</KeyValue>
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard
        title="Telemetry facade"
        description="Application code never imports a vendor SDK. It calls the monitoring helpers, and providers are registered at startup — so adding Sentry or PostHog is a single registration, not a refactor."
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => trackEvent("monitoring_test_event", { source: "integrations" })}
            >
              Emit test event
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl"
              onClick={() => captureMessage("Monitoring facade check", "info")}
            >
              Capture message
            </Button>
          </div>
        }
      >
        <div className="grid gap-x-8 sm:grid-cols-2">
          <KeyValue label="Registered providers">{providers.join(", ") || "console"}</KeyValue>
          <KeyValue label="Breadcrumb buffer">100 events</KeyValue>
          <KeyValue label="Page views">Tracked on every route change</KeyValue>
          <KeyValue label="User identity">Attached on sign in, cleared on sign out</KeyValue>
        </div>

        <div className="mt-5 rounded-xl border border-border/70 bg-card/40 p-4">
          <p className="label-micro">Available helpers</p>
          <ul className="numeric mt-3 space-y-1.5 text-xs text-muted-foreground">
            <li>captureError(error, context)</li>
            <li>captureMessage(message, level, context)</li>
            <li>trackEvent(event, properties)</li>
            <li>trackPageView(path)</li>
            <li>identifyUser(user | null)</li>
            <li>registerProvider(provider)</li>
          </ul>
        </div>
      </SectionCard>

      <SectionCard title="Enabling a provider" description="Steps for a future rollout.">
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">1.</span> Add the SDK dependency and set{" "}
            <span className="numeric">VITE_SENTRY_DSN</span> or{" "}
            <span className="numeric">VITE_POSTHOG_KEY</span> in the environment.
          </li>
          <li>
            <span className="font-medium text-foreground">2.</span> Inside{" "}
            <span className="numeric">initMonitoring()</span>, initialise the SDK and call{" "}
            <span className="numeric">registerProvider()</span> with its capture, identify and track
            handlers.
          </li>
          <li>
            <span className="font-medium text-foreground">3.</span> Nothing else changes — every call
            site in the app already routes through the facade.
          </li>
        </ol>
      </SectionCard>
    </div>
  );
}
