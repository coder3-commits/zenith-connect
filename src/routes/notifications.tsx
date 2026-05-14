import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bell, RefreshCw, AlertCircle, ShieldAlert, Megaphone, Activity } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/ui-kit";
import { CacheStatus } from "@/components/CacheStatus";
import { api, auth } from "@/lib/api";

export const Route = createFileRoute("/notifications")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: NotifPage,
});

type Tab = "all" | "activity" | "security" | "promo";

function categorize(n: any): Tab {
  const text = `${n.title || ""} ${n.body || ""}`.toLowerCase();
  if (text.includes("login") || text.includes("password") || text.includes("security") || text.includes("pin")) return "security";
  if (text.includes("promo") || text.includes("offer") || text.includes("bonus") || text.includes("referral")) return "promo";
  return "activity";
}

function timeAgo(ts: number) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function NotifPage() {
  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<any>("/notifications"),
  });
  const list: any[] = q.data?.notifications ?? [];
  const unread = q.data?.unreadCount ?? 0;
  const refreshing = q.isFetching;
  const [tab, setTab] = useState<Tab>("all");

  const filtered = useMemo(
    () => (tab === "all" ? list : list.filter((n) => categorize(n) === tab)),
    [list, tab],
  );

  const tabs: { key: Tab; label: string; Icon: any }[] = [
    { key: "all", label: "All", Icon: Bell },
    { key: "activity", label: "Activity", Icon: Activity },
    { key: "security", label: "Security", Icon: ShieldAlert },
    { key: "promo", label: "Promo", Icon: Megaphone },
  ];

  return (
    <MobileShell hideNav>
      <ScreenHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : "You're all caught up"}
        right={
          <button
            onClick={() => q.refetch()}
            disabled={refreshing}
            aria-label="Refresh notifications"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        }
      />
      <div className="px-4 pb-1">
        <CacheStatus dataUpdatedAt={q.dataUpdatedAt} isFetching={refreshing} />
      </div>

      <div className="px-4 pb-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                tab === key ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-secondary-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <PullToRefresh refreshing={refreshing} onRefresh={() => q.refetch()}>
        <div className="px-4 pb-6 space-y-2">
          {q.isLoading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-shimmer" />
          ))}

          {!q.isLoading && q.isError && (
            <div className="mt-10 rounded-3xl bg-destructive/10 p-6 text-center text-destructive">
              <AlertCircle className="mx-auto mb-2 h-7 w-7" />
              <p className="text-sm font-semibold">Couldn't load notifications</p>
              <p className="mt-1 text-xs text-destructive/80">{(q.error as any)?.message || "Network error"}</p>
              <button
                onClick={() => q.refetch()}
                className="mt-4 rounded-full bg-destructive px-5 py-2 text-xs font-semibold text-destructive-foreground"
              >
                Try again
              </button>
            </div>
          )}

          {!q.isLoading && !q.isError && filtered.length === 0 && (
            <EmptyState
              Icon={Bell}
              title="You're all caught up"
              description="When something important happens, you'll see it here."
            />
          )}

          {filtered.map((n: any) => {
            const cat = categorize(n);
            const ts = new Date(n.created_at || n.createdAt || Date.now()).getTime();
            const isUnread = n.read === false || n.is_read === false;
            const tone =
              cat === "security" ? "bg-destructive/10 text-destructive" :
              cat === "promo" ? "bg-accent/20 text-accent-foreground" :
              "bg-primary/10 text-primary";
            const Icon = cat === "security" ? ShieldAlert : cat === "promo" ? Megaphone : Activity;
            return (
              <div
                key={n.id}
                className={`relative flex gap-3 rounded-2xl bg-card p-4 shadow-soft ${
                  isUnread ? "ring-1 ring-primary/20" : ""
                }`}
              >
                {isUnread && <span className="absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />}
                <div className={`ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{timeAgo(ts)}</p>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </PullToRefresh>
    </MobileShell>
  );
}
