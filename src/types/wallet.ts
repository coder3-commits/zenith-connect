export type Wallet = {
  balance: string | number;
  currency?: string;
  accountNumber?: string;
  bankName?: string;
};

export type Bank = { code: string; name: string };

export type TransferPayload = {
  bankCode: string;
  accountNumber: string;
  accountName?: string;
  amount: number;
  narration?: string;
  pin: string;
};

export type TransferResult = {
  reference: string;
  status: TxnStatus;
  fee?: number;
};

export type TxnStatus = "pending" | "processing" | "success" | "failed";

export type FundPayload = { amount: number };
export type FundInitResult = { reference: string; authorization_url?: string };
