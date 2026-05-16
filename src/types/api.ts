// Shared API types

export type ApiEnvelope<T> = {
  data?: T;
  message?: string;
  error?: string;
  [k: string]: unknown;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;
  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type Idempotent = { idempotencyKey?: string };
