import type { TxnStatus } from "./wallet";

export type TxnType =
  | "transfer"
  | "fund"
  | "airtime"
  | "data"
  | "electricity"
  | "exam"
  | "crypto"
  | string;

export type Transaction = {
  id: string;
  reference: string;
  type: TxnType;
  status: TxnStatus;
  amount: number | string;
  fee?: number | string;
  narration?: string;
  createdAt: string;
  meta?: Record<string, unknown>;
};
