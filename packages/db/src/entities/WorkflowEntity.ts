import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import type { INode, IConnections } from '@repo/types';
import { User } from './User';

export enum WorkflowStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

@Entity('workflows')
export class WorkflowEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
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

  @ManyToOne(() => User, (user) => user.workflows)
  user!: User;
}
