import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { OfflineBanner } from "./OfflineBanner";

export function MobileShell({
  children,
  hideNav = false,
  fullBleed = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
  fullBleed?: boolean;
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-secondary/60 via-background to-background flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-screen bg-background flex flex-col shadow-soft">
        <OfflineBanner />
        <main className={`flex-1 ${fullBleed ? "" : hideNav ? "pb-10" : "pb-32"}`}>{children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
