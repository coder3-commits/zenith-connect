import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, ShieldCheck, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>) => ({ ref: typeof s.ref === "string" ? s.ref : undefined }),
  component: RegisterPage,
});

function passwordScore(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s; // 0..4
}

function RegisterPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/register" });
  const [referralCode] = useState<string>(search.ref ?? "");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const score = useMemo(() => passwordScore(form.password), [form.password]);
  const scoreLabel = ["Too weak", "Weak", "Okay", "Strong", "Excellent"][score];
  const scoreColor = ["bg-destructive", "bg-destructive", "bg-warning", "bg-success", "bg-gradient-success"][score];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/auth/register", {
        method: "POST",
        body: { ...form, referralCode: referralCode || undefined },
      });
      toast.success("Account created — please log in");
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const Field = ({
    label,
    k,
    type = "text",
    placeholder,
    inputMode,
  }: {
    label: string;
    k: keyof typeof form;
    type?: string;
    placeholder?: string;
    inputMode?: "text" | "email" | "tel" | "numeric";
  }) => (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        required
        inputMode={inputMode}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-13 w-full rounded-2xl border border-input bg-surface px-4 py-3.5 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-hero px-6 pb-14 pt-14 text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-mesh opacity-80" />
        <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-accent/30 blur-3xl animate-drift" />
        <div className="relative">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass-dark">
            <span className="font-display text-2xl font-extrabold bg-gradient-accent bg-clip-text text-transparent">Z</span>
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-white/75">Join thousands paying smarter on Zentrix.</p>
          {referralCode && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full glass-dark px-3 py-1.5 text-xs font-medium">
              <Check className="h-3.5 w-3.5 text-accent" />
              Referral applied · {referralCode}
            </div>
          )}
        </div>
      </div>
      <form onSubmit={onSubmit} className="-mt-8 mx-4 rounded-[2rem] bg-card p-6 shadow-float space-y-4 animate-slide-up-fade">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" k="firstName" />
          <Field label="Last name" k="lastName" />
        </div>
        <Field label="Email" k="email" type="email" inputMode="email" placeholder="you@example.com" />
        <Field label="Phone" k="phone" type="tel" inputMode="tel" placeholder="08012345678" />
        <Field label="Password" k="password" type="password" placeholder="At least 8 characters" />

        {form.password.length > 0 && (
          <div className="space-y-2">
            <div className="flex h-1.5 gap-1 overflow-hidden rounded-full bg-muted">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-full flex-1 rounded-full transition-colors ${i < score ? scoreColor : "bg-muted"}`}
                />
              ))}
            </div>
            <p className="text-[11px] font-medium text-muted-foreground">Password strength: <span className="text-foreground">{scoreLabel}</span></p>
          </div>
        )}

        <button
          disabled={loading}
          className="flex h-14 w-full items-center justify-center rounded-full bg-gradient-brand text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create account"}
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
          By continuing you agree to Zentrix's Terms & Privacy
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary">Sign in</Link>
        </p>
      </form>
      <div className="h-12" />
    </div>
  );
}
