import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/wallet/transfer")({ component: TransferPage });

function TransferPage() {
  return (
    <MobileShell hideNav>
      <ScreenHeader title="Send Money" />
      <div className="px-6 pt-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Construction className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold">Coming soon</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Bank transfers will be available once your provider integration is wired.
        </p>
      </div>
    </MobileShell>
  );
}
