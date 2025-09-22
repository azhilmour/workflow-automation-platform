import { initializeDatabase } from '@repo/db';
import { AuthController, WorkflowController } from './controllers';

// Initialize database connection
await initializeDatabase();

const authController = new AuthController();
const workflowController = new WorkflowController();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// CORS middleware function
function addCorsHeaders(response: Response): Response {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Route handlers
const routes = {
  // Auth routes with per-HTTP method handlers
  '/api/auth/signup': {
    POST: async (request: Request) => {
      const response = await authController.signup(request);
      return addCorsHeaders(response);
    },
  },

  '/api/auth/login': {
    POST: async (request: Request) => {
      const response = await authController.login(request);
      return addCorsHeaders(response);
    },
  },

  // Workflow routes with per-HTTP method handlers
  '/api/workflow': {
    POST: async (request: Request) => {
      const response = await workflowController.createWorkflow(request);
      return addCorsHeaders(response);
    },
    GET: async (request: Request) => {
      const response = await workflowController.getAllWorkflows(request);
      return addCorsHeaders(response);
    },
  },

  // Dynamic workflow by ID routes with per-HTTP method handlers
  '/api/workflow/:id': {
    GET: async (request: Request) => {
      const url = new URL(request.url);
      const workflowId = url.pathname.split('/').pop()!;
      
      try {
        const response = await workflowController.getWorkflowById(request, workflowId);
        return addCorsHeaders(response);
      } catch (error) {
        console.error('Get workflow error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
          }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    },
    PUT: async (request: Request) => {
      const url = new URL(request.url);
      const workflowId = url.pathname.split('/').pop()!;
      
      try {
        const response = await workflowController.updateWorkflow(request, workflowId);
        return addCorsHeaders(response);
      } catch (error) {
        console.error('Update workflow error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
          }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    },
    DELETE: async (request: Request) => {
      const url = new URL(request.url);
      const workflowId = url.pathname.split('/').pop()!;
      
      try {
        const response = await workflowController.deleteWorkflow(request, workflowId);
        return addCorsHeaders(response);
      } catch (error) {
        console.error('Delete workflow error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
          }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    },
  },

  // Health check
  '/health': new Response(
    JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'executor'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  ),
};

const server = Bun.serve({
  port: process.env.PORT || 3000,
  routes,
  // Fallback for unmatched routes and global OPTIONS handling
  async fetch(request) {
    // Handle CORS preflight requests globally
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);