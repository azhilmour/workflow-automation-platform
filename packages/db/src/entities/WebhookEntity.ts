import { Column, Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { WorkflowEntity } from './WorkflowEntity';

@Entity('webhooks')
export class WebhookEntity extends BaseEntity {
	@PrimaryColumn()
	id!: string;

	@PrimaryColumn()
	method!: 'GET' | 'POST' | 'PUT' | 'DELETE';

  @Column('jsonb')
  headersToMatch!: Record<string, string>;

	@ManyToOne(() => WorkflowEntity, { eager: true })
	workflow!: WorkflowEntity;

	@Column()
	nodeId!: string;
}