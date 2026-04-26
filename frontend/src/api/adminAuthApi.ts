import publicApiClient from '../lib/publicApiClient';
import apiClient from '../lib/apiClient';
import type {
  AdminAuthResponse,
  AdminLoginResponse,
  AdminRefreshResponse,
  AdminResetCodeResponse,
  BasicAdminResponse,
} from '../types/admin/admin-auth-api.types';

const adminAuthApi = {
  signup: (email: string, password: string) =>
    publicApiClient.post<BasicAdminResponse>('/admin/auth/signup', { email, password }),

  login: (email: string, password: string) =>
    publicApiClient.post<AdminLoginResponse>('/admin/auth/login', { email, password }),

  refresh: () => publicApiClient.post<AdminRefreshResponse>('/admin/auth/refresh'),

  logout: () => publicApiClient.post<BasicAdminResponse>('/admin/auth/logout'),

  me: () => publicApiClient.get<AdminAuthResponse>('/admin/auth/me'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put<BasicAdminResponse>('/admin/auth/password', {
      currentPassword,
      newPassword,
    }),

  forgotPassword: (email: string) =>
    publicApiClient.post<AdminResetCodeResponse>('/admin/auth/forgot-password', { email }),

  verifyResetCode: (email: string, code: string) =>
    publicApiClient.post<BasicAdminResponse>('/admin/auth/verify-reset-code', { email, code }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    publicApiClient.post<BasicAdminResponse>('/admin/auth/reset-password', {
      email,
      code,
      newPassword,
    }),
};

export default adminAuthApi;
