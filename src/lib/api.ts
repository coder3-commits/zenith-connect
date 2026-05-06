// Zentrix API client — handles auth token, JSON, and Nigerian-network resilience.
const BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "https://api.zentrix.app/api/v1";

const TOKEN_KEY = "zentrix.token";
const USER_KEY = "zentrix.user";

export type ApiUser = {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  kyc_status?: string;
};

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  getUser(): ApiUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set(token: string, user: ApiUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ApiOpts = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  timeoutMs?: number;
  retries?: number;
};

export async function api<T = any>(path: string, opts: ApiOpts = {}): Promise<T> {
  const { method = "GET", body, query, timeoutMs = 20000, retries = 2 } = opts;
  const url = new URL(path.startsWith("http") ? path : `${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = auth.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let attempt = 0;
  let lastErr: unknown;
  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      clearTimeout(timer);
      const text = await res.text();
      const data = text ? safeJson(text) : null;
      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
        if (res.status === 401) auth.clear();
        throw new ApiError(msg, res.status);
      }
      return (data?.data ?? data) as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      // Don't retry on auth/validation errors
      if (err instanceof ApiError && err.status < 500 && err.status !== 408) throw err;
      attempt++;
      if (attempt > retries) break;
      await delay(400 * 2 ** attempt); // 800ms, 1600ms
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Network error");
}

function safeJson(t: string) {
  try { return JSON.parse(t); } catch { return null; }
}
function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export const formatNaira = (n: number | string | undefined | null) => {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return "₦" + (v || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
