import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bell,
  Eye,
  EyeOff,
  Phone,
  Wifi,
  Zap,
  Bitcoin,
  Send,
  Plus,
  ArrowDownToLine,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { api, auth, formatNaira } from "@/lib/api";
import { AmountDisplay } from "@/components/ui-kit";
import { CacheStatus } from "@/components/CacheStatus";

export const Route = createFileRoute("/home")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: HomePage,
});

const services = [
  { to: "/services/airtime", label: "Airtime", Icon: Phone, gradient: "from-primary/15 to-primary/5", iconCls: "text-primary" },
  { to: "/services/data", label: "Data", Icon: Wifi, gradient: "from-accent/25 to-accent/5", iconCls: "text-accent-foreground" },
  { to: "/services/electricity", label: "Power", Icon: Zap, gradient: "from-warning/25 to-warning/5", iconCls: "text-warning" },
  { to: "/services/exam", label: "Exam PIN", Icon: GraduationCap, gradient: "from-secondary to-muted", iconCls: "text-secondary-foreground" },
  { to: "/services/crypto", label: "Crypto", Icon: Bitcoin, gradient: "from-primary/15 to-accent/15", iconCls: "text-primary" },
  { to: "/services", label: "More", Icon: Plus, gradient: "from-muted to-secondary", iconCls: "text-muted-foreground" },
];

function HomePage() {
  const [hideBalance, setHideBalance] = useState(false);
  const navigate = useNavigate();
  const user = auth.getUser();

  const wallet = useQuery({ queryKey: ["wallet"], queryFn: () => api<any>("/wallet") });
  const recent = useQuery({
    queryKey: ["wallet", "transactions", { limit: 5 }],
    queryFn: () => api<any>("/wallet/transactions", { query: { limit: 5 } }),
  });

  const balance = parseFloat(wallet.data?.wallet?.balance ?? "0");
  const txns: any[] = recent.data?.transactions ?? [];

  return (
    <MobileShell>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-balance px-5 pb-12 pt-12 text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-mesh opacity-70" />
        <div className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl animate-drift" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl glass-dark font-display font-bold">
              {(user?.firstName?.[0] || "Z").toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success ring-2 ring-[var(--primary-deep)]" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/65">Good day,</p>
              <p className="font-display text-sm font-semibold">{user?.firstName || "User"} 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-2xl glass-dark text-white/90" aria-label="Scan">
              <ScanLine className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => navigate({ to: "/notifications" })}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl glass-dark"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-[var(--primary-deep)]" />
            </button>
          </div>
        </div>

        {/* Wallet card */}
        <div className="relative mt-8">
          <div className="rounded-3xl glass-dark p-5 shadow-glow">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                <Sparkles className="h-3 w-3 text-accent" /> Total balance
              </span>
              <button onClick={() => setHideBalance((v) => !v)} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10">
                {hideBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-3 font-display text-[40px] font-extrabold leading-none">
              <AmountDisplay value={balance} hidden={hideBalance} />
            </p>
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-[11px] text-white/55">Available · NGN</p>
              <CacheStatus dataUpdatedAt={wallet.dataUpdatedAt} isFetching={wallet.isFetching} />
            </div>

            <div className="mt-5 flex gap-2">
              <MiniStat Icon={TrendingUp} label="In" value="₦0" tone="success" />
              <MiniStat Icon={TrendingDown} label="Out" value="₦0" tone="warn" />
            </div>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-3 gap-2.5">
          <ActionPill to="/wallet/fund" label="Fund" Icon={ArrowDownToLine} />
          <ActionPill to="/wallet/transfer" label="Send" Icon={Send} highlight />
          <ActionPill to="/services" label="Pay" Icon={Zap} />
        </div>
      </section>

      {/* Services */}
      <section className="px-5 pt-7">
        <div className="flex items-end justify-between pb-3">
          <div>
            <h2 className="font-display text-base font-semibold tracking-tight">Quick services</h2>
            <p className="text-[11px] text-muted-foreground">Tap to pay in seconds</p>
          </div>
          <Link to="/services" className="text-xs font-semibold text-primary">All</Link>
        </div>
        <div className="grid grid-cols-3 gap-3 stagger">
          {services.map(({ to, label, Icon, gradient, iconCls }) => (
            <Link
              key={label}
              to={to}
              className="group flex flex-col items-center gap-2 rounded-2xl bg-card p-3 text-center shadow-soft transition active:scale-95"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} ${iconCls}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo */}
      <section className="px-5 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-5 text-primary-foreground shadow-card">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-accent/30 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">Refer & Earn</p>
          <h3 className="mt-1 font-display text-xl font-bold">Get ₦200 per friend</h3>
          <p className="mt-1 text-sm text-white/70">Share your code, earn together.</p>
          <Link
            to="/profile"
            className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur"
          >
            Share now <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Recent */}
      <section className="px-5 pt-7">
        <div className="flex items-center justify-between pb-3">
          <h2 className="font-display text-base font-semibold tracking-tight">Recent activity</h2>
          <Link to="/transactions" className="text-xs font-semibold text-primary">See all</Link>
        </div>
        <div className="divide-y divide-border rounded-3xl bg-card shadow-soft overflow-hidden">
          {recent.isLoading && Array.from({ length: 4 }).map((_, i) => <TxnSkeleton key={i} />)}
          {!recent.isLoading && txns.length === 0 && (
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Send className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold">No activity yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Fund your wallet to get started</p>
            </div>
          )}
          {txns.map((t: any) => (
            <TxnRow key={t.id || t.reference} t={t} />
          ))}
        </div>
      </section>
    </MobileShell>
  );
}

function MiniStat({ Icon, label, value, tone }: { Icon: any; label: string; value: string; tone: "success" | "warn" }) {
  const cls = tone === "success" ? "text-accent" : "text-warning";
  return (
    <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white/5 px-3 py-2">
      <span className={`flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 ${cls}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="leading-tight">
        <p className="text-[9px] uppercase tracking-wider text-white/55">{label}</p>
        <p className="tabular text-xs font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ActionPill({
  to, label, Icon, highlight = false,
}: {
  to: string; label: string; Icon: React.ComponentType<{ className?: string }>; highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition active:scale-95 ${
        highlight
          ? "bg-accent text-accent-foreground shadow-fab"
          : "glass-dark text-white"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

function TxnRow({ t }: { t: any }) {
  const credit = (t.type || "").toLowerCase().includes("credit") || (t.direction === "credit");
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          credit ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
        }`}
      >
        {credit ? <ArrowDownToLine className="h-4.5 w-4.5" /> : <Send className="h-4.5 w-4.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold">{t.description || t.type || "Transaction"}</p>
        <p className="text-[11px] text-muted-foreground">
          {new Date(t.created_at || t.createdAt || Date.now()).toLocaleString("en-NG", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>
      <div className="text-right">
        <p className={`tabular text-sm font-semibold ${credit ? "text-success" : "text-foreground"}`}>
          {credit ? "+" : "-"}{formatNaira(t.amount)}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.status || "success"}</p>
      </div>
    </div>
  );
}

function TxnSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="h-11 w-11 rounded-2xl animate-shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/5 rounded animate-shimmer" />
        <div className="h-2 w-2/5 rounded animate-shimmer" />
      </div>
      <div className="h-3 w-16 rounded animate-shimmer" />
    </div>
  );
}
