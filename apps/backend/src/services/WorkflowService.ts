import { WorkflowRepository } from '../repositories/WorkflowRepository';
import type { CreateWorkflowInput, UpdateWorkflowInput, WorkflowResponse } from '@repo/types';
import { WorkflowEntity } from '@repo/db';

export class WorkflowService {
  private workflowRepository: WorkflowRepository;

  constructor() {
    this.workflowRepository = new WorkflowRepository();
  }

  private mapEntityToResponse(workflow: WorkflowEntity): WorkflowResponse {
    return {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
      nodes: workflow.nodes,
      connections: workflow.connections,
      triggerCount: workflow.triggerCount,
      userId: workflow.userId,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };
  }

  async createWorkflow(workflowData: CreateWorkflowInput, userId: string): Promise<WorkflowResponse> {
    const workflow = await this.workflowRepository.create(workflowData, userId);
    return this.mapEntityToResponse(workflow);
  }

  async getWorkflowById(id: number, userId: string): Promise<WorkflowResponse | null> {
    const workflow = await this.workflowRepository.findById(id, userId);
    if (!workflow) {
      return null;
    }
    return this.mapEntityToResponse(workflow);
  }

  async getAllWorkflows(userId: string): Promise<WorkflowResponse[]> {
    const workflows = await this.workflowRepository.findAllByUserId(userId);
    return workflows.map(workflow => this.mapEntityToResponse(workflow));
  }

  async updateWorkflow(id: number, userId: string, updateData: UpdateWorkflowInput): Promise<WorkflowResponse | null> {
    const workflow = await this.workflowRepository.update(id, userId, updateData);
    if (!workflow) {
      return null;
    }
    return this.mapEntityToResponse(workflow);
  }

  async deleteWorkflow(id: number, userId: string): Promise<boolean> {
    return await this.workflowRepository.delete(id, userId);
  }

  async incrementTriggerCount(id: number, userId: string): Promise<WorkflowResponse | null> {
    const workflow = await this.workflowRepository.incrementTriggerCount(id, userId);
    if (!workflow) {
      return null;
    }
    return this.mapEntityToResponse(workflow);
  }
}
