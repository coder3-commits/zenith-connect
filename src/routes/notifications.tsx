import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
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
  const unreadCount: number = q.data?.unreadCount ?? 0;
  void unreadCount;

  return (
    <MobileShell hideNav>
      <ScreenHeader title="Notifications" />
      <div className="px-4 space-y-2">
        {q.isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-card" />
        ))}
        {!q.isLoading && list.length === 0 && (
          <div className="mt-20 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            You're all caught up.
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
    </MobileShell>
  );
}
