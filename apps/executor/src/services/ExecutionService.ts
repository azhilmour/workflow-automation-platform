import { AppDataSource } from '@repo/db';
import {
  WorkflowExecutionEntity,
  ExecutionStatus,
  type INodeExecution,
} from '@repo/db';
import { Repository } from 'typeorm';

export class ExecutionService {
  private repository: Repository<WorkflowExecutionEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(WorkflowExecutionEntity);
  }

  /**
   * Create a new workflow execution record
   */
  async createExecution(
    workflowId: number,
    userId: string,
    triggerData: Record<string, any>
  ): Promise<string> {
    const execution = this.repository.create({
      workflowId,
      userId,
      triggerData,
      status: ExecutionStatus.RUNNING,
      nodeExecutions: [],
      startedAt: new Date(),
    });

    const saved = await this.repository.save(execution);
    return saved.id;
  }

  /**
   * Get execution by ID
   */
  async getExecution(executionId: string): Promise<WorkflowExecutionEntity | null> {
    return this.repository.findOne({
      where: { id: executionId },
    });
  }

  /**
   * Get all executions for a workflow
   */
  async getExecutionsByWorkflow(
    workflowId: number,
    limit: number = 50
  ): Promise<WorkflowExecutionEntity[]> {
    return this.repository.find({
      where: { workflowId },
      order: { startedAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Add a node execution result to the execution record
   */
  async addNodeExecution(
    executionId: string,
    nodeExecution: INodeExecution
  ): Promise<void> {
    const execution = await this.getExecution(executionId);
    
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    execution.nodeExecutions = execution.nodeExecutions || [];
    execution.nodeExecutions.push(nodeExecution);

    await this.repository.save(execution);
  }

  /**
   * Mark execution as completed (success or failure)
   */
  async completeExecution(
    executionId: string,
    status: ExecutionStatus,
    error?: string
  ): Promise<void> {
    const execution = await this.getExecution(executionId);
    
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    execution.status = status;
    execution.completedAt = new Date();
    
    if (error) {
      execution.error = error;
    }

    await this.repository.save(execution);
  }

  /**
   * Update execution status
   */
  async updateStatus(
    executionId: string,
    status: ExecutionStatus
  ): Promise<void> {
    await this.repository.update(executionId, { status });
  }
}

