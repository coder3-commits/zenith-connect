import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2, ArrowDown } from "lucide-react";

const THRESHOLD = 70;
const MAX_PULL = 120;

export function PullToRefresh({
  onRefresh,
  refreshing,
  children,
}: {
  onRefresh: () => void | Promise<unknown>;
  refreshing: boolean;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const armed = useRef(false);

  useEffect(() => {
    if (!refreshing && pull !== 0) setPull(0);
  }, [refreshing]);

  function onTouchStart(e: React.TouchEvent) {
    if (refreshing) return;
    const scrollEl = document.scrollingElement || document.documentElement;
    if (scrollEl.scrollTop > 0) { armed.current = false; return; }
    armed.current = true;
    startY.current = e.touches[0].clientY;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!armed.current || startY.current == null || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) { setPull(0); return; }
    // Resistance curve
    const eased = Math.min(MAX_PULL, dy * 0.5);
    setPull(eased);
  }

  function onTouchEnd() {
    if (!armed.current) return;
    armed.current = false;
    startY.current = null;
    if (pull >= THRESHOLD) {
      void onRefresh();
    } else {
      setPull(0);
    }
  }

  const indicatorOffset = refreshing ? THRESHOLD : pull;
  const ready = pull >= THRESHOLD;

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      className="relative"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center"
        style={{
          transform: `translateY(${Math.max(0, indicatorOffset - 40)}px)`,
          opacity: indicatorOffset > 8 ? 1 : 0,
          transition: refreshing || pull === 0 ? "transform 200ms ease, opacity 200ms ease" : "none",
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card">
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <ArrowDown
              className={`h-4 w-4 text-primary transition-transform ${ready ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </div>
      <div
        style={{
          transform: `translateY(${indicatorOffset}px)`,
          transition: refreshing || pull === 0 ? "transform 200ms ease" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
