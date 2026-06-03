import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Wifi, Zap, GraduationCap, Bitcoin, Send, ChevronRight, ArrowDownToLine, ScanLine, QrCode, Search, Building2 } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/services")({ component: ServicesPage });

const all = [
  { to: "/services/airtime", label: "Airtime", desc: "All Nigerian networks", Icon: Phone, group: "Bills", grad: "from-primary/15 to-primary/5", icl: "text-primary" },
  { to: "/services/data", label: "Data Bundles", desc: "MTN · Airtel · Glo · 9mobile", Icon: Wifi, group: "Bills", grad: "from-accent/25 to-accent/5", icl: "text-accent-foreground" },
  { to: "/services/electricity", label: "Electricity", desc: "Prepaid & postpaid", Icon: Zap, group: "Bills", grad: "from-warning/25 to-warning/5", icl: "text-warning" },
  { to: "/services/exam", label: "Exam PINs", desc: "WAEC, NECO, JAMB", Icon: GraduationCap, group: "Bills", grad: "from-secondary to-muted", icl: "text-secondary-foreground" },
  { to: "/wallet/fund", label: "Fund Wallet", desc: "Bank transfer · Card", Icon: ArrowDownToLine, group: "Money", grad: "from-success/20 to-success/5", icl: "text-success" },
  { to: "/dashboard/virtual-account", label: "Virtual Account", desc: "Dedicated account number", Icon: Building2, group: "Money", grad: "from-primary/10 to-accent/10", icl: "text-primary" },
  { to: "/wallet/transfer", label: "Send Money", desc: "To any Nigerian bank", Icon: Send, group: "Money", grad: "from-primary/15 to-primary/5", icl: "text-primary" },
  { to: "/services/crypto", label: "Buy / Sell Crypto", desc: "BTC · USDT · SOL · TON", Icon: Bitcoin, group: "Money", grad: "from-primary/15 to-accent/15", icl: "text-primary" },
];

function ServicesPage() {
  const [q, setQ] = useState("");
  const filtered = all.filter((s) => !q || s.label.toLowerCase().includes(q.toLowerCase()) || s.desc.toLowerCase().includes(q.toLowerCase()));
  const groups = ["Bills", "Money"] as const;

  return (
    <MobileShell>
      <ScreenHeader
        title="Services"
        subtitle="Pay bills · Send money · Trade"
        back={false}
        right={
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground" aria-label="Scan QR">
            <QrCode className="h-4.5 w-4.5" />
          </button>
        }
      />

      <div className="px-4 space-y-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services"
            className="h-12 w-full rounded-2xl border border-input bg-card pl-11 pr-4 text-sm shadow-soft outline-none focus:border-primary"
          />
        </div>

        {/* Featured */}
        <Link
          to="/services/crypto"
          className="relative block overflow-hidden rounded-3xl bg-gradient-brand p-5 text-primary-foreground shadow-card"
        >
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-accent/30 blur-2xl" />
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">New · Web3</p>
          <h3 className="mt-1 font-display text-xl font-bold">Trade crypto in 60 seconds</h3>
          <p className="mt-1 text-sm text-white/75">Live rates · Instant settlement to wallet</p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold">
            Get started <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        {groups.map((g) => {
          const items = filtered.filter((i) => i.group === g);
          if (!items.length) return null;
          return (
            <div key={g}>
              <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {g}
              </p>
              <div className="grid grid-cols-2 gap-3 stagger">
                {items.map(({ to, label, desc, Icon, grad, icl }) => (
                  <Link
                    key={label}
                    to={to}
                    className="rounded-3xl bg-card p-4 shadow-soft transition active:scale-95"
                  >
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} ${icl}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl bg-card p-10 text-center">
            <ScanLine className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No services found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different keyword</p>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
