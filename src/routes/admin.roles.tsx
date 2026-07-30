import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard, Pill } from "@/components/shared/panels";
import { roles, permissionGroups } from "@/data/admin";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles & access — CanteenOS" },
      {
        name: "description",
        content:
          "Review CanteenOS access roles, their members and the permissions granted to each group.",
      },
      { property: "og:title", content: "Roles & access — CanteenOS" },
      { property: "og:description", content: "Role definitions and permission matrix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Roles & access"
        description="Least-privilege access for every workspace."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Roles" }]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {roles.map((r, i) => (
          <SectionCard key={r.id} title={r.name} description={r.description} index={i}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Pill tone="primary">{r.members} members</Pill>
              <Pill>{r.permissions.length} permissions</Pill>
            </div>
            <div className="space-y-3">
              {permissionGroups.map((g) => {
                const granted = g.permissions.filter((p) => r.permissions.includes(p));
                if (!granted.length) return null;
                return (
                  <div key={g.group}>
                    <p className="text-xs font-medium text-muted-foreground">{g.group}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {granted.map((p) => (
                        <Pill key={p} tone="success" className="font-mono text-[11px]">
                          {p}
                        </Pill>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
