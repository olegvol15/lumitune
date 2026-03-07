import apiClient from '../lib/apiClient';

export interface AdminAuthUser {
  id: string;
  email: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  admin: AdminAuthUser;
}

export interface AdminAuthResponse {
  success: boolean;
  admin: AdminAuthUser;
}

export interface AdminResetCodeResponse {
  success: boolean;
  message: string;
  code?: string;
}

export interface BasicAdminResponse {
  success: boolean;
  message: string;
}

const adminAuthApi = {
  signup: (email: string, password: string) =>
    apiClient.post<AdminAuthResponse>('/admin/auth/signup', { email, password }),

  login: (email: string, password: string) =>
    apiClient.post<AdminLoginResponse>('/admin/auth/login', { email, password }),

  me: (token: string) =>
    apiClient.get<AdminAuthResponse>('/admin/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  forgotPassword: (email: string) =>
    apiClient.post<AdminResetCodeResponse>('/admin/auth/forgot-password', { email }),

  verifyResetCode: (email: string, code: string) =>
    apiClient.post<BasicAdminResponse>('/admin/auth/verify-reset-code', { email, code }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    apiClient.post<BasicAdminResponse>('/admin/auth/reset-password', {
      email,
      code,
      newPassword,
    }),
};

export default adminAuthApi;
