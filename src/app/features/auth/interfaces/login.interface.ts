export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface ValidateResponse {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
