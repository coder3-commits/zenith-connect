import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, RefreshCw, AlertCircle } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PullToRefresh } from "@/components/PullToRefresh";
import { api, auth } from "@/lib/api";

export const Route = createFileRoute("/notifications")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: NotifPage,
});

function NotifPage() {
  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<any>("/notifications"),
  });
  const list: any[] = q.data?.notifications ?? [];
  const refreshing = q.isFetching;

  return (
    <MobileShell hideNav>
      <ScreenHeader
        title="Notifications"
        right={
          <button
            onClick={() => q.refetch()}
            disabled={refreshing}
            aria-label="Refresh notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground active:scale-95 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        }
      />
      <PullToRefresh refreshing={refreshing} onRefresh={() => q.refetch()}>
        <div className="px-4 space-y-2 pb-6">
          {q.isLoading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-card" />
          ))}
          {!q.isLoading && q.isError && (
            <div className="mt-10 rounded-2xl bg-destructive/10 p-5 text-center text-sm text-destructive">
              <AlertCircle className="mx-auto mb-2 h-6 w-6" />
              <p className="font-semibold">Couldn't load notifications</p>
              <p className="mt-1 text-xs text-destructive/80">{(q.error as any)?.message || "Network error"}</p>
              <button
                onClick={() => q.refetch()}
                className="mt-3 rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground"
              >
                Try again
              </button>
            </div>
          )}
          {!q.isLoading && !q.isError && list.length === 0 && (
            <div className="mt-20 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              You're all caught up.
              <div className="mt-4 text-xs">Pull down to refresh</div>
            </div>
          )}
          {list.map((n: any) => (
            <div key={n.id} className="rounded-2xl bg-card p-4 shadow-card">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
              <p className="mt-2 text-[10px] uppercase text-muted-foreground">
                {new Date(n.created_at || n.createdAt || Date.now()).toLocaleString("en-NG")}
              </p>
            </div>
          ))}
        </div>
      </PullToRefresh>
    </MobileShell>
  );
}
