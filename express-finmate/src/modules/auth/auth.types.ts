import { type Request } from 'express';

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthenticatedRequest extends Request {
  userId: string;
}
