import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/api/profile.api";
import { useAuthStore } from "@/store/authStore";
import { queryKeys } from "./keys";

export function useProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: async () => {
      const u = await profileApi.get();
      if (u) setUser(u);
      return u;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: (u) => {
      qc.setQueryData(queryKeys.profile.me(), u);
      qc.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useSetPin() {
  return useMutation({
    mutationFn: profileApi.setPin,
  });
}
