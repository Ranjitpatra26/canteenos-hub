import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { identifyUser } from "@/lib/monitoring";
import { permissionsForRoles, roleCan, type Permission } from "@/lib/permissions";
import type { Role } from "@/types";

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  student_id: string | null;
  department: string | null;
  year: string | null;
  phone: string | null;
  avatar_url: string | null;
  tint: string;
  status: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  roles: Role[];
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  loading: boolean;
  /** True as soon as we know who the user is (live session or cached identity). */
  authenticated: boolean;

  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const homeForRole = (role: Role | null) =>
  role === "admin" ? "/admin" : role === "kitchen" ? "/kitchen" : "/app";

/** Sign the user out after this much inactivity (30 minutes). */
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
/** Warn this long before an access token lapses without a refresh. */
const EXPIRY_WARNING_MS = 2 * 60 * 1000;

/**
 * Last known identity, cached so the header can paint the user's name and role
 * on the very first frame instead of flashing "Sign in" while Supabase
 * rehydrates the session from storage.
 */
const IDENTITY_KEY = "canteenos.identity";

type IdentitySnapshot = { profile: Profile | null; roles: Role[] };

function readIdentity(): IdentitySnapshot {
  if (typeof window === "undefined") return { profile: null, roles: [] };
  try {
    const raw = window.localStorage.getItem(IDENTITY_KEY);
    if (!raw) return { profile: null, roles: [] };
    const parsed = JSON.parse(raw) as IdentitySnapshot;
    const roles: Role[] = (parsed.roles && parsed.roles.length > 0) ? (parsed.roles as Role[]) : ["student"];
    return { profile: parsed.profile ?? null, roles };
  } catch {
    return { profile: null, roles: [] };
  }
}

function writeIdentity(next: IdentitySnapshot | null) {
  if (typeof window === "undefined") return;
  try {
    if (!next) window.localStorage.removeItem(IDENTITY_KEY);
    else window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const cached = useRef<IdentitySnapshot>(readIdentity());
  const [profile, setProfile] = useState<Profile | null>(cached.current.profile);
  const [roles, setRoles] = useState<Role[]>(cached.current.roles);
  const [loading, setLoading] = useState(true);
  const signingOut = useRef(false);

  const load = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setProfile(null);
      setRoles([]);
      writeIdentity(null);
      return;
    }
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    const rawProfile = (p as Profile | null) ?? null;
    const sessionRes = await supabase.auth.getSession();
    const currentUser = sessionRes.data.session?.user;

    const isAdminUser = currentUser?.email?.toLowerCase() === "ranjitpatra2611@gmail.com";

    const nextProfile: Profile = {
      id: uid,
      full_name: rawProfile?.full_name || currentUser?.user_metadata?.full_name || (isAdminUser ? "Ranjit Patra" : "Student"),
      email: rawProfile?.email || currentUser?.email || null,
      student_id: rawProfile?.student_id || "RM24G5",
      department: rawProfile?.department || "Computer Engineering",
      year: rawProfile?.year || "3rd Year",
      phone: rawProfile?.phone || null,
      avatar_url: rawProfile?.avatar_url || null,
      tint: rawProfile?.tint || "124 70% 55%",
      status: rawProfile?.status || "active",
    };

    let nextRoles = ((r ?? []) as { role: Role }[]).map((x) => x.role);

    // Admins always get full access to all 3 workspaces (admin, kitchen, student)
    if (isAdminUser || nextRoles.includes("admin")) {
      nextRoles = ["admin", "student", "kitchen"];
    } else if (nextRoles.length === 0) {
      nextRoles = ["student"];
    }

    setProfile(nextProfile);
    setRoles(nextRoles);
    writeIdentity({ profile: nextProfile, roles: nextRoles });
  }, []);


  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      // Defer Supabase calls out of the auth callback to avoid deadlocks.
      setTimeout(() => {
        void load(next?.user?.id).finally(() => setLoading(false));
      }, 0);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      void load(data.session?.user?.id).finally(() => setLoading(false));
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [load]);

  /** Secure teardown: stop in-flight queries, drop cached protected data, then sign out. */
  const signOut = useCallback(async () => {
    if (signingOut.current) return;
    signingOut.current = true;
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
    } finally {
      setProfile(null);
      setRoles([]);
      setSession(null);
      writeIdentity(null);
      if (typeof window !== "undefined") {
        // Drop client-side caches that could otherwise outlive the session.
        window.localStorage.removeItem("canteenos.cart");
        window.localStorage.removeItem("canteenos.favorites");
      }

      signingOut.current = false;
    }
  }, [queryClient]);

  // Session expiration: warn shortly before the token lapses and end the
  // session if Supabase could not refresh it in time.
  useEffect(() => {
    if (!session?.expires_at) return;
    const expiresAt = session.expires_at * 1000;
    const warnIn = expiresAt - Date.now() - EXPIRY_WARNING_MS;
    const endIn = expiresAt - Date.now();

    const warn = window.setTimeout(
      () => toast.warning("Your session is about to expire", { description: "Renewing securely…" }),
      Math.max(warnIn, 0),
    );
    const end = window.setTimeout(
      async () => {
        const { data } = await supabase.auth.getSession();
        const stillExpired = !data.session || data.session.expires_at! * 1000 <= Date.now();
        if (stillExpired) {
          toast.error("Session expired", { description: "Please sign in again." });
          void signOut();
        }
      },
      Math.max(endIn, 0) + 1500,
    );

    return () => {
      window.clearTimeout(warn);
      window.clearTimeout(end);
    };
  }, [session?.expires_at, signOut]);

  // Idle timeout — protects shared campus/kitchen terminals.
  useEffect(() => {
    if (!session) return;
    let timer = window.setTimeout(onIdle, IDLE_TIMEOUT_MS);

    function onIdle() {
      toast.info("Signed out for inactivity");
      void signOut();
    }
    function bump() {
      window.clearTimeout(timer);
      timer = window.setTimeout(onIdle, IDLE_TIMEOUT_MS);
    }

    const events = ["pointerdown", "keydown", "visibilitychange", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [session, signOut]);

  /**
   * Re-read identity for whoever is signed in *right now*. We ask Supabase for
   * the live session instead of trusting React state, so switching workspaces
   * (which signs in a different account) picks up the new roles immediately
   * instead of using the previous user's id.
   */
  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await load(data.session?.user?.id);
    setLoading(false);
  }, [load]);

  const role: Role | null = useMemo(() => {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("kitchen")) return "kitchen";
    if (roles.includes("student")) return "student";
    return null;
  }, [roles]);

  const permissions = useMemo(() => permissionsForRoles(roles), [roles]);
  const can = useCallback((permission: Permission) => roleCan(roles, permission), [roles]);

  // Keep the telemetry facade in sync so future Sentry/PostHog providers get identity.
  useEffect(() => {
    const user = session?.user;
    identifyUser(
      user ? { id: user.id, email: user.email ?? undefined, role: role ?? undefined } : null,
    );
  }, [session?.user, role]);


  const value: AuthContextValue = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      roles,
      permissions,
      can,
      loading,
      authenticated: Boolean(session) || (loading && Boolean(profile)),
      refresh,
      signOut,
    }),
    [session, profile, role, roles, permissions, can, loading, refresh, signOut],

  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Convenience hook for conditional UI: `usePermission("menu.manage")`. */
export function usePermission(permission: Permission) {
  return useAuth().can(permission);
}
