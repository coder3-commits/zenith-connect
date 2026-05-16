import { ApiError } from "@/types/api";

const STATUS_FALLBACK: Record<number, string> = {
  400: "That request couldn't be processed. Please review and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  408: "The request took too long. Check your connection and try again.",
  409: "That action conflicts with the current state. Please refresh.",
  422: "Some of the information provided was invalid.",
  429: "You're going a bit fast. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again shortly.",
  502: "We're having trouble reaching the service. Try again shortly.",
  503: "Service is temporarily unavailable. Please try again shortly.",
  504: "The service didn't respond in time. Please try again.",
};

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.message && err.message.trim()) return err.message;
    return STATUS_FALLBACK[err.status] ?? "Something went wrong.";
  }
  if (err instanceof Error) {
    if (err.name === "AbortError" || /aborted/i.test(err.message)) {
      return "The request timed out. Please try again.";
    }
    if (/network|fetch|failed to fetch/i.test(err.message)) {
      return "Network error. Check your connection and try again.";
    }
    return err.message;
  }
  return "Something went wrong.";
}

export function isAuthError(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}
