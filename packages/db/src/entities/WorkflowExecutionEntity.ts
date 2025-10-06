import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ExecutionStatus, INodeExecution } from '@repo/types';

@Entity('workflow_executions')
export class WorkflowExecutionEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  workflowId!: number;

  @Column()
  userId!: string;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.RUNNING
  })
  status!: ExecutionStatus;

  @Column('jsonb')
  triggerData!: Record<string, any>;

  @Column('jsonb', { nullable: true })
  nodeExecutions!: INodeExecution[];

  @Column('text', { nullable: true })
  error?: string;

  @Column()
  startedAt!: Date;

  @Column({ nullable: true })
  completedAt?: Date;
}

