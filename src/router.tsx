import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // Fresh client per request — a module-level singleton would leak cached
  // user data between SSR requests.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Catalogue/analytics reads change slowly; realtime pushes keep orders fresh.
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const message = error instanceof Error ? error.message : "";
          // Never retry auth/permission failures — they will never succeed.
          if (/401|403|jwt|row-level security|permission denied/i.test(message)) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: 0 },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
