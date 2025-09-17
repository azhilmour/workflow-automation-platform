import { initializeDatabase } from '@repo/db';
import { AuthController } from './controllers';

// Initialize database connection
await initializeDatabase();

const authController = new AuthController();

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      // Route handling
      if (url.pathname === '/api/auth/signup' && method === 'POST') {
        const response = await authController.signup(request);
        // Add CORS headers to response
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }

      if (url.pathname === '/api/auth/login' && method === 'POST') {
        const response = await authController.login(request);
        // Add CORS headers to response
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }

      // Health check endpoint
      if (url.pathname === '/health' && method === 'GET') {
        return new Response(
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
        );
      }

      // 404 for unmatched routes
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
    } catch (error) {
      console.error('Server error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
});

console.log(`🚀 Server running at http://localhost:${server.port}`);