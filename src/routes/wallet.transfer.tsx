import { createFileRoute } from "@tanstack/react-router";
import { Construction, Sparkles, Bell } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/wallet/transfer")({ component: TransferPage });

function TransferPage() {
  return (
    <MobileShell hideNav>
      <ScreenHeader title="Send Money" subtitle="To any Nigerian bank" />
      <div className="px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-hero p-7 text-primary-foreground shadow-glow">
          <div className="absolute inset-0 bg-gradient-mesh opacity-70" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl animate-drift" />
          <div className="relative text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl glass-dark">
              <Construction className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">Coming soon</h2>
            <p className="mt-2 text-sm text-white/75">
              Bank transfers will go live as soon as your provider integration is wired.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Feature label="Instant" />
              <Feature label="No fees" />
              <Feature label="Saved beneficiaries" />
              <Feature label="Smart limits" />
            </div>

            <button
              disabled
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-fab opacity-90"
            >
              <Bell className="h-4 w-4" /> Notify me when live
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-card p-4 shadow-soft">
          <Sparkles className="mt-0.5 h-4.5 w-4.5 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            In the meantime, you can fund your wallet, top up airtime/data, pay electricity bills, and trade crypto.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <div className="rounded-2xl glass-dark px-3 py-2.5 text-xs font-semibold">
      {label}
    </div>
  );
}
