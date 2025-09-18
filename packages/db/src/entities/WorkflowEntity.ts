import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import type { INode, IConnections } from '@repo/types';

export enum WorkflowStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

@Entity('workflows')
export class WorkflowEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128, unique: true })
  name!: string;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.INACTIVE
  })
  status!: WorkflowStatus;

  @Column('json')
  nodes!: INode[];

  @Column('json')
  connections!: IConnections;

  @Column({ default: 0 })
  triggerCount!: number;
}
