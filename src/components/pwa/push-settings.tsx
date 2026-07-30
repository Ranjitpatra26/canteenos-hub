import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const PREFS_KEY = "canteenos.push-prefs";

const TOPICS = [
  { id: "order-status", label: "Order status", hint: "Accepted, cooking, ready for pickup." },
  { id: "ready", label: "Ready to collect", hint: "A loud ping when your food hits the counter." },
  { id: "offers", label: "Offers & coupons", hint: "Campus deals and flash discounts." },
  { id: "announcements", label: "Canteen announcements", hint: "Timing changes and closures." },
] as const;

type Prefs = Record<string, boolean>;

const DEFAULT_PREFS: Prefs = {
  "order-status": true,
  ready: true,
  offers: false,
  announcements: true,
};

/** Push notification permission + per-topic preference UI. */
export function PushSettings() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPermission("Notification" in window ? Notification.permission : "unsupported");
    try {
      const raw = window.localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...(JSON.parse(raw) as Prefs) });
    } catch {
      /* ignore malformed preferences */
    }
  }, []);

  const save = (next: Prefs) => {
    setPrefs(next);
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  const request = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      toast.success("Push notifications enabled");
      new Notification("CanteenOS", {
        body: "You'll get a ping the moment your order is ready.",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      });
    } else if (result === "denied") {
      toast.error("Notifications blocked — enable them in your browser settings.");
    }
  };

  return (
    <section
      className="surface-card/70 p-4 backdrop-blur-xl sm:p-5"
      aria-label="Push notifications"
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            {permission === "granted" ? (
              <BellRing className="size-4" />
            ) : permission === "denied" ? (
              <BellOff className="size-4" />
            ) : (
              <Bell className="size-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Push notifications</p>
            <p className="truncate text-xs text-muted-foreground">
              Live updates on your device, even when CanteenOS is closed.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {permission === "granted" ? (
            <Badge className="rounded-full">Enabled</Badge>
          ) : permission === "unsupported" ? (
            <Badge variant="secondary" className="rounded-full">
              Not supported
            </Badge>
          ) : (
            <Button size="sm" className="rounded-xl" onClick={() => void request()}>
              Enable
            </Button>
          )}
        </div>
      </header>

      {permission === "denied" ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
          Notifications are blocked for this site. Re-allow them from your browser’s site settings,
          then reload.
        </p>
      ) : null}

      <ul className="mt-4 space-y-1">
        {TOPICS.map((topic) => (
          <li
            key={topic.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-1 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{topic.label}</p>
              <p className="truncate text-xs text-muted-foreground">{topic.hint}</p>
            </div>
            <Switch
              className="shrink-0"
              checked={permission === "granted" && prefs[topic.id]}
              disabled={permission !== "granted"}
              aria-label={topic.label}
              onCheckedChange={(v) => save({ ...prefs, [topic.id]: v })}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
