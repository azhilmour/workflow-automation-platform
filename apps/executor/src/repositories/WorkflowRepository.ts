import { Repository } from 'typeorm';
import { WorkflowEntity, AppDataSource, User, WorkflowStatus } from '@repo/db';
import type { CreateWorkflowInput, UpdateWorkflowInput } from '@repo/types';

export class WorkflowRepository {
  private repository: Repository<WorkflowEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(WorkflowEntity);
  }

  async create(workflowData: CreateWorkflowInput, userId: string): Promise<WorkflowEntity> {
    const workflow = new WorkflowEntity();
    workflow.name = workflowData.name;
    workflow.status = workflowData.status as WorkflowStatus;
    workflow.nodes = workflowData.nodes as any;
    workflow.connections = workflowData.connections as any;
    workflow.user = { id: userId } as User;
    return await this.repository.save(workflow);
  }

  async findById(id: number, userId: string): Promise<WorkflowEntity | null> {
    return await this.repository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
  }

  async findAllByUserId(userId: string): Promise<WorkflowEntity[]> {
    return await this.repository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, userId: string, updateData: UpdateWorkflowInput): Promise<WorkflowEntity | null> {
    const workflow = await this.findById(id, userId);
    if (!workflow) {
      return null;
    }

    Object.assign(workflow, updateData);
    return await this.repository.save(workflow);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const result = await this.repository.delete({
      id,
      user: { id: userId },
    });
    return (result.affected ?? 0) > 0;
  }

  async incrementTriggerCount(id: number, userId: string): Promise<WorkflowEntity | null> {
    const workflow = await this.findById(id, userId);
    if (!workflow) {
      return null;
    }

    workflow.triggerCount += 1;
    return await this.repository.save(workflow);
  }
}
