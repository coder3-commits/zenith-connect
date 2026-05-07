import { useRef } from "react";
import { CheckCircle2, Copy, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { formatNaira } from "@/lib/api";

export type ReceiptDetail = { label: string; value: string };

export function Receipt({
  title,
  amount,
  reference,
  timestamp,
  details,
  onDone,
  onAgain,
  againLabel = "New transaction",
}: {
  title: string;
  amount: number;
  reference: string;
  timestamp: number;
  details: ReceiptDetail[];
  onDone?: () => void;
  onAgain?: () => void;
  againLabel?: string;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const date = new Date(timestamp);
  const dateStr = date.toLocaleString("en-NG", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const textBlock = [
    `ZENTRIX RECEIPT`,
    `${title}`,
    ``,
    `Amount: ${formatNaira(amount)}`,
    `Status: Successful`,
    `Reference: ${reference}`,
    `Date: ${dateStr}`,
    ``,
    ...details.map((d) => `${d.label}: ${d.value}`),
    ``,
    `Thank you for using Zentrix.`,
  ].join("\n");

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      toast.success("Reference copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Zentrix • ${title}`, text: textBlock });
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(textBlock);
      toast.success("Receipt copied to clipboard");
    } catch {
      toast.error("Sharing not supported");
    }
  };

  const download = () => {
    const blob = new Blob([textBlock], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zentrix-${reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const print = () => window.print();

  return (
    <div className="px-4 pb-10 pt-4">
      <div ref={ref} className="overflow-hidden rounded-3xl bg-card shadow-card print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-balance px-6 pb-8 pt-7 text-center text-primary-foreground">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <p className="mt-3 text-xs uppercase tracking-wider text-white/70">{title}</p>
          <p className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            {formatNaira(amount)}
          </p>
          <p className="mt-1 text-xs text-white/70">{dateStr}</p>
        </div>

        {/* Perforation */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
          <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
          <div className="border-t border-dashed border-border" />
        </div>

        {/* Details */}
        <div className="px-6 py-5">
          <div className="space-y-3 text-sm">
            <Row label="Status">
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Successful
              </span>
            </Row>
            <Row label="Reference">
              <button
                onClick={copyRef}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground"
              >
                {reference}
                <Copy className="h-3 w-3 text-muted-foreground" />
              </button>
            </Row>
            {details.map((d) => (
              <Row key={d.label} label={d.label}>
                <span className="text-right font-semibold">{d.value}</span>
              </Row>
            ))}
          </div>

          <div className="mt-6 border-t border-dashed border-border pt-4 text-center">
            <p className="font-display text-sm font-bold text-primary">Zentrix</p>
            <p className="text-[11px] text-muted-foreground">
              Powered by Zentrix • support@zentrix.app
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-3 gap-3 print:hidden">
        <ActionBtn icon={<Share2 className="h-4 w-4" />} label="Share" onClick={share} />
        <ActionBtn icon={<Download className="h-4 w-4" />} label="Download" onClick={download} />
        <ActionBtn icon={<Copy className="h-4 w-4" />} label="Copy ref" onClick={copyRef} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 print:hidden">
        {onAgain && (
          <button
            onClick={onAgain}
            className="rounded-full bg-secondary py-3 text-sm font-semibold text-secondary-foreground"
          >
            {againLabel}
          </button>
        )}
        <button
          onClick={() => (onDone ? onDone() : router.navigate({ to: "/home" }))}
          className={`rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground ${
            !onAgain ? "col-span-2" : ""
          }`}
        >
          Done
        </button>
      </div>

      <button
        onClick={print}
        className="mt-3 w-full py-3 text-xs font-semibold text-muted-foreground print:hidden"
      >
        Print receipt
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

function ActionBtn({
  icon, label, onClick,
}: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-card py-3 text-xs font-semibold shadow-card active:scale-95 transition"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      {label}
    </button>
  );
}
