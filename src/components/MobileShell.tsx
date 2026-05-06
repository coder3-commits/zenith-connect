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
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-screen bg-background flex flex-col">
        <OfflineBanner />
        <main className={`flex-1 ${fullBleed ? "" : "pb-24"}`}>{children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
