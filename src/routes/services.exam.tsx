import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api, auth, formatNaira } from "@/lib/api";
import { PinDialog } from "@/components/PinDialog";
import { Receipt } from "@/components/Receipt";

export const Route = createFileRoute("/services/exam")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: ExamPage,
});

function ExamPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [planCode, setPlanCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [askPin, setAskPin] = useState(false);
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [result, setResult] = useState<any | null>(null);
  const [receiptTs, setReceiptTs] = useState<number>(0);

  const plans = useQuery({
    queryKey: ["exam-plans"],
    queryFn: () => api<any>("/vas/exam/plans"),
  });
  const list: any[] = plans.data?.plans ?? [];

  const buy = useMutation({
    mutationFn: (pin: string) => api<any>("/vas/exam", { method: "POST", body: { planCode, quantity, phone, pin } }),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      setResult(res);
      setReceiptTs(Date.now());
      setStep("success");
    },
    onError: (e: any) => toast.error(e.message || "Purchase failed"),
  });

  const selected = list.find((p: any) => (p.code || p.planCode) === planCode);
  const total = selected ? Number(selected.price || selected.amount) * quantity : 0;

  if (step === "success" && result) {
    const pins: any[] = result.pins ?? [];
    const details = [
      { label: "Exam Type", value: String(result.examType ?? selected?.name ?? selected?.title ?? "—") },
      { label: "Quantity", value: String(result.quantity ?? quantity) },
      ...pins.flatMap((p: any, i: number) => [
        { label: `PIN ${i + 1}`, value: String(p.pin) },
        { label: `Serial ${i + 1}`, value: String(p.serial) },
      ]),
      { label: "Fee", value: formatNaira(Number(result.fee ?? 0)) },
    ];
    return (
      <MobileShell hideNav>
        <ScreenHeader title="Receipt" back={false} />
        <Receipt
          title="Exam PIN Purchase"
          amount={Number(result.amount ?? total)}
          reference={String(result.reference ?? `ZTX${Date.now()}`)}
          timestamp={receiptTs}
          details={details}
          againLabel="Buy again"
          onAgain={() => {
            setPlanCode(""); setQuantity(1); setPhone("");
            setResult(null); setStep("form");
          }}
          onDone={() => router.navigate({ to: "/home" })}
        />
      </MobileShell>
    );
  }

  return (
    <MobileShell hideNav>
      <ScreenHeader title="Exam PINs" />
      <div className="px-4 space-y-4">
        {plans.isLoading && <div className="h-32 animate-pulse rounded-2xl bg-card" />}
        <div className="space-y-2">
          {list.map((p: any) => {
            const code = p.code || p.planCode;
            const active = planCode === code;
            return (
              <button
                key={code}
                onClick={() => setPlanCode(code)}
                className={`w-full rounded-2xl p-4 text-left transition ${
                  active ? "bg-primary text-primary-foreground shadow-fab" : "bg-card shadow-card"
                }`}
              >
                <p className="font-display text-base font-bold">{p.name || p.title}</p>
                <p className={`mt-1 text-sm ${active ? "text-white/80" : "text-muted-foreground"}`}>
                  {formatNaira(p.price || p.amount)} per PIN
                </p>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quantity</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-9 w-9 rounded-full bg-secondary font-bold">−</button>
                <span className="w-6 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="h-9 w-9 rounded-full bg-secondary font-bold">+</button>
              </div>
            </div>
            <input
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="Phone number"
              className="h-12 w-full rounded-xl border border-input bg-surface px-4 text-base outline-none focus:border-primary"
            />
            <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3">
              <span className="text-sm font-medium">Total</span>
              <span className="font-display text-lg font-bold">{formatNaira(total)}</span>
            </div>
          </div>
        )}

        <button
          disabled={!selected || !phone || buy.isPending}
          onClick={() => setAskPin(true)}
          className="flex h-13 w-full items-center justify-center rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-fab disabled:opacity-50"
        >
          {buy.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buy PIN"}
        </button>
      </div>
      <PinDialog open={askPin} onClose={() => setAskPin(false)} onSubmit={(pin) => { setAskPin(false); buy.mutate(pin); }} />
    </MobileShell>
  );
}
