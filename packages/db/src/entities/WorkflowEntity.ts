import { type IConnections, type INode, WorkflowStatus } from '@repo/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';

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

  @Column('jsonb')
  nodes!: INode[];

  @Column('jsonb')
  connections!: IConnections;

  @Column({ default: 0 })
  triggerCount!: number;

  @Column({ nullable: false })
  userId!: string;
}
