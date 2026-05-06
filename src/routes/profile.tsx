import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { api, auth, formatNaira } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !auth.getToken()) throw { redirect: "/login" };
  },
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const user = auth.getUser();

  const va = useQuery({
    queryKey: ["virtual-account"],
    queryFn: () => api<any>("/wallet/virtual-account"),
  });
  const wallet = useQuery({
    queryKey: ["wallet"],
    queryFn: () => api<any>("/wallet"),
  });

  const account = va.data?.virtualAccount;
  const balance = wallet.data?.wallet?.balance ?? 0;

  const logout = () => {
    auth.clear();
    navigate({ to: "/login" });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <MobileShell>
      <ScreenHeader title="Profile" back={false} />
      <div className="px-4 space-y-5">
        {/* Profile card */}
        <div className="rounded-3xl bg-gradient-balance p-5 text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 font-display text-xl font-bold ring-1 ring-white/20">
              {(user?.firstName?.[0] || "U").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg font-bold truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-xs text-white/70">{user?.email}</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-white/10 p-3 backdrop-blur">
            <p className="text-[11px] uppercase tracking-wider text-white/60">Wallet balance</p>
            <p className="font-display text-2xl font-extrabold">{formatNaira(balance)}</p>
          </div>
        </div>

        {/* Virtual account */}
        {account && (
          <div className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Your funding account</p>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-bold">{account.accountNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {account.bankName} • {account.accountName}
                </p>
              </div>
              <button
                onClick={() => copy(account.accountNumber)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="divide-y divide-border rounded-2xl bg-card shadow-card">
          <Row Icon={UserCircle2} label="Personal information" to="/profile" />
          <Row Icon={ShieldCheck} label="KYC verification" to="/profile" badge={user?.kyc_status || "pending"} />
          <Row Icon={KeyRound} label="Change PIN" to="/profile" />
          <Row Icon={Users} label="Refer & earn" to="/profile" />
          <Row Icon={HelpCircle} label="Help & support" to="/profile" />
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-destructive/10 py-4 text-sm font-semibold text-destructive active:scale-[0.98] transition"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
        <p className="pb-4 text-center text-xs text-muted-foreground">Zentrix v1.0 • Made in 🇳🇬</p>
      </div>
    </MobileShell>
  );
}

function Row({
  Icon,
  label,
  to,
  badge,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
  badge?: string;
}) {
  return (
    <a href={to} className="flex items-center gap-3 p-4 active:bg-muted transition">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <p className="flex-1 text-sm font-medium">{label}</p>
      {badge && (
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </a>
  );
}
