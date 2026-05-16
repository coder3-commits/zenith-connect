/**
 * @deprecated Compatibility shim. New code should import from `@/api` and use
 * the typed service modules (`authApi`, `walletApi`, ...). This file remains so
 * existing routes keep compiling — all requests are now routed through the
 * central axios instance with interceptors, idempotency, and global error
 * handling.
 */
import { apiClient } from "@/api/client";
import { ApiError as NewApiError } from "@/types/api";
import { tokenStore } from "@/store/tokenStore";
import { useAuthStore } from "@/store/authStore";

export { NewApiError as ApiError };

export type ApiUser = {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  kyc_status?: string;
};

const USER_KEY = "zentrix.user";

// Auth facade — preserves the legacy surface used by existing routes, but
// keeps the Zustand store in sync so the new architecture stays authoritative.
export const auth = {
  getToken(): string | null {
    return tokenStore.get();
  },
  getUser(): ApiUser | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as ApiUser) : null;
  },
  set(token: string, user: ApiUser) {
    useAuthStore.getState().setSession(token, user);
  },
  clear() {
    useAuthStore.getState().logout();
  },
};

type ApiOpts = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** Reserved for compatibility — axios instance owns the timeout. */
  timeoutMs?: number;
  /** Reserved for compatibility — retries handled by React Query. */
  retries?: number;
  /** Optional idempotency key forwarded as `Idempotency-Key`. */
  idempotencyKey?: string;
};

export async function api<T = any>(path: string, opts: ApiOpts = {}): Promise<T> {
  const { method = "GET", body, query, idempotencyKey } = opts;
  const m = method.toUpperCase();
  const reqOpts = {
    query: query as Record<string, string | number | undefined>,
    idempotencyKey,
  };
  switch (m) {
    case "GET":
      return apiClient.get<T>(path, reqOpts);
    case "POST":
      return apiClient.post<T>(path, body, reqOpts);
    case "PUT":
      return apiClient.put<T>(path, body, reqOpts);
    case "PATCH":
      return apiClient.patch<T>(path, body, reqOpts);
    case "DELETE":
      return apiClient.del<T>(path, reqOpts);
    default:
      return apiClient.get<T>(path, reqOpts);
  }
}

export const formatNaira = (n: number | string | undefined | null) => {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return "₦" + (v || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
