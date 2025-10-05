import type { ExecutionStatus, INodeExecution } from '@repo/db';

export interface IExecutionContext {
  executionId: string;
  workflowId: number;
  userId: string;
  triggerData: Record<string, any>;
  nodeOutputs: Map<string, any>;
  startedAt: Date;
  status: ExecutionStatus;
}

export interface INodeExecutionResult {
  success: boolean;
  output: any;
  error?: string;
}

export enum NodeType {
  TRIGGER = 'trigger',
  HTTP_REQUEST = 'httpRequest',
  SEND_EMAIL = 'sendEmail',
  SEND_TELEGRAM = 'sendTelegram',
  CONDITION = 'condition'
}

export interface INodeExecutor {
  execute(
    node: any,
    context: IExecutionContext,
    inputData: any
  ): Promise<INodeExecutionResult>;
}

export { ExecutionStatus, INodeExecution };

