import { useQuery } from "@tanstack/react-query";
import { transactionApi } from "@/api/transaction.api";
import { queryKeys } from "./keys";

export function useTransactions(params?: { page?: number; pageSize?: number; type?: string }) {
  return useQuery({
    queryKey: queryKeys.transactions.list(params),
    queryFn: () => transactionApi.list(params),
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id ?? ""),
    queryFn: () => transactionApi.detail(id as string),
    enabled: Boolean(id),
  });
}
