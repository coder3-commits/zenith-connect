import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export function PinDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin("");
      setTimeout(() => ref.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-[480px] rounded-t-3xl bg-card p-6 pb-10 shadow-fab animate-in slide-in-from-bottom">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Enter Transaction PIN</h3>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">Enter your 4-digit PIN to confirm.</p>

        <div className="mt-5 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex h-14 w-12 items-center justify-center rounded-2xl border-2 text-2xl font-bold transition ${
                pin.length > i ? "border-primary bg-primary/5" : "border-input bg-surface"
              }`}
            >
              {pin[i] ? "•" : ""}
            </div>
          ))}
        </div>

        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setPin(v);
            if (v.length === 4) setTimeout(() => onSubmit(v), 150);
          }}
          className="absolute h-px w-px opacity-0"
          autoFocus
        />

        <button
          onClick={() => ref.current?.focus()}
          className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          Open keypad
        </button>
      </div>
    </div>
  );
}
