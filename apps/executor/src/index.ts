import type { BunRequest } from "bun";
import { initializeDatabase } from '@repo/db';
import { ExecutionEngine } from './engine/ExecutionEngine';

await initializeDatabase();

const executionEngine = new ExecutionEngine();

const routes = {
  '/webhook/handler/:id': async (req: BunRequest<'/webhook/handler/:id'>) => {
    try {
      const webhookId = req.params.id;
      const method = req.method;
      
      // Parse request body for trigger data
      let triggerData: Record<string, any> = {};
      try {
        const body = await req.text();
        triggerData = body ? JSON.parse(body) : {};
      } catch (error) {
        triggerData = {};
      }
      
      // Start workflow execution asynchronously
      const executionId = await executionEngine.executeWorkflow(
        webhookId,
        method,
        triggerData
      );

      return new Response(
        JSON.stringify({
          success: true,
          executionId,
          message: 'Workflow execution started',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Webhook handler error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },

  // Get execution details
  '/executions/:id': async (req: BunRequest<'/executions/:id'>) => {
    try {
      const executionId = req.params.id;
      const executionService = executionEngine.executionService;
      
      const execution = await executionService.getExecution(executionId);
      
      if (!execution) {
        return new Response(
          JSON.stringify({ error: 'Execution not found' }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify(execution), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Get execution error:', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },

  // List executions for a workflow
  '/executions/workflow/:id': async (req: BunRequest<'/executions/workflow/:id'>) => {
    try {
      const workflowId = parseInt(req.params.id);
      const executionService = executionEngine.executionService;
      
      const executions = await executionService.getExecutionsByWorkflow(workflowId);

      return new Response(JSON.stringify(executions), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('List executions error:', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },

  // Health check
  '/health': new Response(
    JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'workflow-automation-executor'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  ),
};

const server = Bun.serve({
  port: process.env.PORT || 3000,
  routes,
  // Fallback for unmatched routes
  async fetch(req) {
    return new Response('404 Not Found', { status: 404 });
  },
});

console.log(`🚀 Executor service running at http://localhost:${server.port}`);