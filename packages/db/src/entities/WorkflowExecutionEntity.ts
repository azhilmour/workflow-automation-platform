import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export enum ExecutionStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export interface INodeExecution {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  input: any;
  output: any;
  error?: string;
  startedAt: Date;
  completedAt: Date;
  executionTime: number; // in milliseconds
}

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

