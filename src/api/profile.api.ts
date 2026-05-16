import { apiClient } from "./client";
import type { User } from "@/types/user";

export const profileApi = {
  get: () => apiClient.get<User>("/user/profile"),
  update: (patch: Partial<User>) => apiClient.patch<User>("/user/profile", patch),
  setPin: (body: { pin: string; currentPin?: string }) =>
    apiClient.post<void>("/user/pin", body),
};
