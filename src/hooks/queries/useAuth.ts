import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginPayload, type RegisterPayload } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { queryKeys } from "./keys";

export function useMe(enabled = true) {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const user = await authApi.me();
      if (user) setUser(user);
      return user;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginPayload) => authApi.login(body),
    onSuccess: (session) => {
      if (session?.token && session.user) {
        setSession(session.token, session.user);
        qc.setQueryData(queryKeys.auth.me(), session.user);
      }
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterPayload) => authApi.register(body),
    onSuccess: (session) => {
      if (session?.token && session.user) {
        setSession(session.token, session.user);
        qc.setQueryData(queryKeys.auth.me(), session.user);
      }
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      qc.clear();
    },
  });
}
