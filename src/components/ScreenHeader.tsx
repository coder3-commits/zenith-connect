import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function ScreenHeader({
  title,
  right,
  back = true,
}: {
  title: string;
  right?: ReactNode;
  back?: boolean;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-background/90 px-4 py-3 backdrop-blur">
      {back && (
        <button
          onClick={() => router.history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 font-display text-lg font-semibold">{title}</h1>
      {right}
    </header>
  );
}
