import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, ArrowLeftRight, LayoutGrid, User, Send } from "lucide-react";

const items = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/transactions", label: "History", Icon: ArrowLeftRight },
  { to: "/services", label: "Services", Icon: LayoutGrid },
  { to: "/profile", label: "Account", Icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <div className="pointer-events-none fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 px-4 pb-3 safe-bottom">
      <nav className="pointer-events-auto relative flex items-center justify-between rounded-[28px] border border-border bg-card/90 px-3 py-2 shadow-float backdrop-blur-xl">
        {items.slice(0, 2).map((it) => (
          <NavItem key={it.to} {...it} pathname={pathname} />
        ))}
        {/* Center FAB */}
        <button
          onClick={() => navigate({ to: "/wallet/transfer" })}
          aria-label="Send money"
          className="-mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-fab ring-4 ring-background transition active:scale-95"
        >
          <Send className="h-5 w-5" />
        </button>
        {items.slice(2).map((it) => (
          <NavItem key={it.to} {...it} pathname={pathname} />
        ))}
      </nav>
    </div>
  );
}

function NavItem({
  to,
  label,
  Icon,
  pathname,
}: {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  pathname: string;
}) {
  const active = pathname === to || pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${
          active ? "bg-primary/10 scale-105" : ""
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
      </span>
      {label}
    </Link>
  );
}
