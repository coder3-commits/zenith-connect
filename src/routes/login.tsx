import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative h-56 bg-gradient-balance overflow-hidden">
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative px-6 pt-14 text-primary-foreground">
          <h1 className="font-display text-3xl font-bold">Welcome back 👋</h1>
          <p className="mt-2 text-sm text-white/70">Sign in to continue your day.</p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="-mt-10 mx-4 flex-1 rounded-3xl bg-card p-6 shadow-card flex flex-col"
      >
        <label className="text-sm font-medium text-foreground">Email</label>
        <input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 h-12 rounded-xl border border-input bg-surface px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="you@example.com"
        />

        <label className="mt-4 text-sm font-medium text-foreground">Password</label>
        <div className="relative mt-1.5">
          <input
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-surface px-4 pr-12 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <Link to="/login" className="mt-3 self-end text-xs font-medium text-primary">
          Forgot password?
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-13 items-center justify-center rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log In"}
        </button>

        <p className="mt-auto pt-8 text-center text-sm text-muted-foreground">
          New to Zentrix?{" "}
          <Link to="/register" className="font-semibold text-primary">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
