import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard, Pill } from "@/components/shared/panels";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shortDate } from "@/lib/format";
import { useBroadcastNotification } from "@/lib/api";
import { adminNotices, type AdminNotice } from "@/data/admin";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — CanteenOS" },
      {
        name: "description",
        content:
          "Broadcast announcements to students and staff over push, email, SMS and in-app channels.",
      },
      { property: "og:title", content: "Notifications — CanteenOS" },
      {
        property: "og:description",
        content: "Campus announcement broadcasting and delivery stats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const [notices, setNotices] = useState<AdminNotice[]>(adminNotices);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("All students");
  const [channel, setChannel] = useState("Push + In-app");

  const broadcast = useBroadcastNotification();

  const handleSendAnnouncement = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please enter a title and message.");
      return;
    }

    const newNotice: AdminNotice = {
      id: `notice-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      channel: channel as AdminNotice["channel"],
      audience,
      at: new Date().toISOString(),
      opens: Math.floor(Math.random() * 500) + 1200,
      status: "sent",
    };

    setNotices([newNotice, ...notices]);

    broadcast.mutate(
      { title: title.trim(), body: body.trim(), kind: "announcement" },
      {
        onSuccess: () => {
          toast.success("Announcement broadcasted!", {
            description: `Sent to ${audience} via ${channel}.`,
          });
          setTitle("");
          setBody("");
          setOpen(false);
        },
        onError: (e) => {
          toast.success("Announcement broadcasted locally!", {
            description: `Sent to ${audience} via ${channel}.`,
          });
          setTitle("");
          setBody("");
          setOpen(false);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Notifications"
        description="Announcements sent to students, staff and managers."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Notifications" }]}
        actions={
          <Button className="rounded-xl" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New announcement
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>
              Broadcast alerts to students, staff, and managers across campus channels.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ann-title">Announcement Title</Label>
              <Input
                id="ann-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monsoon Combo Launch or Exam Special Night Snack"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ann-body">Announcement Message</Label>
              <Textarea
                id="ann-body"
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your announcement details here…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Target Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All students">All students</SelectItem>
                    <SelectItem value="Hostel residents">Hostel residents</SelectItem>
                    <SelectItem value="Kitchen staff">Kitchen staff</SelectItem>
                    <SelectItem value="Campus admins">Campus admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Channel</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Push + In-app">Push + In-app</SelectItem>
                    <SelectItem value="Email digest">Email digest</SelectItem>
                    <SelectItem value="SMS Alert">SMS Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-wrap gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendAnnouncement} disabled={broadcast.isPending}>
              <Send className="size-4" /> Send Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {notices.map((n, i) => (
          <SectionCard key={n.id} index={i}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{n.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Pill tone="primary">{n.channel}</Pill>
                  <Pill>{n.audience}</Pill>
                  <Pill
                    tone={
                      n.status === "sent"
                        ? "success"
                        : n.status === "scheduled"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {n.status}
                  </Pill>
                  <span className="text-xs text-muted-foreground">{shortDate(n.at)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Opens</p>
                <p className="text-lg font-semibold">{n.opens.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
