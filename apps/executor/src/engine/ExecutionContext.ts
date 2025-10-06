import type { IExecutionContext } from '@repo/types';
import { ExecutionStatus } from '@repo/types';

export class ExecutionContext implements IExecutionContext {
  executionId: string;
  workflowId: number;
  userId: string;
  triggerData: Record<string, any>;
  nodeOutputs: Map<string, any>;
  startedAt: Date;
  status: ExecutionStatus;

  constructor(
    executionId: string,
    workflowId: number,
    userId: string,
    triggerData: Record<string, any>
  ) {
    this.executionId = executionId;
    this.workflowId = workflowId;
    this.userId = userId;
    this.triggerData = triggerData;
    this.nodeOutputs = new Map();
    this.startedAt = new Date();
    this.status = ExecutionStatus.RUNNING;
  }
}
