import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8, 'password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'password must include an uppercase letter')
    .regex(/[a-z]/, 'password must include a lowercase letter')
    .regex(/\d/, 'password must include a number'),
  role: z.enum(['user', 'admin', 'coach', 'dietitian']).optional().default('user'),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  token: z.string().min(1),
});
