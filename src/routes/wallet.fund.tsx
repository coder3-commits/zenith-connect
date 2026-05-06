import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Building2 } from "lucide-react";
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
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  return (
    <MobileShell hideNav>
      <ScreenHeader title="Fund wallet" />
      <div className="px-4 space-y-5">
        <div className="rounded-3xl bg-gradient-balance p-5 text-primary-foreground">
          <p className="text-xs uppercase tracking-wider text-white/70">Transfer to your account</p>
          <p className="mt-2 font-display text-3xl font-extrabold">{a?.accountNumber || "Pending KYC"}</p>
          <p className="text-sm text-white/80">{a?.bankName} • {a?.accountName}</p>
          {a && (
            <button
              onClick={() => copy(a.accountNumber)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur"
            >
              <Copy className="h-4 w-4" /> Copy account number
            </button>
          )}
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">How it works</p>
          </div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Open your bank app and transfer to the account above.</li>
            <li>Funds reflect instantly in your Zentrix wallet.</li>
            <li>No fees on incoming transfers.</li>
          </ol>
        </div>
      </div>
    </MobileShell>
  );
}
