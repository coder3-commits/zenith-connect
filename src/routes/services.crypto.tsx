import { createFileRoute } from "@tanstack/react-router";
import { Bitcoin } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/services/crypto")({ component: CryptoPage });

const coins = [
  { sym: "BTC", name: "Bitcoin", color: "text-warning" },
  { sym: "USDT", name: "Tether", color: "text-success" },
  { sym: "SOL", name: "Solana", color: "text-primary" },
  { sym: "TON", name: "Toncoin", color: "text-accent-foreground" },
];

function CryptoPage() {
  return (
    <MobileShell hideNav>
      <ScreenHeader title="Crypto" />
      <div className="px-4 space-y-3">
        <div className="rounded-3xl bg-gradient-brand p-5 text-primary-foreground">
          <p className="text-xs uppercase tracking-wider text-white/70">Trade crypto</p>
          <p className="mt-1 font-display text-2xl font-bold">Buy & sell at live rates</p>
          <p className="mt-2 text-sm text-white/70">Sell instantly to your Zentrix wallet.</p>
        </div>
        <div className="divide-y divide-border rounded-2xl bg-card shadow-card">
          {coins.map((c) => (
            <div key={c.sym} className="flex items-center gap-3 p-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-secondary ${c.color}`}>
                <Bitcoin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.sym}</p>
              </div>
              <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                Trade
              </button>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
