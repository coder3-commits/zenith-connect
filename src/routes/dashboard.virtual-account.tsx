import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Building2, Copy, Loader2, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { VirtualAccountCard } from "@/components/virtual-account/VirtualAccountCard";
import { CacheStatus } from "@/components/CacheStatus";
import { api, auth, ApiError } from "@/lib/api";
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
    // Serve last persisted response instantly, then revalidate in the background.
    staleTime: 1000 * 60 * 5, // 5 min — treat as fresh on quick revisits
    gcTime: 1000 * 60 * 60 * 24, // 24h — survives reloads via PersistQueryClient
    networkMode: "offlineFirst",
    retry: (count, err) => {
      if (err instanceof ApiError && err.status === 404) return false;
      return count < 1;
    },
  });

  const account = pickAccount(query.data);
  // A 404 means "no account yet" — that's the empty state, not a failure.
  const isMissing = query.isError && query.error instanceof ApiError && query.error.status === 404;
  const hasFetchError = query.isError && !isMissing;

  // Surface fetch failures (network / 5xx / auth) as a toast — fire once per error.
  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (!hasFetchError) {
      lastErrorRef.current = null;
      return;
    }
    const msg = formatApiError(query.error);
    if (lastErrorRef.current === msg) return;
    lastErrorRef.current = msg;
    toast.error(msg, {
      description: "We couldn't load your virtual account. Please try again.",
    });
  }, [hasFetchError, query.error]);

  const generate = useSafeMutation<VirtualAccountResponse, void>(
    ({ idempotencyKey }) =>
      api<VirtualAccountResponse>("/virtual-account/create", { method: "POST", idempotencyKey }),
    {
      onSuccess: (data) => {
        qc.setQueryData(["virtual-account"], data);
        toast.success("Virtual account created", {
          description: "You can now receive bank transfers into your wallet.",
        });
      },
      onError: (err) =>
        toast.error(formatApiError(err), {
          description: "We couldn't generate your account. Please try again.",
        }),
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

      <div className="px-4 pb-1">
        <CacheStatus dataUpdatedAt={query.dataUpdatedAt} isFetching={query.isFetching} />
      </div>

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
        ) : hasFetchError ? (
          <div className="rounded-3xl bg-card p-6 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <RefreshCw className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold">Couldn't load your account</p>
            <p className="mt-1 text-sm text-muted-foreground">{formatApiError(query.error)}</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              className="mt-5 h-12 w-full rounded-2xl text-sm font-semibold"
            >
              {query.isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Retrying…
                </>
              ) : (
                <>Try again</>
              )}
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold">No virtual account yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate a dedicated bank account number linked to your wallet.
            </p>
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
