import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

/* ---------------- GlassCard ---------------- */
export function GlassCard({
  className,
  children,
  dark = false,
}: {
  className?: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className={cn(dark ? "glass-dark" : "glass", "rounded-3xl", className)}>{children}</div>
  );
}

/* ---------------- IconTile ---------------- */
export function IconTile({
  Icon,
  className,
  size = "md",
}: {
  Icon: React.ComponentType<{ className?: string }>;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-14 w-14" : "h-11 w-11";
  const icon = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-primary/10 text-primary",
        dim,
        className,
      )}
    >
      <Icon className={icon} />
    </span>
  );
}

/* ---------------- SectionHeader ---------------- */
export function SectionHeader({
  title,
  action,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between px-1 pb-3">
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({
  Icon,
  title,
  description,
  action,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xs px-6 py-14 text-center animate-slide-up-fade">
      <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/10 to-accent/15 text-primary">
        <span className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl" />
        <Icon className="relative h-9 w-9" strokeWidth={1.6} />
      </div>
      <p className="font-display text-base font-semibold">{title}</p>
      {description && (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------- SkeletonRow ---------------- */
export function SkeletonRow({ className }: { className?: string }) {
  return <div className={cn("h-16 w-full rounded-2xl animate-shimmer", className)} />;
}

/* ---------------- AmountDisplay (with count-up) ---------------- */
export function AmountDisplay({
  value,
  hidden = false,
  className,
  prefix = "₦",
  decimals = 2,
  animate = true,
}: {
  value: number;
  hidden?: boolean;
  className?: string;
  prefix?: string;
  decimals?: number;
  animate?: boolean;
}) {
  const [shown, setShown] = useState(animate ? 0 : value);
  const fromRef = useRef(0);
  useEffect(() => {
    if (!animate) { setShown(value); return; }
    const from = fromRef.current;
    const to = value || 0;
    const dur = 600;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);

  if (hidden) {
    return <span className={cn("tabular text-balance-amount", className)}>{prefix} ••••••</span>;
  }
  return (
    <span className={cn("tabular text-balance-amount", className)}>
      {prefix}
      {shown.toLocaleString("en-NG", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

/* ---------------- StatChip ---------------- */
export function StatChip({
  label,
  value,
  tone = "neutral",
  Icon,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warn" | "info";
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/10 text-white/90",
    success: "bg-success/20 text-success-foreground",
    warn: "bg-warning/20 text-foreground",
    info: "bg-accent/20 text-accent-foreground",
  };
  return (
    <div className={cn("flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium", tones[tone])}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
        <span className="tabular text-sm font-semibold">{value}</span>
      </div>
    </div>
  );
}

/* ---------------- SuccessAnimation ---------------- */
export function SuccessAnimation({ size = 96 }: { size?: number }) {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full bg-success/20 animate-pulse-ring" />
      <span className="absolute inset-0 rounded-full bg-success/15" />
      <span className="relative flex items-center justify-center rounded-full bg-gradient-success text-white animate-check-pop"
            style={{ width: size, height: size }}>
        <CheckCircle2 style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2.2} />
      </span>
    </div>
  );
}

/* ---------------- Sparkline (lightweight inline SVG) ---------------- */
export function Sparkline({
  data,
  width = 80,
  height = 28,
  color = "currentColor",
  fill = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / span) * height}`);
  const path = "M" + points.join(" L");
  const area = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      {fill && (
        <path d={area} fill={color} opacity={0.15} />
      )}
      <path d={path} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Ripple Button (subtle) ---------------- */
export function RippleButton({
  className,
  children,
  onClick,
  disabled,
  type = "button",
}: {
  className?: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden transition active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100",
        className,
      )}
    >
      {children}
    </button>
  );
}
