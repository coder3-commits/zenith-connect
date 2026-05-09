import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function ScreenHeader({
  title,
  subtitle,
  right,
  back = true,
  transparent = false,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  back?: boolean;
  transparent?: boolean;
}) {
  const router = useRouter();
  return (
    <header
      className={`sticky top-0 z-30 flex items-center gap-3 px-4 py-3 ${
        transparent ? "" : "bg-background/85 backdrop-blur-xl"
      }`}
    >
      {back && (
        <button
          onClick={() => router.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground transition active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="truncate font-display text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
