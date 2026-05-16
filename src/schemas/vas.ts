import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^0\d{10}$/, "Enter a valid 11-digit phone number");

export const airtimeSchema = z.object({
  network: z.string().min(2, "Select a network"),
  phone: phoneSchema,
  amount: z.number().min(50, "Minimum is ₦50").max(50_000, "Maximum is ₦50,000"),
});

export const dataSchema = z.object({
  network: z.string().min(2, "Select a network"),
  phone: phoneSchema,
  planId: z.string().min(1, "Select a plan"),
});

export const electricitySchema = z.object({
  disco: z.string().min(2, "Select a provider"),
  meterNumber: z.string().min(6, "Enter a valid meter number"),
  meterType: z.enum(["prepaid", "postpaid"]),
  amount: z.number().min(500, "Minimum is ₦500").max(500_000, "Maximum is ₦500,000"),
});

export const examSchema = z.object({
  examType: z.string().min(2, "Select an exam"),
  quantity: z.number().int().min(1).max(20),
});
