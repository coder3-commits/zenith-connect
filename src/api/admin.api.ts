// Admin API surface — kept fully isolated from the user client.
// Reuses the same axios instance but is namespaced under /admin and
// only intended to be called from routes guarded by `requireAdmin`.

import { apiClient } from "./client";

export const adminApi = {
  ping: () => apiClient.get<{ ok: true }>("/admin/health"),
  // Add admin endpoints here as the admin surface grows.
};
