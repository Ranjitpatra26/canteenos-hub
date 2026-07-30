import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth, homeForRole } from "@/hooks/use-auth";
import type { Permission } from "@/lib/permissions";
import type { Role } from "@/types";
import type { ReactNode } from "react";

/**
 * Client-side workspace guard. Redirects signed-out visitors to /login and
 * sends signed-in users without the required role/permission to the workspace
 * they do have access to.
 */
export function RequireRole({
  roles,
  permission,
  children,
}: {
  roles: Role[];
  permission?: Permission;
  children: ReactNode;
}) {
  const { loading, session, role, can } = useAuth();
  const navigate = useNavigate();

  const roleOk = role ? roles.includes(role) : false;
  const allowed = roleOk && (!permission || can(permission));

  useEffect(() => {
    if (loading) return;
    if (!session) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    if (role && !allowed) {
      void navigate({ to: homeForRole(role), replace: true });
    }
  }, [loading, session, role, allowed, navigate]);

  if (loading || !session || !allowed) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-background"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-6 animate-spin text-primary" />
        <span className="sr-only">Checking your access…</span>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Inline permission guard for individual controls or panels. Renders
 * `fallback` (nothing by default) when the signed-in user lacks the permission.
 */
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useAuth().can(permission) ? <>{children}</> : <>{fallback}</>;
}
