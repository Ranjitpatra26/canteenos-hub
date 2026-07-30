import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { captureError } from "@/lib/monitoring";

interface Props {
  children: ReactNode;
  /** Shown in the fallback so the user knows what failed. */
  label?: string;
  fallback?: (reset: () => void, error: Error) => ReactNode;
}

interface State {
  error: Error | null;
}

const RELOAD_KEY = "canteenos:chunk-reload";

/** True for "stale bundle" failures that a reload fixes. */
function isStaleChunkError(error: Error) {
  return /dynamically imported module|Loading chunk|Importing a module script failed|Failed to fetch dynamically/i.test(
    `${error?.name} ${error?.message}`,
  );
}

/**
 * Catches render/runtime errors in a subtree so one broken widget never takes
 * down a whole workspace page. Pair with the router error components which
 * handle loader-level failures.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // A stale lazy chunk (new deploy while the tab was open) is not a real bug —
    // recover silently by reloading once instead of showing a scary panel.
    if (isStaleChunkError(error) && typeof window !== "undefined") {
      try {
        if (!sessionStorage.getItem(RELOAD_KEY)) {
          sessionStorage.setItem(RELOAD_KEY, "1");
          window.location.reload();
          return;
        }
      } catch {
        /* storage blocked — fall through to the fallback UI */
      }
    }
    reportLovableError(error, {
      boundary: "react_error_boundary",
      label: this.props.label,
      componentStack: info.componentStack,
    });
    captureError(error, {
      boundary: "react_error_boundary",
      label: this.props.label,
    });
  }


  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset, error);

    return (
      <div
        role="alert"
        className="glass-panel flex flex-col items-center gap-3 rounded-2xl border border-destructive/25 p-8 text-center"
      >
        <span className="grid size-11 place-items-center rounded-2xl bg-destructive/12 text-destructive">
          <AlertTriangle className="size-5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {this.props.label ? `${this.props.label} couldn't load` : "Something went wrong"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            This section hit an unexpected error. The rest of the page still works.
          </p>
        </div>
        <Button size="sm" variant="outline" className="rounded-full" onClick={this.reset}>
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      </div>
    );
  }
}
