import { AuthService } from '../services';
import { 
  SignupRequestSchema, 
  LoginRequestSchema, 
  SignupRequest, 
  LoginRequest, 
  ApiResponse 
} from '@repo/types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async signup(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      
      // Validate request body using Zod schema
      const validationResult = SignupRequestSchema.safeParse(body);
      
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

      const validatedData: SignupRequest = validationResult.data;
      const result = await this.authService.signup(validatedData);
      
      const response: ApiResponse = {
        message: 'User created successfully',
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
      console.error('Signup error:', error);
      
      const response: ApiResponse = {
        error: error instanceof Error ? error.message : 'Internal server error'
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: error instanceof Error && error.message.includes('already exists') ? 409 : 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  async login(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      
      // Validate request body using Zod schema
      const validationResult = LoginRequestSchema.safeParse(body);
      
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

      const validatedData: LoginRequest = validationResult.data;
      const result = await this.authService.login(validatedData);
      
      const response: ApiResponse = {
        message: 'Login successful',
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
      console.error('Login error:', error);
      
      const response: ApiResponse = {
        error: error instanceof Error ? error.message : 'Internal server error'
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          status: error instanceof Error && error.message.includes('Invalid') ? 401 : 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
}
