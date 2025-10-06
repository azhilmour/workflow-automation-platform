import { z } from 'zod';

// Zod schemas for credentials request validation
export const CreateCredentialsSchema = z.object({
  for: z.string().min(1, 'For field is required'),
  data: z.string().min(1, 'Data is required'),
  userId: z.string().min(1, 'User ID is required'),
});

export const UpdateCredentialsSchema = z.object({
  for: z.string().min(1, 'For field is required').optional(),
  data: z.string().min(1, 'Data is required').optional(),
});

export const CredentialsResponseSchema = z.object({
  id: z.number(),
  for: z.string(),
  data: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CredentialsListResponseSchema = z.object({
  credentials: z.array(CredentialsResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

// TypeScript types inferred from Zod schemas
export type CreateCredentialsInput = z.infer<typeof CreateCredentialsSchema>;
export type UpdateCredentialsInput = z.infer<typeof UpdateCredentialsSchema>;
export type CredentialsResponse = z.infer<typeof CredentialsResponseSchema>;
export type CredentialsListResponse = z.infer<typeof CredentialsListResponseSchema>;
