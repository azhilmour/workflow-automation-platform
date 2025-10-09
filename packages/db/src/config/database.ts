import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { WorkflowEntity } from '../entities/WorkflowEntity';
import { CredentialsEntity } from '../entities/CredentialsEntity';
import { WebhookEntity } from '../entities/WebhookEntity';
import { WorkflowExecutionEntity } from '../entities/WorkflowExecutionEntity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.LOG_LEVEL === 'trace',
  entities: [User, WorkflowEntity, CredentialsEntity, WebhookEntity, WorkflowExecutionEntity],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<DataSource> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};

export const closeDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};
