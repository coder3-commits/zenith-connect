import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  Send,
  RefreshCw,
  AlertCircle,
  ArrowLeftRight,
  Phone,
  Wifi,
  Zap,
  Bitcoin,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/ui-kit";
import { CacheStatus } from "@/components/CacheStatus";
import { api, auth, formatNaira } from "@/lib/api";

export const Route = createFileRoute("/transactions")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: TxPage,
});

type FilterKey = "all" | "in" | "out" | "bills" | "crypto";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in", label: "Received" },
  { key: "out", label: "Sent" },
  { key: "bills", label: "Bills" },
  { key: "crypto", label: "Crypto" },
];

function categoryOf(t: any): { key: FilterKey; label: string; Icon: any; tint: string } {
  const desc = String(t.description || t.type || "").toLowerCase();
  const credit = (t.type || "").toLowerCase().includes("credit") || t.direction === "credit";
  if (desc.includes("airtime")) return { key: "bills", label: "Airtime", Icon: Phone, tint: "bg-primary/10 text-primary" };
  if (desc.includes("data")) return { key: "bills", label: "Data", Icon: Wifi, tint: "bg-accent/20 text-accent-foreground" };
  if (desc.includes("electric") || desc.includes("power")) return { key: "bills", label: "Electricity", Icon: Zap, tint: "bg-warning/20 text-warning" };
  if (desc.includes("crypto") || desc.includes("btc") || desc.includes("usdt")) return { key: "crypto", label: "Crypto", Icon: Bitcoin, tint: "bg-primary/10 text-primary" };
  if (credit) return { key: "in", label: "Received", Icon: ArrowDownToLine, tint: "bg-success/15 text-success" };
  return { key: "out", label: "Sent", Icon: Send, tint: "bg-primary/10 text-primary" };
}

function groupByDay(txns: any[]) {
  const out: Record<string, any[]> = {};
  txns.forEach((t) => {
    const d = new Date(t.created_at || t.createdAt || Date.now());
    const today = new Date();
    const yest = new Date(); yest.setDate(today.getDate() - 1);
    let key: string;
    if (d.toDateString() === today.toDateString()) key = "Today";
    else if (d.toDateString() === yest.toDateString()) key = "Yesterday";
    else key = d.toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric" });
    (out[key] ||= []).push(t);
  });
  return out;
}

function TxPage() {
  const q = useQuery({
    queryKey: ["transactions", "all"],
    queryFn: () => api<any>("/wallet/transactions", { query: { limit: 50 } }),
  });
  const list: any[] = q.data?.transactions ?? [];
  const refreshing = q.isFetching;
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((t) => categoryOf(t).key === filter);
  }, [list, filter]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <MobileShell>
      <ScreenHeader
        title="Transactions"
        subtitle={`${list.length} total · pull to refresh`}
        back={false}
        right={
          <button
            onClick={() => q.refetch()}
            disabled={refreshing}
            aria-label="Refresh transactions"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        }
      />
      <div className="px-4 pb-1">
        <CacheStatus dataUpdatedAt={q.dataUpdatedAt} isFetching={refreshing} />
      </div>

      {/* Filter chips */}
      <div className="px-4 pb-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <PullToRefresh refreshing={refreshing} onRefresh={() => q.refetch()}>
        <div className="px-4 pb-6">
          {q.isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl animate-shimmer" />
              ))}
            </div>
          )}

          {!q.isLoading && q.isError && (
            <div className="mt-10 rounded-3xl bg-destructive/10 p-6 text-center text-destructive">
              <AlertCircle className="mx-auto mb-2 h-7 w-7" />
              <p className="text-sm font-semibold">Couldn't load transactions</p>
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
              Icon={ArrowLeftRight}
              title={filter === "all" ? "No transactions yet" : "Nothing to show here"}
              description={filter === "all" ? "Once you fund or pay, your activity will appear here." : "Try a different filter or pull down to refresh."}
            />
          )}

          <div className="space-y-5">
            {Object.entries(grouped).map(([day, items]) => (
              <div key={day}>
                <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{day}</p>
                <div className="divide-y divide-border rounded-3xl bg-card shadow-soft overflow-hidden">
                  {items.map((t: any) => {
                    const cat = categoryOf(t);
                    const credit = cat.key === "in" || (t.type || "").toLowerCase().includes("credit");
                    return (
                      <Link
                        to="/transactions"
                        key={t.id || t.reference}
                        className="flex items-center gap-3 px-4 py-3.5 transition active:bg-muted/60"
                      >
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${cat.tint}`}>
                          <cat.Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold">{t.description || cat.label}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(t.created_at || t.createdAt || Date.now()).toLocaleString("en-NG", {
                              hour: "2-digit", minute: "2-digit",
                            })} · {cat.label}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`tabular text-sm font-semibold ${credit ? "text-success" : "text-foreground"}`}>
                            {credit ? "+" : "-"}{formatNaira(t.amount)}
                          </p>
                          <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                            String(t.status || "success").toLowerCase() === "failed"
                              ? "bg-destructive/15 text-destructive"
                              : String(t.status || "").toLowerCase() === "pending"
                              ? "bg-warning/20 text-warning"
                              : "bg-success/15 text-success"
                          }`}>
                            <span className="h-1 w-1 rounded-full bg-current" />
                            {t.status || "success"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PullToRefresh>
    </MobileShell>
  );
}
