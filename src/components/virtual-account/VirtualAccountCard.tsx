import { Card, CardContent } from "@/components/ui/card";

export interface VirtualAccountCardProps {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export function VirtualAccountCard({ bankName, accountNumber, accountName }: VirtualAccountCardProps) {
  return (
    <Card className="overflow-hidden rounded-3xl border-border bg-gradient-balance text-primary-foreground shadow-card">
      <CardContent className="space-y-4 p-6">
        <Row label="Bank Name" value={bankName} />
        <div className="h-px w-full bg-white/15" />
        <Row label="Account Number" value={accountNumber} mono />
        <div className="h-px w-full bg-white/15" />
        <Row label="Account Name" value={accountName} />
      </CardContent>
    </Card>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-[0.14em] text-white/65">{label}</span>
      <span className={`text-base ${mono ? "font-mono font-bold tracking-wider" : "font-semibold"}`}>
        {value}
      </span>
    </div>
  );
}
