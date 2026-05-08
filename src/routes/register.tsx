import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>) => ({ ref: typeof s.ref === "string" ? s.ref : undefined }),
  component: RegisterPage,
});

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
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        required
        inputMode={inputMode}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-12 w-full rounded-xl border border-input bg-surface px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-balance px-6 pb-10 pt-14 text-primary-foreground">
        <h1 className="font-display text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-white/70">Join thousands paying smarter on Zentrix.</p>
      </div>
      <form onSubmit={onSubmit} className="-mt-6 mx-4 rounded-3xl bg-card p-6 shadow-card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" k="firstName" />
          <Field label="Last name" k="lastName" />
        </div>
        <Field label="Email" k="email" type="email" inputMode="email" placeholder="you@example.com" />
        <Field label="Phone" k="phone" type="tel" inputMode="tel" placeholder="08012345678" />
        <Field label="Password" k="password" type="password" placeholder="At least 8 characters" />

        <button
          disabled={loading}
          className="flex h-13 w-full items-center justify-center rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-fab transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create account"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary">Sign in</Link>
        </p>
      </form>
      <div className="h-10" />
    </div>
  );
}
