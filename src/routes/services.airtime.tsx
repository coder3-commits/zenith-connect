import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Phone, X } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api, auth, formatNaira } from "@/lib/api";
import { PinDialog } from "@/components/PinDialog";
import {
  detectNetwork,
  getRecentRecipients,
  isValidNgPhone,
  saveRecipient,
  type Network,
} from "@/lib/nigeria";

export const Route = createFileRoute("/services/airtime")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: AirtimePage,
});

const NETWORKS: Network[] = ["MTN", "AIRTEL", "GLO", "9MOBILE"];
const QUICK = [100, 200, 500, 1000, 2000, 5000];
const NETWORK_TINT: Record<Network, string> = {
  MTN: "bg-yellow-400 text-black",
  AIRTEL: "bg-red-600 text-white",
  GLO: "bg-green-600 text-white",
  "9MOBILE": "bg-emerald-700 text-white",
};

function AirtimePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<Network>("MTN");
  const [networkLocked, setNetworkLocked] = useState(false);
  const [askPin, setAskPin] = useState(false);
  const [step, setStep] = useState<"form" | "review" | "success">("form");

  const wallet = useQuery({ queryKey: ["wallet"], queryFn: () => api<any>("/wallet") });
  const balance = wallet.data?.wallet?.balance ?? wallet.data?.balance ?? 0;
  const recents = useMemo(() => getRecentRecipients(), [step]);

  // Auto-detect network from phone prefix
  useEffect(() => {
    if (networkLocked) return;
    const detected = detectNetwork(phone);
    if (detected && detected !== network) setNetwork(detected);
  }, [phone, networkLocked]);

  const phoneValid = isValidNgPhone(phone);
  const amt = Number(amount);
  const amountValid = amt >= 50 && amt <= 50000;
  const insufficient = amt > Number(balance);
  const canContinue = phoneValid && amountValid && !insufficient;

  const buy = useMutation({
    mutationFn: (pin: string) =>
      api("/vas/airtime", {
        method: "POST",
        body: { phoneNumber: phone, amount: amt, network, pin },
      }),
    onSuccess: () => {
      saveRecipient(phone, network);
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      setStep("success");
    },
    onError: (e: any) => toast.error(e.message || "Purchase failed"),
  });

  if (step === "success") {
    return (
      <MobileShell hideNav>
        <ScreenHeader title="Successful" back={false} />
        <div className="flex flex-col items-center px-6 pt-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold">{formatNaira(amt)} sent</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {network} airtime delivered to {phone}
          </p>
          <div className="mt-8 grid w-full grid-cols-2 gap-3">
            <button
              onClick={() => {
                setPhone(""); setAmount(""); setNetworkLocked(false); setStep("form");
              }}
              className="rounded-full bg-secondary py-3 text-sm font-semibold"
            >
              Buy again
            </button>
            <button
              onClick={() => router.navigate({ to: "/home" })}
              className="rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Done
            </button>
          </div>
        </div>
      </MobileShell>
    );
  }

  if (step === "review") {
    return (
      <MobileShell hideNav>
        <ScreenHeader title="Review purchase" />
        <div className="px-4 space-y-4">
          <div className="rounded-3xl bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">You're paying</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{formatNaira(amt)}</p>
            <div className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
              <Row label="Recipient" value={phone} />
              <Row label="Network" value={network} />
              <Row label="Service" value="Airtime top-up" />
              <Row label="Wallet balance" value={formatNaira(balance)} />
            </div>
          </div>
          <button
            disabled={buy.isPending}
            onClick={() => setAskPin(true)}
            className="flex h-13 w-full items-center justify-center rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-50"
          >
            {buy.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm with PIN"}
          </button>
          <button
            onClick={() => setStep("form")}
            className="w-full py-3 text-sm font-semibold text-muted-foreground"
          >
            Edit details
          </button>
        </div>
        <PinDialog
          open={askPin}
          onClose={() => setAskPin(false)}
          onSubmit={(pin) => { setAskPin(false); buy.mutate(pin); }}
        />
      </MobileShell>
    );
  }

  return (
    <MobileShell hideNav>
      <ScreenHeader title="Buy Airtime" />
      <div className="px-4 space-y-5 pb-8">
        {/* Balance pill */}
        <div className="flex items-center justify-between rounded-2xl bg-primary/5 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Wallet</span>
          <span className="font-semibold">{formatNaira(balance)}</span>
        </div>

        {/* Phone */}
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Phone number
          </label>
          <div className="relative mt-2">
            <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 11));
                setNetworkLocked(false);
              }}
              placeholder="08012345678"
              className={`h-12 w-full rounded-xl border bg-surface pl-11 pr-20 text-base outline-none transition ${
                phone.length === 11 && !phoneValid
                  ? "border-destructive focus:border-destructive"
                  : "border-input focus:border-primary"
              }`}
            />
            {phoneValid && (
              <span
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[10px] font-bold ${NETWORK_TINT[network]}`}
              >
                {network}
              </span>
            )}
          </div>
          {phone.length === 11 && !phoneValid && (
            <p className="mt-2 text-xs text-destructive">Enter a valid Nigerian phone number</p>
          )}

          {recents.length > 0 && !phone && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {recents.map((r) => (
                <button
                  key={r.phone}
                  onClick={() => { setPhone(r.phone); setNetwork(r.network); }}
                  className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                >
                  {r.phone}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Network override */}
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Network {networkLocked && <span className="ml-1 text-primary">(manual)</span>}
            </label>
            {networkLocked && (
              <button
                onClick={() => setNetworkLocked(false)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground"
              >
                <X className="h-3 w-3" /> reset
              </button>
            )}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {NETWORKS.map((n) => (
              <button
                key={n}
                onClick={() => { setNetwork(n); setNetworkLocked(true); }}
                className={`rounded-xl py-3 text-xs font-semibold transition ${
                  network === n
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Amount
          </label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">₦</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="0.00"
              className={`h-12 w-full rounded-xl border bg-surface pl-9 pr-4 text-base outline-none transition ${
                amount && !amountValid
                  ? "border-destructive focus:border-destructive"
                  : "border-input focus:border-primary"
              }`}
            />
          </div>
          {amount && !amountValid && (
            <p className="mt-2 text-xs text-destructive">Amount must be between ₦50 and ₦50,000</p>
          )}
          {insufficient && (
            <p className="mt-2 text-xs text-destructive">Insufficient wallet balance</p>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {QUICK.map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className={`rounded-full py-2 text-xs font-semibold active:scale-95 ${
                  Number(amount) === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                ₦{v.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!canContinue}
          onClick={() => setStep("review")}
          className="flex h-13 w-full items-center justify-center rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </MobileShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
