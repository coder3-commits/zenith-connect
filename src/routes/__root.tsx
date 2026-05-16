import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { setOn401Handler } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth.api";
import { queryKeys } from "@/hooks/queries/keys";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">This page doesn't exist.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" },
      { name: "theme-color", content: "#2a1f7a" },
      { title: "Zentrix — Pay, Buy, Send" },
      { name: "description", content: "Zentrix: airtime, data, electricity, transfers and crypto, built for Nigeria." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthBootstrap({ queryClient }: { queryClient: any }) {
  // Hydrate auth store from storage, wire the global 401 handler, and
  // validate the session in the background.
  useEffect(() => {
    useAuthStore.getState().hydrate();
    setOn401Handler(() => {
      useAuthStore.getState().logout();
      queryClient.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    });
    if (useAuthStore.getState().token) {
      queryClient
        .prefetchQuery({
          queryKey: queryKeys.auth.me(),
          queryFn: async () => {
            const u = await authApi.me();
            if (u) useAuthStore.getState().setUser(u);
            return u;
          },
          meta: { silent: true },
        })
        .catch(() => undefined);
    }
  }, [queryClient]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Persist React Query cache to localStorage so users see data instantly
  // and on poor / no network. Skip during SSR.
  if (typeof window !== "undefined") {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: "zentrix.cache.v1",
      throttleTime: 1000,
    });
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }}
      >
        <AuthBootstrap queryClient={queryClient} />
        <Outlet />
        <Toaster position="top-center" richColors closeButton />
      </PersistQueryClientProvider>
    );
  }
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
