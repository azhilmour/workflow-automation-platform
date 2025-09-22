import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity('credentials')
export class CredentialsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  for!: string;

  @Column({ type: 'text' })
  data!: string;

  @Column()
  userId!: string;
}