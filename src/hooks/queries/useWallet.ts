import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/api/wallet.api";
import type { Bank, FundPayload, TransferPayload } from "@/types/wallet";
import { queryKeys } from "./keys";
import { useSafeMutation } from "./useSafeMutation";

export function useWallet() {
  return useQuery({
    queryKey: queryKeys.wallet.balance(),
    queryFn: () => walletApi.get(),
  });
}

export function useBanks() {
  return useQuery({
    queryKey: queryKeys.wallet.banks(),
    queryFn: async () => {
      const res = await walletApi.banks();
      const raw = (res as any)?.banks ?? res ?? [];
      return (Array.isArray(raw) ? raw : []).map((b: any) => ({
        code: String(b.code ?? b.bankCode),
        name: String(b.name ?? b.bankName),
      })) as Bank[];
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useVerifyAccount() {
  return useMutation({
    mutationFn: ({ bankCode, accountNumber }: { bankCode: string; accountNumber: string }) =>
      walletApi.verifyAccount(bankCode, accountNumber),
  });
}

export function useTransfer() {
  const qc = useQueryClient();
  return useSafeMutation<
    Awaited<ReturnType<typeof walletApi.transfer>>,
    TransferPayload
  >(
    ({ variables, idempotencyKey }) => walletApi.transfer(variables, idempotencyKey),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
        qc.invalidateQueries({ queryKey: queryKeys.transactions.list() });
      },
    },
  );
}

export function useFundWallet() {
  const qc = useQueryClient();
  return useSafeMutation<
    Awaited<ReturnType<typeof walletApi.fund>>,
    FundPayload
  >(
    ({ variables, idempotencyKey }) => walletApi.fund(variables, idempotencyKey),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() });
      },
    },
  );
}
