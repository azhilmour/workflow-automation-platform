import { Repository } from 'typeorm';
import { CredentialsEntity } from '@repo/db';
import { CredentialsService } from '../services';
import { 
  CreateCredentialsSchema,
  UpdateCredentialsSchema,
  CreateCredentialsInput,
  UpdateCredentialsInput,
  CredentialsResponse,
  CredentialsListResponse,
  ApiResponse 
} from '@repo/types';

export class CredentialsController {
  private credentialsService: CredentialsService;

  constructor(credentialsRepository: Repository<CredentialsEntity>) {
    this.credentialsService = new CredentialsService(credentialsRepository);
  }

  async create(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      
      // Validate request body using Zod schema
      const validationResult = CreateCredentialsSchema.safeParse(body);
      
      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues
          .map((err: any) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const validatedData: CreateCredentialsInput = validationResult.data;
      const result = await this.credentialsService.create(validatedData);
      
      const response: ApiResponse<CredentialsResponse> = {
        message: 'Credentials created successfully',
        data: result
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Create credentials error:', error);
      
      const response: ApiResponse = {
        error: error instanceof Error ? error.message : 'Internal server error'
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  async getById(request: Request, id: string, userId: string): Promise<Response> {
    try {
      const credentialsId = parseInt(id);
      
      if (isNaN(credentialsId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials ID' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const result = await this.credentialsService.findById(credentialsId, userId);
      
      if (!result) {
        return new Response(
          JSON.stringify({ error: 'Credentials not found' }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      const response: ApiResponse<CredentialsResponse> = {
        message: 'Credentials retrieved successfully',
        data: result
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Get credentials error:', error);
      
      const response: ApiResponse = {
        error: error instanceof Error ? error.message : 'Internal server error'
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  async getByUserId(request: Request, userId: string): Promise<Response> {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      if (page < 1 || limit < 1 || limit > 100) {
        return new Response(
          JSON.stringify({ error: 'Invalid pagination parameters' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const result = await this.credentialsService.findByUserId(userId, page, limit);
      
      const response: ApiResponse<CredentialsListResponse> = {
        message: 'Credentials retrieved successfully',
        data: result
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Get credentials by user error:', error);
      
      const response: ApiResponse = {
        error: error instanceof Error ? error.message : 'Internal server error'
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  async getByFor(request: Request, forValue: string, userId: string): Promise<Response> {
    try {
      const result = await this.credentialsService.findByFor(forValue, userId);
      
      const response: ApiResponse<CredentialsResponse[]> = {
        message: 'Credentials retrieved successfully',
        data: result
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Get credentials by for error:', error);
      
      const response: ApiResponse = {
        error: error instanceof Error ? error.message : 'Internal server error'
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  async update(request: Request, id: string, userId: string): Promise<Response> {
    try {
      const credentialsId = parseInt(id);
      
      if (isNaN(credentialsId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials ID' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const body = await request.json();
      
      // Validate request body using Zod schema
      const validationResult = UpdateCredentialsSchema.safeParse(body);
      
      if (!validationResult.success) {
        const errorMessage = validationResult.error.issues
          .map((err: any) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const validatedData: UpdateCredentialsInput = validationResult.data;
      const result = await this.credentialsService.update(credentialsId, userId, validatedData);
      
      if (!result) {
        return new Response(
          JSON.stringify({ error: 'Credentials not found' }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      const response: ApiResponse<CredentialsResponse> = {
        message: 'Credentials updated successfully',
        data: result
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Update credentials error:', error);
      
      const response: ApiResponse = {
        error: error instanceof Error ? error.message : 'Internal server error'
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  async delete(request: Request, id: string, userId: string): Promise<Response> {
    try {
      const credentialsId = parseInt(id);
      
      if (isNaN(credentialsId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials ID' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const deleted = await this.credentialsService.delete(credentialsId, userId);
      
      if (!deleted) {
        return new Response(
          JSON.stringify({ error: 'Credentials not found' }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      const response: ApiResponse = {
        message: 'Credentials deleted successfully'
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Delete credentials error:', error);
      
      const response: ApiResponse = {
        error: error instanceof Error ? error.message : 'Internal server error'
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
}
