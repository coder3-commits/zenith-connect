import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Phone, Search, X } from "lucide-react";
import { Receipt } from "@/components/Receipt";
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

export const Route = createFileRoute("/services/data")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: DataPage,
});

const NETWORKS: Network[] = ["MTN", "AIRTEL", "GLO", "9MOBILE"];
const NETWORK_TINT: Record<Network, string> = {
  MTN: "bg-yellow-400 text-black",
  AIRTEL: "bg-red-600 text-white",
  GLO: "bg-green-600 text-white",
  "9MOBILE": "bg-emerald-700 text-white",
};

function DataPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [network, setNetwork] = useState<Network>("MTN");
  const [networkLocked, setNetworkLocked] = useState(false);
  const [phone, setPhone] = useState("");
  const [bundle, setBundle] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [askPin, setAskPin] = useState(false);
  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [receipt, setReceipt] = useState<{ reference: string; timestamp: number } | null>(null);

  const wallet = useQuery({ queryKey: ["wallet"], queryFn: () => api<any>("/wallet") });
  const balance = parseFloat(wallet.data?.wallet?.balance ?? "0");
  const recents = useMemo(() => getRecentRecipients(), [step]);

  useEffect(() => {
    if (networkLocked) return;
    const detected = detectNetwork(phone);
    if (detected && detected !== network) {
      setNetwork(detected);
      setBundle(null);
    }
  }, [phone, networkLocked]);

  const bundles = useQuery({
    queryKey: ["bundles", network],
    queryFn: () => api<any>("/vas/bundles", { query: { network } }),
    staleTime: 1000 * 60 * 30,
  });

  const list: any[] = bundles.data?.bundles ?? bundles.data ?? [];
  const filtered = useMemo(() => {
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter((b: any) =>
      [b.name, b.value, b.size, b.validity, b.duration]
        .filter(Boolean)
        .some((v: any) => String(v).toLowerCase().includes(s))
    );
  }, [list, search]);

  const phoneValid = isValidNgPhone(phone);
  const price = Number(bundle?.price || bundle?.amount || 0);
  const insufficient = price > Number(balance);
  const canContinue = phoneValid && bundle && !insufficient;

  const buy = useMutation({
    mutationFn: (pin: string) =>
      api<any>("/vas/data", {
        method: "POST",
        body: {
          phoneNumber: phone,
          bundleId: bundle?.id || bundle?.bundleId || bundle?.code,
          network,
          pin,
        },
      }),
    onSuccess: (res: any) => {
      saveRecipient(phone, network);
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      const reference =
        res?.reference || res?.transaction?.reference || res?.id || `ZTX${Date.now()}`;
      setReceipt({ reference, timestamp: Date.now() });
      setStep("success");
    },
    onError: (e: any) => toast.error(e.message || "Purchase failed"),
  });

  if (step === "success" && receipt) {
    const bundleName = bundle?.name || bundle?.value || bundle?.size || "Data bundle";
    const validity = bundle?.validity || bundle?.duration;
    return (
      <MobileShell hideNav>
        <ScreenHeader title="Receipt" back={false} />
        <Receipt
          title="Data Bundle"
          amount={price}
          reference={receipt.reference}
          timestamp={receipt.timestamp}
          details={[
            { label: "Bundle", value: bundleName },
            ...(validity ? [{ label: "Validity", value: String(validity) }] : []),
            { label: "Recipient", value: phone },
            { label: "Network", value: network },
          ]}
          againLabel="Buy again"
          onAgain={() => {
            setPhone(""); setBundle(null); setNetworkLocked(false);
            setReceipt(null); setStep("form");
          }}
          onDone={() => router.navigate({ to: "/home" })}
        />
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
            <p className="mt-1 font-display text-3xl font-extrabold">{formatNaira(price)}</p>
            <div className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
              <Row label="Bundle" value={bundle?.name || bundle?.value || bundle?.size || "—"} />
              {(bundle?.validity || bundle?.duration) && (
                <Row label="Validity" value={bundle?.validity || bundle?.duration} />
              )}
              <Row label="Recipient" value={phone} />
              <Row label="Network" value={network} />
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
      <ScreenHeader title="Buy Data" />
      <div className="px-4 space-y-5 pb-8">
        <div className="flex items-center justify-between rounded-2xl bg-primary/5 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Wallet</span>
          <span className="font-semibold">{formatNaira(balance)}</span>
        </div>

        {/* Phone + network */}
        <div className="rounded-2xl bg-card p-4 shadow-card space-y-3">
          <div>
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
                    onClick={() => { setPhone(r.phone); setNetwork(r.network); setBundle(null); }}
                    className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                  >
                    {r.phone}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
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
                  onClick={() => { setNetwork(n); setNetworkLocked(true); setBundle(null); }}
                  className={`rounded-xl py-3 text-xs font-semibold ${
                    network === n
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bundles */}
        <div>
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Choose a bundle
            </p>
            {list.length > 0 && (
              <span className="text-[11px] text-muted-foreground">{filtered.length} plans</span>
            )}
          </div>

          {list.length > 0 && (
            <div className="relative mb-3">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 1GB, weekly, monthly..."
                className="h-11 w-full rounded-xl border border-input bg-surface pl-11 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
          )}

          {bundles.isLoading && (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-card" />
              ))}
            </div>
          )}
          {bundles.isError && (
            <div className="rounded-2xl bg-destructive/10 p-4 text-center text-sm text-destructive">
              Couldn't load bundles. Pull to retry.
            </div>
          )}
          {!bundles.isLoading && !bundles.isError && filtered.length === 0 && (
            <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground">
              No bundles match your search.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {filtered.map((b: any) => {
              const id = b.id || b.bundleId || b.code;
              const active = (bundle?.id || bundle?.bundleId || bundle?.code) === id;
              return (
                <button
                  key={id}
                  onClick={() => setBundle(b)}
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

        {insufficient && bundle && (
          <p className="text-center text-xs text-destructive">Insufficient wallet balance</p>
        )}

        <button
          disabled={!canContinue}
          onClick={() => setStep("review")}
          className="flex h-13 w-full items-center justify-center rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-50"
        >
          {bundle ? `Continue • ${formatNaira(price)}` : "Continue"}
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
