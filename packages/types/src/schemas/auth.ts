import { z } from 'zod';

// Zod schemas for request validation
export const SignupRequestSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const LoginRequestSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// TypeScript types for responses (not Zod schemas)
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

// Infer TypeScript types from Zod schemas
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
