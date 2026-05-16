import { apiClient } from "./client";
import type { Session, User } from "@/types/user";

export type LoginPayload = { emailOrPhone: string; password: string };
export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
};

export const authApi = {
  login: (body: LoginPayload) => apiClient.post<Session>("/auth/login", body),
  register: (body: RegisterPayload) => apiClient.post<Session>("/auth/register", body),
  me: () => apiClient.get<User>("/auth/me"),
  logout: () => apiClient.post<void>("/auth/logout").catch(() => undefined),
  refresh: () => apiClient.post<Session>("/auth/refresh"),
};
