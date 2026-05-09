import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Building2, ShieldCheck, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api, auth } from "@/lib/api";

export const Route = createFileRoute("/wallet/fund")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: FundPage,
});

function FundPage() {
  const va = useQuery({
    queryKey: ["virtual-account"],
    queryFn: () => api<any>("/wallet/virtual-account"),
  });
  const a = va.data?.virtualAccount;
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied to clipboard"); };

  return (
    <MobileShell hideNav>
      <ScreenHeader title="Fund wallet" subtitle="Instant · Zero fees" />
      <div className="px-4 space-y-5">
        {/* Account card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-balance p-6 text-primary-foreground shadow-glow">
          <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent/25 blur-3xl animate-drift" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-accent" /> Your funding account
              </span>
              <span className="text-[10px] uppercase tracking-wider text-white/60">{a?.bankName || "—"}</span>
            </div>
            <p className="mt-5 font-display text-[36px] font-extrabold tracking-tight tabular">
              {a?.accountNumber || (va.isLoading ? "•••• ••• ••" : "Pending KYC")}
            </p>
            <p className="mt-1 text-sm text-white/75">{a?.accountName || "Your account name"}</p>
            {a && (
              <button
                onClick={() => copy(a.accountNumber)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-fab transition active:scale-95"
              >
                <Copy className="h-4 w-4" /> Copy account number
              </button>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm font-semibold">How it works</p>
          </div>
          <ol className="mt-4 space-y-3">
            {[
              "Open your bank app and start a transfer",
              "Send any amount to the account number above",
              "Funds reflect in your Zentrix wallet instantly",
            ].map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Trust */}
        <div className="flex items-start gap-3 rounded-2xl bg-success/10 p-4 text-success">
          <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0" />
          <p className="text-xs leading-relaxed">
            Your funding account is unique to you. Bank-grade encryption · 100% reconciled.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-secondary p-4 text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            Tip: Save this account in your bank app as a beneficiary for one-tap funding next time.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
