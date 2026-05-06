import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Wifi, Zap, GraduationCap, Bitcoin, Send, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/services")({ component: ServicesPage });

const groups = [
  {
    title: "Bills & Top-ups",
    items: [
      { to: "/services/airtime", label: "Airtime", desc: "All Nigerian networks", Icon: Phone },
      { to: "/services/data", label: "Data Bundles", desc: "MTN, Airtel, Glo, 9mobile", Icon: Wifi },
      { to: "/services/electricity", label: "Electricity", desc: "Prepaid & postpaid", Icon: Zap },
      { to: "/services/exam", label: "Exam PINs", desc: "WAEC, NECO, JAMB", Icon: GraduationCap },
    ],
  },
  {
    title: "Money",
    items: [
      { to: "/wallet/transfer", label: "Send Money", desc: "Bank transfer", Icon: Send },
      { to: "/services/crypto", label: "Buy / Sell Crypto", desc: "BTC, USDT, SOL, TON", Icon: Bitcoin },
    ],
  },
];

function ServicesPage() {
  return (
    <MobileShell>
      <ScreenHeader title="Services" back={false} />
      <div className="px-4 space-y-6">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {g.title}
            </p>
            <div className="divide-y divide-border rounded-2xl bg-card shadow-card">
              {g.items.map(({ to, label, desc, Icon }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-3 p-4 active:bg-muted transition"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
