import { redirect } from "@tanstack/react-router";
import { tokenStore } from "@/store/tokenStore";

/**
 * Route guard helpers. Use inside `beforeLoad` so unauthorized users are
 * redirected before any component renders or loader fires.
 */

export function requireAuth({ location }: { location: { href: string } }) {
  if (typeof window === "undefined") return;
  if (!tokenStore.get()) {
    throw redirect({ to: "/login", search: { redirect: location.href } as any });
  }
}

export function requireGuest() {
  if (typeof window === "undefined") return;
  if (tokenStore.get()) {
    throw redirect({ to: "/home" });
  }
}

export function requireAdmin({ location }: { location: { href: string } }) {
  if (typeof window === "undefined") return;
  const token = tokenStore.get();
  if (!token) {
    throw redirect({ to: "/login", search: { redirect: location.href } as any });
  }
  // Admin role check happens server-side; the user's roles claim is also
  // verified here if available via the auth store at call time.
  try {
    const raw = window.localStorage.getItem("zentrix.user");
    const user = raw ? JSON.parse(raw) : null;
    const roles: string[] = user?.roles ?? [];
    if (!roles.includes("admin") && !roles.includes("super_admin")) {
      throw redirect({ to: "/home" });
    }
  } catch {
    throw redirect({ to: "/home" });
  }
}
