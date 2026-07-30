import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  branches,
  branchesForCampus,
  campuses,
  type Branch,
  type Campus,
} from "@/data/organization";

const STORAGE_KEY = "canteenos.org.scope";

interface OrgScope {
  campusId: string;
  /** `null` means "all canteens in this campus". */
  branchId: string | null;
}

interface OrgContextValue extends OrgScope {
  campus: Campus;
  branch: Branch | null;
  campuses: Campus[];
  /** Canteens belonging to the active campus. */
  branches: Branch[];
  allBranches: Branch[];
  setCampus: (campusId: string) => void;
  setBranch: (branchId: string | null) => void;
  /** True when the row/record belongs to the current scope. */
  inScope: (item: { campusId?: string; branchId?: string }) => boolean;
  scopeLabel: string;
}

const OrgContext = createContext<OrgContextValue | null>(null);

const defaultScope: OrgScope = { campusId: campuses[0].id, branchId: null };

function readStored(): OrgScope {
  if (typeof window === "undefined") return defaultScope;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultScope;
    const parsed = JSON.parse(raw) as Partial<OrgScope>;
    const campus = campuses.find((c) => c.id === parsed.campusId);
    if (!campus) return defaultScope;
    const branch = parsed.branchId
      ? (branchesForCampus(campus.id).find((b) => b.id === parsed.branchId)?.id ?? null)
      : null;
    return { campusId: campus.id, branchId: branch };
  } catch {
    return defaultScope;
  }
}

export function OrgProvider({ children }: { children: ReactNode }) {
  // Read on mount rather than in the initialiser so SSR and hydration match.
  const [scope, setScope] = useState<OrgScope>(defaultScope);

  useEffect(() => {
    setScope(readStored());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scope));
  }, [scope]);

  const setCampus = useCallback((campusId: string) => {
    setScope({ campusId, branchId: null });
  }, []);

  const setBranch = useCallback((branchId: string | null) => {
    setScope((prev) => {
      if (!branchId) return { ...prev, branchId: null };
      const target = branches.find((b) => b.id === branchId);
      if (!target) return prev;
      return { campusId: target.campusId, branchId: target.id };
    });
  }, []);

  const value = useMemo<OrgContextValue>(() => {
    const campus = campuses.find((c) => c.id === scope.campusId) ?? campuses[0];
    const scoped = branchesForCampus(campus.id);
    const branch = scope.branchId ? (scoped.find((b) => b.id === scope.branchId) ?? null) : null;

    return {
      ...scope,
      campus,
      branch,
      campuses,
      branches: scoped,
      allBranches: branches,
      setCampus,
      setBranch,
      inScope: (item) => {
        if (branch) return item.branchId ? item.branchId === branch.id : item.campusId === campus.id;
        if (item.branchId) return scoped.some((b) => b.id === item.branchId);
        return item.campusId ? item.campusId === campus.id : true;
      },
      scopeLabel: branch ? `${campus.name} · ${branch.name}` : `${campus.name} · All canteens`,
    };
  }, [scope, setCampus, setBranch]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside <OrgProvider>");
  return ctx;
}
