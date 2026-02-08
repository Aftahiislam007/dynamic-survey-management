export interface User {
  id: number;
  email: string;
  name: string;
  userType: UserType;
  createdAt: string;
  updatedAt: string;
}

export enum UserType {
  ADMIN = 'ADMIN',
  OFFICER = 'OFFICER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  userType: UserType;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}