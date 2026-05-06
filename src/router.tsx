import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 60 * 24, // 24h — keep in persisted cache
        retry: 2,
        retryDelay: (i) => Math.min(1000 * 2 ** i, 8000),
        refetchOnWindowFocus: false,
        networkMode: "offlineFirst",
      },
      mutations: { networkMode: "offlineFirst", retry: 1 },
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
