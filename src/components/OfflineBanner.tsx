import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (online) return null;
  return (
    <div className="sticky top-0 z-50 animate-slide-up-fade">
      <div className="mx-3 mt-2 flex items-center justify-center gap-2 rounded-2xl bg-warning/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-card">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground" />
        </span>
        <WifiOff className="h-3.5 w-3.5" /> You're offline — showing cached data
      </div>
    </div>
  );
}
