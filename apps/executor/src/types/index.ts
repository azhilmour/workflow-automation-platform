export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}
