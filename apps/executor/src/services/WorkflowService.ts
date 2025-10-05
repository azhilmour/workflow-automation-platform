import { AppDataSource } from '@repo/db';
import { WorkflowEntity, WebhookEntity } from '@repo/db';
import { Repository } from 'typeorm';

export class WorkflowService {
  private workflowRepository: Repository<WorkflowEntity>;
  private webhookRepository: Repository<WebhookEntity>;

  constructor() {
    this.workflowRepository = AppDataSource.getRepository(WorkflowEntity);
    this.webhookRepository = AppDataSource.getRepository(WebhookEntity);
  }

  /**
   * Get workflow by ID
   */
  async getWorkflowById(workflowId: number): Promise<WorkflowEntity | null> {
    return this.workflowRepository.findOne({
      where: { id: workflowId },
    });
  }

  /**
   * Get webhook by ID and method
   */
  async getWebhookById(
    webhookId: string,
    method: string
  ): Promise<WebhookEntity | null> {
    return this.webhookRepository.findOne({
      where: {
        id: webhookId,
        method: method as 'GET' | 'POST' | 'PUT' | 'DELETE',
      },
    });
  }

  /**
   * Increment trigger count for a workflow
   */
  async incrementTriggerCount(workflowId: number): Promise<void> {
    await this.workflowRepository.increment(
      { id: workflowId },
      'triggerCount',
      1
    );
  }

  /**
   * Check if workflow is active
   */
  async isWorkflowActive(workflowId: number): Promise<boolean> {
    const workflow = await this.getWorkflowById(workflowId);
    return workflow?.status === 'ACTIVE';
  }
}

