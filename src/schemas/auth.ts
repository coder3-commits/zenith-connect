import { z } from "zod";

export const loginSchema = z.object({
  emailOrPhone: z.string().min(3, "Enter your email or phone"),
  password: z.string().min(6, "Password is too short"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(2, "Enter your first name"),
  lastName: z.string().min(2, "Enter your last name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\+?\d{10,15}$/, "Enter a valid phone number"),
  password: z.string().min(8, "Use at least 8 characters"),
  referralCode: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;
