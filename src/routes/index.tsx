import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { auth } from "@/lib/api";

export const Route = createFileRoute("/")({ component: Splash });

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: auth.getToken() ? "/home" : "/login" });
    }, 1600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-balance text-primary-foreground">
      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-primary/40 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-accent/30 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
            <span className="font-display text-5xl font-extrabold tracking-tight bg-gradient-accent bg-clip-text text-transparent">
              Z
            </span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Zentrix</h1>
          <p className="mt-2 text-sm text-white/70">Pay. Buy. Send. Faster.</p>
        </div>

        <div className="absolute bottom-[-180px] flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
