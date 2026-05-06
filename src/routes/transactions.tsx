import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, Send } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api, auth, formatNaira } from "@/lib/api";

export const Route = createFileRoute("/transactions")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: TxPage,
});

function TxPage() {
  const q = useQuery({
    queryKey: ["transactions", "all"],
    queryFn: () => api<any>("/transactions", { query: { limit: 50 } }),
  });
  const list: any[] = q.data?.transactions ?? q.data ?? [];

  return (
    <MobileShell>
      <ScreenHeader title="Transactions" back={false} />
      <div className="px-4 pb-6">
        {q.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-card shadow-card" />
            ))}
          </div>
        )}
        {!q.isLoading && list.length === 0 && (
          <div className="mt-20 text-center text-sm text-muted-foreground">No transactions yet.</div>
        )}
        <div className="space-y-2">
          {list.map((t: any) => {
            const credit = (t.type || "").toLowerCase().includes("credit") || t.direction === "credit";
            return (
              <Link
                to="/transactions"
                key={t.id || t.reference}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  credit ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
                }`}>
                  {credit ? <ArrowDownToLine className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{t.description || t.type || "Transaction"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.created_at || t.createdAt || Date.now()).toLocaleString("en-NG", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${credit ? "text-success" : "text-foreground"}`}>
                    {credit ? "+" : "-"}{formatNaira(t.amount)}
                  </p>
                  <p className="text-[10px] uppercase text-muted-foreground">{t.status || "success"}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
