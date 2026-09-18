import { z } from 'zod';

/**
 * Mirrors the backend's own rules so the user gets feedback before a round-trip — it does not
 * replace them. §0.13: minimum 8 characters, at least one letter and one digit (the backend's
 * `@ValidPassword`). Anything stricter here than on the server would reject valid passwords.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number');

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export const registerSchema = z.object({
  email: z.email('Enter a valid email address'),
  displayName: z
    .string()
    .trim()
    .min(1, 'Enter a display name')
    .max(100, 'Keep it under 100 characters'),
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
