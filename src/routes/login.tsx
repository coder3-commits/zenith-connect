import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { api, auth } from "@/lib/api";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data: any = await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      const token = data.token || data.accessToken;
      const user = data.user;
      if (!token) throw new Error("Missing token in response");
      auth.set(token, user);
      toast.success("Welcome back");
      navigate({ to: "/home" });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex flex-col">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-mesh opacity-90" />
        <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl animate-drift" />
        <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/40 blur-3xl" />

        <div className="relative px-6 pt-14">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass-dark">
            <span className="font-display text-2xl font-extrabold bg-gradient-accent bg-clip-text text-transparent">Z</span>
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">Welcome back 👋</h1>
          <p className="mt-1.5 text-sm text-white/75">Sign in to keep your money moving.</p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="-mt-12 mx-4 flex-1 rounded-[2rem] bg-card p-6 shadow-float flex flex-col animate-slide-up-fade"
      >
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
        <div className="relative mt-2">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-13 w-full rounded-2xl border border-input bg-surface pl-11 pr-4 py-3.5 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            placeholder="you@example.com"
          />
        </div>

        <label className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
        <div className="relative mt-2">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-13 w-full rounded-2xl border border-input bg-surface pl-11 pr-12 py-3.5 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>

        <Link to="/login" className="mt-3 self-end text-xs font-semibold text-primary">
          Forgot password?
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="mt-7 flex h-14 items-center justify-center rounded-full bg-gradient-brand text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in securely"}
        </button>

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          Bank-grade encryption · Trusted by Nigerians
        </div>

        <p className="mt-auto pt-8 text-center text-sm text-muted-foreground">
          New to Zentrix?{" "}
          <Link to="/register" className="font-semibold text-primary">
            Create account
          </Link>
        </p>
      </form>
      <div className="h-6" />
    </div>
  );
}
