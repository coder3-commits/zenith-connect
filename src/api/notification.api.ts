import { apiClient } from "./client";
import type { AppNotification } from "@/types/notification";

export const notificationApi = {
  list: () =>
    apiClient.get<{ notifications: AppNotification[] } | AppNotification[]>("/notifications"),
  markRead: (id: string) => apiClient.post<void>(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post<void>("/notifications/read-all"),
};
