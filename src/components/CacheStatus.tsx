import { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";

function ago(ts: number) {
  if (!ts) return "never";
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/**
 * Tiny status pill: shows "Live • Updated Xs ago" when online and fetched,
 * "Cached" when offline or while serving from persisted cache.
 */
export function CacheStatus({
  dataUpdatedAt,
  isFetching,
  className = "",
}: {
  dataUpdatedAt: number;
  isFetching?: boolean;
  className?: string;
}) {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [, tick] = useState(0);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    const id = window.setInterval(() => tick((n) => n + 1), 30_000);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.clearInterval(id);
    };
  }, []);

  if (!dataUpdatedAt && !isFetching) return null;

  const cached = !online;
  const label = isFetching
    ? "Refreshing…"
    : cached
      ? `Cached · ${ago(dataUpdatedAt)}`
      : `Updated ${ago(dataUpdatedAt)}`;

  const Icon = isFetching ? RefreshCw : cached ? CloudOff : Cloud;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
        cached
          ? "bg-warning/15 text-warning"
          : "bg-success/15 text-success"
      } ${className}`}
    >
      <Icon className={`h-2.5 w-2.5 ${isFetching ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}
