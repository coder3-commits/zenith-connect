import { z } from "zod";

export const transferSchema = z.object({
  bankCode: z.string().min(2, "Select a bank"),
  accountNumber: z.string().regex(/^\d{10}$/, "Account number must be 10 digits"),
  amount: z.number().min(100, "Minimum is ₦100").max(1_000_000, "Maximum is ₦1,000,000"),
  narration: z.string().max(100).optional(),
});

export const fundSchema = z.object({
  amount: z.number().min(100, "Minimum is ₦100").max(5_000_000, "Maximum is ₦5,000,000"),
});

export const pinSchema = z.string().regex(/^\d{4}$/, "Enter a 4-digit PIN");

export type TransferInput = z.infer<typeof transferSchema>;
export type FundInput = z.infer<typeof fundSchema>;
