import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api, auth, formatNaira } from "@/lib/api";
import { PinDialog } from "@/components/PinDialog";

export const Route = createFileRoute("/services/data")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: DataPage,
});

const networks = ["MTN", "AIRTEL", "GLO", "9MOBILE"] as const;

function DataPage() {
  const [network, setNetwork] = useState<(typeof networks)[number]>("MTN");
  const [phone, setPhone] = useState("");
  const [bundleId, setBundleId] = useState<string | null>(null);
  const [askPin, setAskPin] = useState(false);

  const bundles = useQuery({
    queryKey: ["bundles", network],
    queryFn: () => api<any>("/vas/bundles", { query: { network } }),
  });
  const list: any[] = bundles.data?.bundles ?? [];

  const buy = useMutation({
    mutationFn: (pin: string) =>
      api("/vas/data", { method: "POST", body: { phoneNumber: phone, bundleId, pin } }),
    onSuccess: () => {
      toast.success(`Data sent to ${phone}`);
      setPhone(""); setBundleId(null);
    },
    onError: (e: any) => toast.error(e.message || "Purchase failed"),
  });

  const valid = /^0[7-9][0-1]\d{8}$/.test(phone) && bundleId;

  return (
    <MobileShell hideNav>
      <ScreenHeader title="Buy Data" />
      <div className="px-4 space-y-5">
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="grid grid-cols-4 gap-2">
            {networks.map((n) => (
              <button
                key={n}
                onClick={() => { setNetwork(n); setBundleId(null); }}
                className={`rounded-xl py-3 text-xs font-semibold ${
                  network === n ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="Phone number"
            className="mt-3 h-12 w-full rounded-xl border border-input bg-surface px-4 text-base outline-none focus:border-primary"
          />
        </div>

        <div>
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Choose a bundle
          </p>
          {bundles.isLoading && (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />
              ))}
            </div>
          )}
          {!bundles.isLoading && list.length === 0 && (
            <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground">
              No bundles available right now.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {list.map((b: any) => {
              const id = b.id || b.bundleId || b.code;
              const active = bundleId === id;
              return (
                <button
                  key={id}
                  onClick={() => setBundleId(id)}
                  className={`flex flex-col items-start rounded-2xl p-4 text-left transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-fab"
                      : "bg-card text-foreground shadow-card"
                  }`}
                >
                  <p className="font-display text-base font-bold">{b.name || b.value || b.size}</p>
                  <p className={`mt-1 text-xs ${active ? "text-white/80" : "text-muted-foreground"}`}>
                    {b.validity || b.duration || ""}
                  </p>
                  <p className="mt-3 text-sm font-semibold">{formatNaira(b.price || b.amount)}</p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          disabled={!valid || buy.isPending}
          onClick={() => setAskPin(true)}
          className="flex h-13 w-full items-center justify-center rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-50"
        >
          {buy.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buy data"}
        </button>
      </div>

      <PinDialog open={askPin} onClose={() => setAskPin(false)} onSubmit={(pin) => { setAskPin(false); buy.mutate(pin); }} />
    </MobileShell>
  );
}
