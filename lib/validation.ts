import { z } from "zod";

/* ===========================
   Register Schema
=========================== */

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters.")
      .max(50, "Name cannot exceed 50 characters."),

    email: z
      .email("Please enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain one uppercase letter.")
      .regex(/[a-z]/, "Password must contain one lowercase letter.")
      .regex(/[0-9]/, "Password must contain one number."),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/* ===========================
   Login Schema
=========================== */

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),

  password: z.string().min(1, "Password is required."),
});

/* ===========================
   Forgot Password Schema
=========================== */

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address."),
});

/* ===========================
   Types
=========================== */

export type RegisterFormData = z.infer<typeof registerSchema>;

export type LoginFormData = z.infer<typeof loginSchema>;

export type ForgotPasswordFormData = z.infer<
  typeof forgotPasswordSchema
>;