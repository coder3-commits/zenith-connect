import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { VirtualAccountCard } from "@/components/virtual-account/VirtualAccountCard";
import { api, auth } from "@/lib/api";
import { useSafeMutation } from "@/hooks/queries/useSafeMutation";
import { formatApiError } from "@/lib/errors";

export const Route = createFileRoute("/dashboard/virtual-account")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: VirtualAccountPage,
});

type VirtualAccount = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

type VirtualAccountResponse = {
  virtualAccount?: VirtualAccount | null;
} & Partial<VirtualAccount>;

function pickAccount(res: VirtualAccountResponse | undefined | null): VirtualAccount | null {
  if (!res) return null;
  const va = res.virtualAccount ?? null;
  if (va && va.accountNumber) return va;
  if (res.accountNumber && res.bankName && res.accountName) {
    return { bankName: res.bankName, accountNumber: res.accountNumber, accountName: res.accountName };
  }
  return null;
}

function VirtualAccountPage() {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const query = useQuery({
    queryKey: ["virtual-account"],
    queryFn: () => api<VirtualAccountResponse>("/virtual-account"),
    retry: 1,
  });

  const account = pickAccount(query.data);

  const generate = useSafeMutation<VirtualAccountResponse, void>(
    ({ idempotencyKey }) =>
      api<VirtualAccountResponse>("/virtual-account/create", { method: "POST", idempotencyKey }),
    {
      onSuccess: (data) => {
        qc.setQueryData(["virtual-account"], data);
        toast.success("Virtual account created");
      },
      onError: (err) => toast.error(formatApiError(err)),
    },
  );

  const onCopy = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Please try again.");
    }
  };

  return (
    <MobileShell hideNav>
      <ScreenHeader
        title="Virtual Account"
        subtitle="Receive money directly into your Zentrix wallet via bank transfer."
      />

      <div className="px-4 space-y-5">
        {query.isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-3xl bg-card shadow-soft">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : account ? (
          <>
            <VirtualAccountCard
              bankName={account.bankName}
              accountNumber={account.accountNumber}
              accountName={account.accountName}
            />
            <Button
              type="button"
              onClick={onCopy}
              variant="secondary"
              className="h-12 w-full rounded-2xl text-sm font-semibold"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy account number
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Transfers to this account are processed within minutes. Minimum deposit: ₦100.
            </p>
          </>
        ) : (
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold">No virtual account yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate a dedicated bank account number linked to your wallet.
            </p>
            {query.isError && (
              <p className="mt-3 text-xs text-destructive">{formatApiError(query.error)}</p>
            )}
            <Button
              type="button"
              onClick={() => generate.safeMutate()}
              disabled={generate.isPending}
              className="mt-5 h-12 w-full rounded-2xl text-sm font-semibold"
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>Generate Account Number</>
              )}
            </Button>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
