import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bitcoin, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Sparkline } from "@/components/ui-kit";
import { formatNaira } from "@/lib/api";

export const Route = createFileRoute("/services/crypto")({ component: CryptoPage });

const COINS = [
  { sym: "BTC", name: "Bitcoin", price: 96_500_000, change: 2.3, bg: "bg-coin-btc" },
  { sym: "USDT", name: "Tether", price: 1_650, change: 0.1, bg: "bg-coin-usdt" },
  { sym: "ETH", name: "Ethereum", price: 5_200_000, change: -1.4, bg: "bg-coin-eth" },
  { sym: "SOL", name: "Solana", price: 285_000, change: 4.8, bg: "bg-coin-sol" },
  { sym: "TON", name: "Toncoin", price: 8_400, change: -0.6, bg: "bg-coin-ton" },
];

function genSpark(seed: number, trend: number) {
  const arr: number[] = [];
  let v = 50;
  for (let i = 0; i < 20; i++) {
    v += Math.sin(seed + i * 0.6) * 4 + trend * 0.4;
    arr.push(v);
  }
  return arr;
}

function CryptoPage() {
  const [tab, setTab] = useState<"market" | "portfolio">("market");
  const sparks = useMemo(() => COINS.map((c, i) => genSpark(i + 1, c.change)), []);

  return (
    <MobileShell hideNav>
      <ScreenHeader title="Crypto" subtitle="Live Nigerian Naira rates" />
      <div className="px-4 space-y-4">
        {/* Hero portfolio card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-5 text-primary-foreground shadow-card">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-2xl animate-drift" />
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">Portfolio value</p>
          <p className="mt-2 font-display text-3xl font-extrabold tabular">{formatNaira(0)}</p>
          <p className="mt-1 text-xs text-white/65">Trade BTC, USDT, ETH, SOL & TON instantly</p>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-foreground shadow-fab">
              <ArrowDownRight className="mr-1 inline h-4 w-4" /> Buy
            </button>
            <button className="flex-1 rounded-full bg-white/15 py-2.5 text-sm font-semibold backdrop-blur">
              <ArrowUpRight className="mr-1 inline h-4 w-4" /> Sell
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
          {(["market", "portfolio"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl py-2 text-xs font-semibold capitalize transition ${
                tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Market */}
        {tab === "market" && (
          <div className="rounded-3xl bg-card shadow-soft divide-y divide-border overflow-hidden stagger">
            {COINS.map((c, i) => {
              const up = c.change >= 0;
              return (
                <div key={c.sym} className="flex items-center gap-3 p-4">
                  <div className={`relative flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-soft ${c.bg}`}>
                    <Bitcoin className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.sym}</p>
                  </div>
                  <div className={up ? "text-success" : "text-destructive"}>
                    <Sparkline data={sparks[i]} color="currentColor" />
                  </div>
                  <div className="text-right">
                    <p className="tabular text-sm font-semibold">{formatNaira(c.price)}</p>
                    <p className={`flex items-center justify-end gap-0.5 text-[11px] font-semibold ${up ? "text-success" : "text-destructive"}`}>
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {up ? "+" : ""}{c.change.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "portfolio" && (
          <div className="rounded-3xl bg-card p-10 text-center shadow-soft">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bitcoin className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold">No assets yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Buy your first coin to start your portfolio</p>
          </div>
        )}

        <p className="px-2 text-center text-[10px] text-muted-foreground">
          Rates indicative · Final price shown at checkout
        </p>
      </div>
    </MobileShell>
  );
}
