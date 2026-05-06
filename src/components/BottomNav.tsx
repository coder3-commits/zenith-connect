import { Link, useLocation } from "@tanstack/react-router";
import { Home, ArrowLeftRight, LayoutGrid, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/transactions", label: "History", Icon: ArrowLeftRight },
  { to: "/services", label: "Services", Icon: LayoutGrid },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 safe-bottom border-t border-border bg-surface/95 backdrop-blur">
      <ul className="grid grid-cols-4 px-2 pt-2">
        {items.map(({ to, label, Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
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
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
