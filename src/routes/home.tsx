import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { api, auth, formatNaira } from "@/lib/api";

export const Route = createFileRoute("/home")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) {
      throw { redirect: "/login" };
    }
  },
  component: HomePage,
});

const services = [
  { to: "/services/airtime", label: "Airtime", Icon: Phone, tint: "bg-primary/10 text-primary" },
  { to: "/services/data", label: "Data", Icon: Wifi, tint: "bg-accent/20 text-accent-foreground" },
  { to: "/services/electricity", label: "Electricity", Icon: Zap, tint: "bg-warning/20 text-warning" },
  { to: "/services/exam", label: "Exam PIN", Icon: GraduationCap, tint: "bg-secondary text-secondary-foreground" },
  { to: "/services/crypto", label: "Crypto", Icon: Bitcoin, tint: "bg-primary/10 text-primary" },
  { to: "/services", label: "More", Icon: Plus, tint: "bg-muted text-muted-foreground" },
];

function HomePage() {
  const [hideBalance, setHideBalance] = useState(false);
  const navigate = useNavigate();
  const user = auth.getUser();

  const wallet = useQuery({
    queryKey: ["wallet"],
    queryFn: () => api<any>("/wallet"),
  });
  const recent = useQuery({
    queryKey: ["wallet", "transactions", { limit: 5 }],
    queryFn: () => api<any>("/wallet/transactions", { query: { limit: 5 } }),
  });

  const balance = wallet.data?.wallet?.balance ?? wallet.data?.balance ?? 0;
  const txns: any[] = recent.data?.transactions ?? recent.data ?? [];

  return (
    <MobileShell>
      {/* Header card */}
      <section className="bg-gradient-balance px-5 pb-10 pt-12 text-primary-foreground rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 font-display font-bold">
              {(user?.firstName?.[0] || "Z").toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-white/60">Welcome back</p>
              <p className="font-display font-semibold">{user?.firstName || "User"}</p>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/notifications" })}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          </button>
        </div>

        <div className="mt-7">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/60">
            Total balance
            <button onClick={() => setHideBalance((v) => !v)} className="text-white/80">
              {hideBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="mt-1 font-display text-4xl font-extrabold tracking-tight">
            {hideBalance ? "₦ ••••••" : formatNaira(balance)}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <ActionPill to="/wallet/fund" label="Fund" Icon={ArrowDownToLine} />
          <ActionPill to="/wallet/transfer" label="Transfer" Icon={Send} />
          <ActionPill to="/services" label="Pay Bills" Icon={Zap} />
        </div>
      </section>

      {/* Services grid */}
      <section className="px-5 pt-6">
        <h2 className="font-display text-base font-semibold">Quick Services</h2>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {services.map(({ to, label, Icon, tint }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 text-center shadow-card active:scale-95 transition"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tint}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="px-5 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-5 text-primary-foreground">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-2xl" />
          <p className="text-xs uppercase tracking-wider text-white/70">Refer & Earn</p>
          <h3 className="mt-1 font-display text-xl font-bold">Get ₦200 for every friend</h3>
          <p className="mt-1 text-sm text-white/70">Share your code, earn together.</p>
          <Link
            to="/profile"
            className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur"
          >
            Share now <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Recent transactions */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Recent activity</h2>
          <Link to="/transactions" className="text-xs font-semibold text-primary">See all</Link>
        </div>
        <div className="mt-3 divide-y divide-border rounded-2xl bg-card shadow-card">
          {recent.isLoading && Array.from({ length: 4 }).map((_, i) => <TxnSkeleton key={i} />)}
          {!recent.isLoading && txns.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No transactions yet — start by funding your wallet.
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

function ActionPill({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur py-3 text-sm font-semibold ring-1 ring-white/15 active:scale-95 transition"
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

function TxnRow({ t }: { t: any }) {
  const credit = (t.type || "").toLowerCase().includes("credit") || (t.direction === "credit");
  return (
    <div className="flex items-center gap-3 p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          credit ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
        }`}
      >
        {credit ? <ArrowDownToLine className="h-4 w-4" /> : <Send className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold">{t.description || t.type || "Transaction"}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(t.created_at || t.createdAt || Date.now()).toLocaleString("en-NG", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>
      <div className={`text-sm font-semibold ${credit ? "text-success" : "text-foreground"}`}>
        {credit ? "+" : "-"}
        {formatNaira(t.amount)}
      </div>
    </div>
  );
}

function TxnSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-muted" />
      <div className="flex-1">
        <div className="h-3 w-3/5 rounded bg-muted" />
        <div className="mt-2 h-2 w-2/5 rounded bg-muted" />
      </div>
      <div className="h-3 w-16 rounded bg-muted" />
    </div>
  );
}
