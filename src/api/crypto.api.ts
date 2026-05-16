import { apiClient } from "./client";

export type CryptoRate = { symbol: string; buy: number; sell: number };

export const cryptoApi = {
  rates: () => apiClient.get<{ rates: CryptoRate[] } | CryptoRate[]>("/crypto/rates"),
  buy: (body: { symbol: string; amount: number; pin: string }, idempotencyKey: string) =>
    apiClient.post<{ reference: string; status: string }>("/crypto/buy", body, { idempotencyKey }),
  sell: (body: { symbol: string; amount: number; pin: string }, idempotencyKey: string) =>
    apiClient.post<{ reference: string; status: string }>("/crypto/sell", body, { idempotencyKey }),
};
