import type { Role } from "@/types";

/**
 * Role-based access control matrix. Routes and UI affordances read from here
 * so permissions live in one auditable place instead of scattered role checks.
 *
 * Server-side RLS remains the real enforcement layer — this drives navigation
 * and rendering only.
 */
export const PERMISSIONS = [
  "menu.view",
  "menu.manage",
  "order.create",
  "order.view.own",
  "order.view.all",
  "order.update.status",
  "kitchen.view",
  "inventory.view",
  "inventory.manage",
  "analytics.view",
  "users.view",
  "users.manage",
  "coupons.manage",
  "settings.manage",
  "audit.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const STUDENT: Permission[] = ["menu.view", "order.create", "order.view.own"];

const KITCHEN: Permission[] = [
  "menu.view",
  "kitchen.view",
  "order.view.all",
  "order.update.status",
  "inventory.view",
];

const ADMIN: Permission[] = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  student: STUDENT,
  kitchen: KITCHEN,
  admin: ADMIN,
};

export function permissionsForRoles(roles: Role[]): Permission[] {
  const set = new Set<Permission>();
  for (const role of roles) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) set.add(p);
  }
  return [...set];
}

export function roleCan(roles: Role[], permission: Permission) {
  return roles.some((role) => (ROLE_PERMISSIONS[role] ?? []).includes(permission));
}
