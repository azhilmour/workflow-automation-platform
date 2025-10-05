import type { IExecutionContext } from '../types/execution.types';
import { ExecutionStatus } from '@repo/db';

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

  setNodeOutput(nodeId: string, output: any): void {
    this.nodeOutputs.set(nodeId, output);
  }

  getNodeOutput(nodeId: string): any {
    return this.nodeOutputs.get(nodeId);
  }

  setStatus(status: ExecutionStatus): void {
    this.status = status;
  }
}

