import { apiClient } from "./client";
import type { Bank, FundInitResult, FundPayload, TransferPayload, TransferResult, Wallet } from "@/types/wallet";

export const walletApi = {
  get: () => apiClient.get<{ wallet: Wallet }>("/wallet"),
  banks: () => apiClient.get<{ banks: Bank[] } | Bank[]>("/wallet/banks"),
  verifyAccount: (bankCode: string, accountNumber: string) =>
    apiClient.get<{ accountName: string }>("/wallet/verify-account", {
      query: { bankCode, accountNumber },
    }),
  transfer: (body: TransferPayload, idempotencyKey: string) =>
    apiClient.post<TransferResult>("/wallet/transfer", body, { idempotencyKey }),
  fund: (body: FundPayload, idempotencyKey: string) =>
    apiClient.post<FundInitResult>("/wallet/fund", body, { idempotencyKey }),
};
