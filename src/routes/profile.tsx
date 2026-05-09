import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Copy,
  HelpCircle,
  LogOut,
  ShieldCheck,
  UserCircle2,
  Users,
  KeyRound,
  Building2,
  Moon,
  Sun,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api, auth, formatNaira } from "@/lib/api";
import { AmountDisplay } from "@/components/ui-kit";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw redirect({ to: "/login" });
  },
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const user = auth.getUser();

  const va = useQuery({ queryKey: ["virtual-account"], queryFn: () => api<any>("/wallet/virtual-account") });
  const wallet = useQuery({ queryKey: ["wallet"], queryFn: () => api<any>("/wallet") });

  const account = va.data?.virtualAccount;
  const balance = parseFloat(wallet.data?.wallet?.balance ?? "0");
  const kyc = (user?.kyc_status || "pending").toLowerCase();
  const verified = kyc === "verified" || kyc === "approved";
  const kycProgress = verified ? 100 : kyc === "in_review" ? 66 : kyc === "submitted" ? 33 : 10;

  const [dark, setDark] = useState<boolean>(typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("zentrix.theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zentrix.theme");
      if (saved) setDark(saved === "dark");
    } catch {}
  }, []);

  const logout = () => { auth.clear(); navigate({ to: "/login" }); };
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  return (
    <MobileShell>
      <ScreenHeader title="Account" back={false} />
      <div className="px-4 space-y-5">
        {/* Identity card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-balance p-5 text-primary-foreground shadow-glow">
          <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/25 blur-3xl animate-drift" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl glass-dark font-display text-xl font-bold">
                {(user?.firstName?.[0] || "U").toUpperCase()}
                {verified && (
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success ring-2 ring-[var(--primary-deep)]">
                    <BadgeCheck className="h-3 w-3 text-white" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg font-bold truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-white/70">{user?.email}</p>
                <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  verified ? "bg-success/30 text-white" : "bg-warning/30 text-white"
                }`}>
                  {verified ? "Verified" : `KYC ${kyc}`}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl glass-dark p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/65">Wallet balance</p>
              <p className="mt-1 font-display text-2xl font-extrabold">
                <AmountDisplay value={balance} />
              </p>
            </div>

            {!verified && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-white/75">
                  <span>KYC progress</span>
                  <span>{kycProgress}%</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-accent transition-all" style={{ width: `${kycProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Virtual account */}
        {account && (
          <div className="rounded-3xl bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-4.5 w-4.5" />
              </span>
              <p className="text-sm font-semibold">Your funding account</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-bold tabular">{account.accountNumber}</p>
                <p className="text-[11px] text-muted-foreground">
                  {account.bankName} · {account.accountName}
                </p>
              </div>
              <button
                onClick={() => copy(account.accountNumber)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary transition active:scale-95"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        <Section title="Security">
          <Row Icon={UserCircle2} label="Personal information" />
          <Row Icon={ShieldCheck} label="KYC verification" badge={verified ? "verified" : kyc} tone={verified ? "success" : "warn"} />
          <Row Icon={KeyRound} label="Change PIN" />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <button
            onClick={() => setDark((d) => !d)}
            className="flex w-full items-center gap-3 p-4 transition active:bg-muted/60"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </span>
            <p className="flex-1 text-left text-sm font-medium">Dark mode</p>
            <span className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${dark ? "left-[22px]" : "left-0.5"}`} />
            </span>
          </button>
          <Row Icon={Users} label="Refer & earn" badge="₦200" tone="info" />
        </Section>

        {/* Support */}
        <Section title="Support">
          <Row Icon={HelpCircle} label="Help & support" />
        </Section>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-destructive/10 py-4 text-sm font-semibold text-destructive transition active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
        <p className="pb-2 text-center text-[10px] text-muted-foreground">Zentrix v1.0 · Made in 🇳🇬 with ❤️</p>
        <p className="pb-2 text-center text-[10px] text-muted-foreground">Wallet: {formatNaira(balance)}</p>
      </div>
    </MobileShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <div className="divide-y divide-border rounded-3xl bg-card shadow-soft overflow-hidden">{children}</div>
    </div>
  );
}

function Row({
  Icon, label, badge, tone = "neutral",
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  tone?: "neutral" | "success" | "warn" | "info";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-secondary text-secondary-foreground",
    success: "bg-success/15 text-success",
    warn: "bg-warning/20 text-warning",
    info: "bg-accent/20 text-accent-foreground",
  };
  return (
    <a className="flex items-center gap-3 p-4 transition active:bg-muted/60">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="flex-1 text-sm font-medium">{label}</p>
      {badge && (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}>
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </a>
  );
}
