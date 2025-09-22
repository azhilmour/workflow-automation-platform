import { WorkflowService } from '../services/WorkflowService';
import { CreateWorkflowSchema, UpdateWorkflowSchema } from '@repo/types';

export class WorkflowController {
  private workflowService: WorkflowService;

  constructor() {
    this.workflowService = new WorkflowService();
  }

  private async parseJsonBody(request: Request): Promise<any> {
    try {
      return await request.json();
    } catch (error) {
      throw new Error('Invalid JSON in request body');
    }
  }

  private getUserIdFromRequest(request: Request): string {
    // TODO: Extract user ID from JWT token or session
    // For now, we'll use a placeholder - this should be implemented with proper auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or invalid');
    }
    
    // This is a placeholder - in a real implementation, you'd decode the JWT token
    // and extract the user ID from it
    return '00000000-0000-0000-0000-000000000000';
  }

  private createErrorResponse(message: string, status: number = 400): Response {
    return new Response(
      JSON.stringify({ error: message }),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  private createSuccessResponse(data: any, status: number = 200): Response {
    return new Response(
      JSON.stringify(data),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  async createWorkflow(request: Request): Promise<Response> {
    try {
      const userId = this.getUserIdFromRequest(request);
      const body = await this.parseJsonBody(request);
      
      const validatedData = CreateWorkflowSchema.parse(body);
      const workflow = await this.workflowService.createWorkflow(validatedData, userId);
      
      return this.createSuccessResponse(workflow, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid JSON')) {
          return this.createErrorResponse('Invalid JSON in request body', 400);
        }
        if (error.message.includes('Authorization')) {
          return this.createErrorResponse('Unauthorized', 401);
        }
        if (error.name === 'ZodError') {
          return this.createErrorResponse('Validation error: ' + error.message, 400);
        }
      }
      console.error('Error creating workflow:', error);
      return this.createErrorResponse('Internal server error', 500);
    }
  }

  async getAllWorkflows(request: Request): Promise<Response> {
    try {
      const userId = this.getUserIdFromRequest(request);
      const workflows = await this.workflowService.getAllWorkflows(userId);
      
      return this.createSuccessResponse({ workflows });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authorization')) {
        return this.createErrorResponse('Unauthorized', 401);
      }
      console.error('Error fetching workflows:', error);
      return this.createErrorResponse('Internal server error', 500);
    }
  }

  async getWorkflowById(request: Request, id: string): Promise<Response> {
    try {
      const userId = this.getUserIdFromRequest(request);
      const workflowId = parseInt(id, 10);
      
      if (isNaN(workflowId)) {
        return this.createErrorResponse('Invalid workflow ID', 400);
      }

      const workflow = await this.workflowService.getWorkflowById(workflowId, userId);
      
      if (!workflow) {
        return this.createErrorResponse('Workflow not found', 404);
      }

      return this.createSuccessResponse(workflow);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authorization')) {
        return this.createErrorResponse('Unauthorized', 401);
      }
      console.error('Error fetching workflow:', error);
      return this.createErrorResponse('Internal server error', 500);
    }
  }

  async updateWorkflow(request: Request, id: string): Promise<Response> {
    try {
      const userId = this.getUserIdFromRequest(request);
      const workflowId = parseInt(id, 10);
      
      if (isNaN(workflowId)) {
        return this.createErrorResponse('Invalid workflow ID', 400);
      }

      const body = await this.parseJsonBody(request);
      const validatedData = UpdateWorkflowSchema.parse(body);
      
      const workflow = await this.workflowService.updateWorkflow(workflowId, userId, validatedData);
      
      if (!workflow) {
        return this.createErrorResponse('Workflow not found', 404);
      }

      return this.createSuccessResponse(workflow);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid JSON')) {
          return this.createErrorResponse('Invalid JSON in request body', 400);
        }
        if (error.message.includes('Authorization')) {
          return this.createErrorResponse('Unauthorized', 401);
        }
        if (error.name === 'ZodError') {
          return this.createErrorResponse('Validation error: ' + error.message, 400);
        }
      }
      console.error('Error updating workflow:', error);
      return this.createErrorResponse('Internal server error', 500);
    }
  }

  async deleteWorkflow(request: Request, id: string): Promise<Response> {
    try {
      const userId = this.getUserIdFromRequest(request);
      const workflowId = parseInt(id, 10);
      
      if (isNaN(workflowId)) {
        return this.createErrorResponse('Invalid workflow ID', 400);
      }

      const deleted = await this.workflowService.deleteWorkflow(workflowId, userId);
      
      if (!deleted) {
        return this.createErrorResponse('Workflow not found', 404);
      }

      return this.createSuccessResponse({ message: 'Workflow deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Authorization')) {
        return this.createErrorResponse('Unauthorized', 401);
      }
      console.error('Error deleting workflow:', error);
      return this.createErrorResponse('Internal server error', 500);
    }
  }
}
