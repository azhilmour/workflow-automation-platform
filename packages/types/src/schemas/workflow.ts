import { z } from 'zod';

// Node schemas
export const NodeParametersSchema = z.record(z.string(), z.any());

export const NodeCredentialsSchema = z.record(
  z.string(),
  z.object({
    id: z.string().nullable(),
    name: z.string(),
  })
);

export const NodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  typeVersion: z.number(),
  type: z.string(),
  position: z.tuple([z.number(), z.number()]),
  disabled: z.boolean().optional(),
  notes: z.string().optional(),
  retryOnFail: z.boolean().optional(),
  maxTries: z.number().optional(),
  waitBetweenTries: z.number().optional(),
  executeOnce: z.boolean().optional(),
  continueOnFail: z.boolean().optional(),
  parameters: NodeParametersSchema,
  credentials: NodeCredentialsSchema.optional(),
  webhookId: z.string().optional(),
  extendsCredential: z.string().optional(),
});

// Connection schemas
export const ConnectionSchema = z.object({
  node: z.string(),
  type: z.string(),
  index: z.number(),
});

export const NodeInputConnectionsSchema = z.array(z.array(ConnectionSchema).nullable());

export const NodeConnectionsSchema = z.record(z.string(), NodeInputConnectionsSchema);

export const ConnectionsSchema = z.record(z.string(), NodeConnectionsSchema);

// Workflow schemas
export const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(128),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional().default('INACTIVE'),
  nodes: z.array(NodeSchema),
  connections: ConnectionsSchema,
});

export const UpdateWorkflowSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  nodes: z.array(NodeSchema).optional(),
  connections: ConnectionsSchema.optional(),
});

export const WorkflowResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
  nodes: z.array(NodeSchema),
  connections: ConnectionsSchema,
  triggerCount: z.number(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateWorkflowInput = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof UpdateWorkflowSchema>;
export type WorkflowResponse = z.infer<typeof WorkflowResponseSchema>;
