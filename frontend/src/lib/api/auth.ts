import { apiClient } from './client';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/auth';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    if (response.data.data) {
      apiClient.setToken(response.data.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data.data;
  },

  async officerLogin(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/officer-login', data);
    if (response.data.data) {
      apiClient.setToken(response.data.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data.data;
  },

  async adminRegister(data: RegisterRequest): Promise<User> {
    const response = await apiClient.post('/auth/admin-registration', data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.clearToken();
      localStorage.removeItem('user');
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(data: { strEmail: string; newPassword: string; otpToVerify: number }): Promise<void> {
    await apiClient.post('/auth/reset-password', data);
  },

  async refreshToken(): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/refresh');
    if (response.data.data) {
      apiClient.setToken(response.data.data.access_token);
    }
    return response.data.data;
  },
};