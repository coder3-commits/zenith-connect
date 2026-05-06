import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api, auth, formatNaira } from "@/lib/api";
import { PinDialog } from "@/components/PinDialog";

export const Route = createFileRoute("/services/airtime")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: AirtimePage,
});

const networks = ["MTN", "AIRTEL", "GLO", "9MOBILE"] as const;
const quick = [100, 200, 500, 1000, 2000, 5000];

function AirtimePage() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<(typeof networks)[number]>("MTN");
  const [askPin, setAskPin] = useState(false);

  const buy = useMutation({
    mutationFn: (pin: string) =>
      api("/vas/airtime", {
        method: "POST",
        body: { phoneNumber: phone, amount: Number(amount), network, pin },
      }),
    onSuccess: () => {
      toast.success(`${formatNaira(amount)} airtime sent to ${phone}`);
      setPhone(""); setAmount("");
    },
    onError: (e: any) => toast.error(e.message || "Purchase failed"),
  });

  const valid = /^0[7-9][0-1]\d{8}$/.test(phone) && Number(amount) >= 50;

  return (
    <MobileShell hideNav>
      <ScreenHeader title="Buy Airtime" />
      <div className="px-4 space-y-5">
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Network</label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {networks.map((n) => (
              <button
                key={n}
                onClick={() => setNetwork(n)}
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

        <div className="rounded-2xl bg-card p-4 shadow-card">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone number</label>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="08012345678"
            className="mt-2 h-12 w-full rounded-xl border border-input bg-surface px-4 text-base outline-none focus:border-primary"
          />
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-card">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</label>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">₦</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="0.00"
              className="h-12 w-full rounded-xl border border-input bg-surface pl-9 pr-4 text-base outline-none focus:border-primary"
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {quick.map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="rounded-full bg-secondary py-2 text-xs font-semibold text-secondary-foreground active:scale-95"
              >
                ₦{v.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!valid || buy.isPending}
          onClick={() => setAskPin(true)}
          className="flex h-13 w-full items-center justify-center rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-50"
        >
          {buy.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : `Buy ${amount ? formatNaira(amount) : ""}`}
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
