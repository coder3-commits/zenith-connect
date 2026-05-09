import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { auth } from "@/lib/api";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: auth.getToken() ? "/home" : "/login" });
    }, 1700);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero text-primary-foreground">
      {/* Drifting blobs */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-accent/40 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute -bottom-44 -right-24 h-96 w-96 rounded-full bg-primary/50 blur-3xl animate-drift" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex flex-col items-center gap-7 animate-scale-in-soft">
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-accent/30 blur-2xl animate-pulse-ring" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] glass-dark shadow-glow">
            <span className="font-display text-6xl font-extrabold tracking-tight bg-gradient-accent bg-clip-text text-transparent">
              Z
            </span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-display text-5xl font-extrabold tracking-tight">Zentrix</h1>
          <p className="mt-2 text-sm font-medium text-white/70">Pay. Buy. Send. Faster.</p>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-1.5 rounded-full glass-dark px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Secured · Encrypted · Instant
        </div>
      </div>
    </div>
  );
}
