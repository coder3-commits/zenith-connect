import axios, { AxiosError, type AxiosInstance } from "axios";
import { ApiError } from "@/types/api";
import { tokenStore } from "@/store/tokenStore";

const BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "https://api.zentrix.app/api/v1";

// Single shared axios instance for the user-facing app.
export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// ----- Request: attach auth + idempotency -----
http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----- Response: unwrap + normalize errors + global 401 handling -----
type GlobalOn401 = (() => void) | null;
let on401: GlobalOn401 = null;
export const setOn401Handler = (fn: GlobalOn401) => {
  on401 = fn;
};

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    // Network / aborted
    if (!err.response) {
      const message = err.code === "ECONNABORTED"
        ? "Request timed out"
        : "Network error";
      return Promise.reject(new ApiError(message, 0, err.code));
    }

    const { status, data } = err.response;
    const message =
      (data && (data.message || data.error)) ||
      err.message ||
      `Request failed (${status})`;

    if (status === 401) {
      // Fire global handler exactly once per response
      try { on401?.(); } catch { /* noop */ }
    }

    return Promise.reject(new ApiError(message, status, (data as any)?.code, data));
  },
);

// ----- Helpers -----
function unwrap<T>(payload: any): T {
  if (payload == null) return payload as T;
  if (typeof payload === "object" && "data" in payload && Object.keys(payload).length <= 3) {
    // common envelope: { data, message }
    return (payload as any).data ?? payload;
  }
  return payload as T;
}

type ReqOpts = {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  query?: Record<string, string | number | boolean | undefined>;
};

function applyOpts(opts?: ReqOpts) {
  const headers: Record<string, string> = { ...(opts?.headers ?? {}) };
  if (opts?.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;
  return { headers, params: opts?.query, signal: opts?.signal };
}

export const apiClient = {
  async get<T>(path: string, opts?: ReqOpts): Promise<T> {
    const res = await http.get(path, applyOpts(opts));
    return unwrap<T>(res.data);
  },
  async post<T>(path: string, body?: unknown, opts?: ReqOpts): Promise<T> {
    const res = await http.post(path, body, applyOpts(opts));
    return unwrap<T>(res.data);
  },
  async put<T>(path: string, body?: unknown, opts?: ReqOpts): Promise<T> {
    const res = await http.put(path, body, applyOpts(opts));
    return unwrap<T>(res.data);
  },
  async patch<T>(path: string, body?: unknown, opts?: ReqOpts): Promise<T> {
    const res = await http.patch(path, body, applyOpts(opts));
    return unwrap<T>(res.data);
  },
  async del<T>(path: string, opts?: ReqOpts): Promise<T> {
    const res = await http.delete(path, applyOpts(opts));
    return unwrap<T>(res.data);
  },
};

export type { ReqOpts };
