import { Repository } from 'typeorm';
import { CredentialsEntity } from '@repo/db';
import { 
  CreateCredentialsInput, 
  UpdateCredentialsInput, 
  CredentialsResponse,
  CredentialsListResponse 
} from '@repo/types';

export class CredentialsService {
  private credentialsRepository: Repository<CredentialsEntity>;

  constructor(credentialsRepository: Repository<CredentialsEntity>) {
    this.credentialsRepository = credentialsRepository;
  }

  async create(data: CreateCredentialsInput): Promise<CredentialsResponse> {
    const credentials = this.credentialsRepository.create(data);
    const savedCredentials = await this.credentialsRepository.save(credentials);
    
    return {
      id: savedCredentials.id,
      for: savedCredentials.for,
      data: savedCredentials.data,
      userId: savedCredentials.userId,
      createdAt: savedCredentials.createdAt,
      updatedAt: savedCredentials.updatedAt,
    };
  }

  async findById(id: number, userId: string): Promise<CredentialsResponse | null> {
    const credentials = await this.credentialsRepository.findOne({
      where: { id, userId }
    });

    if (!credentials) {
      return null;
    }

    return {
      id: credentials.id,
      for: credentials.for,
      data: credentials.data,
      userId: credentials.userId,
      createdAt: credentials.createdAt,
      updatedAt: credentials.updatedAt,
    };
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<CredentialsListResponse> {
    const [credentials, total] = await this.credentialsRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return {
      credentials: credentials.map(cred => ({
        id: cred.id,
        for: cred.for,
        data: cred.data,
        userId: cred.userId,
        createdAt: cred.createdAt,
        updatedAt: cred.updatedAt,
      })),
      total,
      page,
      limit,
    };
  }

  async update(id: number, userId: string, data: UpdateCredentialsInput): Promise<CredentialsResponse | null> {
    const credentials = await this.credentialsRepository.findOne({
      where: { id, userId }
    });

    if (!credentials) {
      return null;
    }

    Object.assign(credentials, data);
    const updatedCredentials = await this.credentialsRepository.save(credentials);

    return {
      id: updatedCredentials.id,
      for: updatedCredentials.for,
      data: updatedCredentials.data,
      userId: updatedCredentials.userId,
      createdAt: updatedCredentials.createdAt,
      updatedAt: updatedCredentials.updatedAt,
    };
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const result = await this.credentialsRepository.delete({ id, userId });
    return result.affected !== 0;
  }

  async findByFor(forValue: string, userId: string): Promise<CredentialsResponse[]> {
    const credentials = await this.credentialsRepository.find({
      where: { for: forValue, userId },
      order: { createdAt: 'DESC' }
    });

    return credentials.map(cred => ({
      id: cred.id,
      for: cred.for,
      data: cred.data,
      userId: cred.userId,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
    }));
  }
}
