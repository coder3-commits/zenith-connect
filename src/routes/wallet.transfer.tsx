import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Search, Wallet } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PinDialog } from "@/components/PinDialog";
import { Receipt } from "@/components/Receipt";
import { api, auth, formatNaira } from "@/lib/api";

export const Route = createFileRoute("/wallet/transfer")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: TransferPage,
});

type Bank = { code: string; name: string };

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const transferSchema = z.object({
  bankCode: z.string().min(2, "Select a bank"),
  accountNumber: z.string().regex(/^\d{10}$/, "Account number must be 10 digits"),
  amount: z.number().min(100, "Minimum is ₦100").max(1_000_000, "Maximum is ₦1,000,000"),
  narration: z.string().max(100).optional(),
});

function TransferPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [bankCode, setBankCode] = useState("");
  const [bankQuery, setBankQuery] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [resolved, setResolved] = useState<{ accountName: string } | null>(null);
  const [askPin, setAskPin] = useState(false);
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [receipt, setReceipt] = useState<{ reference: string; timestamp: number; fee: number } | null>(null);

  const wallet = useQuery({ queryKey: ["wallet"], queryFn: () => api<any>("/wallet") });
  const balance = parseFloat(wallet.data?.wallet?.balance ?? "0");

  const banksQ = useQuery({
    queryKey: ["banks"],
    queryFn: () => api<any>("/wallet/banks"),
    staleTime: 1000 * 60 * 60 * 24,
  });
  const banks: Bank[] = useMemo(() => {
    const list = banksQ.data?.banks ?? banksQ.data ?? [];
    return Array.isArray(list)
      ? list.map((b: any) => ({ code: String(b.code ?? b.bankCode), name: String(b.name ?? b.bankName) }))
      : [];
  }, [banksQ.data]);

  const filteredBanks = useMemo(() => {
    if (!bankQuery) return banks;
    const s = bankQuery.toLowerCase();
    return banks.filter((b) => b.name.toLowerCase().includes(s));
  }, [banks, bankQuery]);

  const selectedBank = banks.find((b) => b.code === bankCode);

  // Auto-resolve account once 10 digits + bank chosen
  const resolve = useMutation({
    mutationFn: () =>
      api<any>("/wallet/verify-account", { query: { bankCode, accountNumber } }),
    onSuccess: (d: any) =>
      setResolved({ accountName: String(d.accountName ?? d.name ?? "Account") }),
    onError: (e: any) => {
      setResolved(null);
      toast.error(e.message || "Couldn't verify account");
    },
  });

  useEffect(() => {
    setResolved(null);
    if (bankCode && /^\d{10}$/.test(accountNumber)) {
      resolve.mutate();
    }
  }, [bankCode, accountNumber]);

  const amt = Number(amount || 0);
  const fee = 0; // Free intra-network transfers
  const total = amt + fee;
  const insufficient = total > balance;

  const validation = transferSchema.safeParse({
    bankCode,
    accountNumber,
    amount: amt,
    narration: narration || undefined,
  });
  const canContinue = validation.success && !!resolved && !insufficient;

  const send = useMutation({
    mutationFn: (pin: string) =>
      api<any>("/wallet/transfer", {
        method: "POST",
        body: {
          bankCode,
          accountNumber,
          accountName: resolved?.accountName,
          amount: amt,
          narration: narration || undefined,
          pin,
        },
      }),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      const reference =
        res?.reference || res?.transaction?.reference || res?.id || `ZTX${Date.now()}`;
      setReceipt({
        reference,
        timestamp: Date.now(),
        fee: Number(res?.fee ?? fee),
      });
      setStep("success");
    },
    onError: (e: any) => toast.error(e.message || "Transfer failed"),
  });

  // ---- Success / Receipt ----
  if (step === "success" && receipt) {
    return (
      <MobileShell hideNav>
        <ScreenHeader title="Receipt" back={false} />
        <Receipt
          title="Bank Transfer"
          amount={amt}
          reference={receipt.reference}
          timestamp={receipt.timestamp}
          details={[
            { label: "Recipient", value: resolved?.accountName ?? "—" },
            { label: "Account", value: accountNumber },
            { label: "Bank", value: selectedBank?.name ?? "—" },
            ...(narration ? [{ label: "Note", value: narration }] : []),
            { label: "Fee", value: formatNaira(receipt.fee) },
          ]}
          againLabel="Send again"
          onAgain={() => {
            setBankCode(""); setAccountNumber(""); setAmount(""); setNarration("");
            setResolved(null); setReceipt(null); setStep("form");
          }}
          onDone={() => router.navigate({ to: "/home" })}
        />
      </MobileShell>
    );
  }

  // ---- Review ----
  if (step === "review") {
    return (
      <MobileShell hideNav>
        <ScreenHeader title="Confirm transfer" />
        <div className="px-4 space-y-5">
          <div className="rounded-3xl bg-gradient-hero p-6 text-center text-primary-foreground shadow-glow">
            <p className="text-xs uppercase tracking-wider text-white/70">You're sending</p>
            <p className="mt-2 font-display text-4xl font-extrabold tracking-tight">
              {formatNaira(amt)}
            </p>
            <p className="mt-1 text-xs text-white/70">Fee {formatNaira(fee)}</p>
          </div>

          <div className="rounded-2xl bg-card p-5 shadow-card space-y-4 text-sm">
            <Row label="Recipient" value={resolved?.accountName ?? "—"} bold />
            <Row label="Account" value={accountNumber} />
            <Row label="Bank" value={selectedBank?.name ?? "—"} />
            {narration && <Row label="Note" value={narration} />}
            <div className="border-t border-dashed border-border pt-3">
              <Row label="Total" value={formatNaira(total)} bold />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setStep("form")}
              className="rounded-full bg-secondary py-3.5 text-sm font-semibold text-secondary-foreground"
            >
              Edit
            </button>
            <button
              onClick={() => setAskPin(true)}
              disabled={send.isPending}
              className="flex items-center justify-center rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-fab disabled:opacity-50"
            >
              {send.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & send"}
            </button>
          </div>
        </div>

        <PinDialog
          open={askPin}
          onClose={() => setAskPin(false)}
          onSubmit={(pin) => { setAskPin(false); send.mutate(pin); }}
        />
      </MobileShell>
    );
  }

  // ---- Form ----
  return (
    <MobileShell hideNav>
      <ScreenHeader title="Send Money" subtitle="To any Nigerian bank" />
      <div className="px-4 space-y-4">
        {/* Balance */}
        <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Wallet balance</p>
              <p className="font-display text-base font-bold">{formatNaira(balance)}</p>
            </div>
          </div>
        </div>

        {/* Bank + Account */}
        <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bank
            </label>
            <button
              onClick={() => setBankPickerOpen(true)}
              className="mt-2 flex h-12 w-full items-center justify-between rounded-xl border border-input bg-surface px-4 text-left text-base"
            >
              <span className={selectedBank ? "" : "text-muted-foreground"}>
                {selectedBank?.name ?? (banksQ.isLoading ? "Loading banks…" : "Select bank")}
              </span>
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account number
            </label>
            <input
              inputMode="numeric"
              maxLength={10}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="0123456789"
              className="mt-2 h-12 w-full rounded-xl border border-input bg-surface px-4 text-base outline-none focus:border-primary"
            />
            {resolve.isPending && (
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Resolving account…
              </p>
            )}
            {resolved && (
              <div className="mt-2 flex items-start gap-2 rounded-xl bg-success/10 p-3 text-success">
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                <p className="text-xs font-semibold">{resolved.accountName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">₦</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="h-14 w-full rounded-xl border border-input bg-surface pl-9 pr-4 font-display text-2xl font-bold outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
              >
                {formatNaira(q).replace(".00", "")}
              </button>
            ))}
          </div>
          {amt > 0 && insufficient && (
            <p className="text-xs font-medium text-destructive">Insufficient balance</p>
          )}

          <input
            value={narration}
            onChange={(e) => setNarration(e.target.value.slice(0, 100))}
            placeholder="Note (optional)"
            className="h-11 w-full rounded-xl border border-input bg-surface px-4 text-sm outline-none focus:border-primary"
          />
        </div>

        <button
          onClick={() => {
            const v = transferSchema.safeParse({
              bankCode, accountNumber, amount: amt, narration: narration || undefined,
            });
            if (!v.success) { toast.error(v.error.issues[0].message); return; }
            if (!resolved) { toast.error("Verify the account first"); return; }
            if (insufficient) { toast.error("Insufficient balance"); return; }
            setStep("review");
          }}
          disabled={!canContinue}
          className="flex h-13 w-full items-center justify-center rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-50"
        >
          Continue
        </button>
      </div>

      {bankPickerOpen && (
        <BankPicker
          banks={filteredBanks}
          query={bankQuery}
          setQuery={setBankQuery}
          onPick={(c) => { setBankCode(c); setBankPickerOpen(false); setBankQuery(""); }}
          onClose={() => { setBankPickerOpen(false); setBankQuery(""); }}
        />
      )}
    </MobileShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right ${bold ? "font-display font-bold" : "font-semibold"}`}>{value}</span>
    </div>
  );
}

function BankPicker({
  banks, query, setQuery, onPick, onClose,
}: {
  banks: Bank[];
  query: string;
  setQuery: (s: string) => void;
  onPick: (code: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="flex max-h-[85vh] w-full max-w-[480px] flex-col rounded-t-3xl bg-card p-5 shadow-fab animate-in slide-in-from-bottom">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Choose bank</h3>
          <button onClick={onClose} className="text-sm font-semibold text-muted-foreground">
            Close
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search banks"
            className="h-11 w-full rounded-xl border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="mt-3 flex-1 overflow-y-auto">
          {banks.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No banks found</p>
          )}
          {banks.map((b) => (
            <button
              key={b.code}
              onClick={() => onPick(b.code)}
              className="flex w-full items-center justify-between border-b border-border/60 py-3 text-left text-sm font-medium last:border-0"
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
