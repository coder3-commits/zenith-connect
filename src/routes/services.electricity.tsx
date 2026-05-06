import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api, auth, formatNaira } from "@/lib/api";
import { PinDialog } from "@/components/PinDialog";

export const Route = createFileRoute("/services/electricity")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: ElectricityPage,
});

function ElectricityPage() {
  const [planCode, setPlanCode] = useState("");
  const [meterType, setMeterType] = useState<"prepaid" | "postpaid">("prepaid");
  const [meter, setMeter] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [verified, setVerified] = useState<{ name?: string; address?: string } | null>(null);
  const [askPin, setAskPin] = useState(false);

  const plans = useQuery({
    queryKey: ["elec-plans"],
    queryFn: () => api<any>("/vas/electricity/plans"),
  });
  const list: any[] = plans.data?.plans ?? [];

  const verify = useMutation({
    mutationFn: () =>
      api<any>("/vas/electricity/verify", {
        query: { meterNumber: meter, planCode, meterType },
      }),
    onSuccess: (d) => { setVerified({ name: d.customerName || d.name, address: d.address }); toast.success("Meter verified"); },
    onError: (e: any) => { setVerified(null); toast.error(e.message || "Verification failed"); },
  });

  const buy = useMutation({
    mutationFn: (pin: string) =>
      api("/vas/electricity", {
        method: "POST",
        body: { meterNumber: meter, planCode, amount: Number(amount), meterType, phone, pin },
      }),
    onSuccess: () => { toast.success("Electricity purchase successful"); setMeter(""); setAmount(""); setVerified(null); },
    onError: (e: any) => toast.error(e.message || "Purchase failed"),
  });

  const canVerify = planCode && meter.length >= 10;
  const canBuy = verified && Number(amount) >= 100;

  return (
    <MobileShell hideNav>
      <ScreenHeader title="Electricity" />
      <div className="px-4 space-y-5">
        <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disco</label>
            <select
              value={planCode}
              onChange={(e) => { setPlanCode(e.target.value); setVerified(null); }}
              className="mt-2 h-12 w-full rounded-xl border border-input bg-surface px-3 text-base outline-none focus:border-primary"
            >
              <option value="">Select provider</option>
              {list.map((p: any) => (
                <option key={p.code || p.planCode} value={p.code || p.planCode}>
                  {p.name || p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(["prepaid", "postpaid"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setMeterType(t); setVerified(null); }}
                className={`rounded-xl py-3 text-xs font-semibold capitalize ${
                  meterType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            inputMode="numeric"
            value={meter}
            onChange={(e) => { setMeter(e.target.value.replace(/\D/g, "")); setVerified(null); }}
            placeholder="Meter number"
            className="h-12 w-full rounded-xl border border-input bg-surface px-4 text-base outline-none focus:border-primary"
          />

          <button
            disabled={!canVerify || verify.isPending}
            onClick={() => verify.mutate()}
            className="h-11 w-full rounded-full bg-secondary text-sm font-semibold text-secondary-foreground disabled:opacity-50"
          >
            {verify.isPending ? "Verifying…" : "Verify meter"}
          </button>

          {verified && (
            <div className="flex items-start gap-2 rounded-xl bg-success/10 p-3 text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <div className="text-xs">
                <p className="font-semibold">{verified.name || "Verified"}</p>
                {verified.address && <p className="text-success/80">{verified.address}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">₦</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="Amount"
              className="h-12 w-full rounded-xl border border-input bg-surface pl-9 pr-4 text-base outline-none focus:border-primary"
            />
          </div>
          <input
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="Phone (for receipt)"
            className="h-12 w-full rounded-xl border border-input bg-surface px-4 text-base outline-none focus:border-primary"
          />
        </div>

        <button
          disabled={!canBuy || buy.isPending}
          onClick={() => setAskPin(true)}
          className="flex h-13 w-full items-center justify-center rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-50"
        >
          {buy.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : `Pay ${amount ? formatNaira(amount) : ""}`}
        </button>
      </div>

      <PinDialog open={askPin} onClose={() => setAskPin(false)} onSubmit={(pin) => { setAskPin(false); buy.mutate(pin); }} />
    </MobileShell>
  );
}
