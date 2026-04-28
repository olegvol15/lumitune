import publicApiClient from '../lib/publicApiClient';
import apiClient from '../lib/apiClient';
import type { RegisterPayload, UpdateProfilePayload } from '../types/auth/auth-api.types';
import type { AuthResponse, MeResponse } from '../types/auth/auth-types';

const authApi = {
  login: (email: string, password: string) =>
    publicApiClient.post<AuthResponse>('/auth/login', { email, password }),

  register: (payload: RegisterPayload) =>
    publicApiClient.post<AuthResponse>('/auth/register', payload),

  refresh: () => publicApiClient.post<AuthResponse>('/auth/refresh'),

  logout: () => publicApiClient.post('/auth/logout'),

  me: () => apiClient.get<MeResponse>('/auth/me'),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.patch<MeResponse>('/auth/me', payload),

  startGoogleOAuth: () => {
    window.location.assign('/api/auth/oauth/google');
  },
};

export default authApi;
