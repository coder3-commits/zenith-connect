import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ApiError } from "@/types/api";
import { formatApiError } from "@/lib/errors";
import { routeTree } from "./routeTree.gen";

function shouldRetry(failureCount: number, error: unknown) {
  // Don't retry on auth / client errors.
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403 || error.status === 404) return false;
    if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
      return false;
    }
  }
  return failureCount < 2;
}

export const getRouter = () => {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only surface background errors when there's no component-level handler
        // and the query has actually been observed (i.e. user-visible).
        if (query.meta?.silent) return;
        if (query.getObserversCount() === 0) return;
        const status = error instanceof ApiError ? error.status : 0;
        if (status === 401) return; // handled globally via setOn401Handler
        if (!navigator.onLine) return; // offline-first: don't yell about cached data
        toast.error(formatApiError(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.options.onError) return; // mutation owns the error UX
        toast.error(formatApiError(error));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 60 * 24,
        retry: shouldRetry,
        retryDelay: (i) => Math.min(1000 * 2 ** i, 8000),
        refetchOnWindowFocus: false,
        networkMode: "offlineFirst",
      },
      mutations: {
        networkMode: "offlineFirst",
        retry: (failureCount, error) => {
          // Never retry financial mutations on the client — server-side
          // idempotency handles legitimate retries when the user opts in.
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 1;
        },
      },
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
