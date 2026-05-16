import { apiClient } from "./client";
import type { Transaction } from "@/types/transaction";

export const transactionApi = {
  list: (params?: { page?: number; pageSize?: number; type?: string }) =>
    apiClient.get<{ transactions: Transaction[] } | Transaction[]>("/wallet/transactions", {
      query: params,
    }),
  detail: (id: string) => apiClient.get<Transaction>(`/wallet/transactions/${id}`),
};
