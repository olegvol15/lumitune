import apiClient from '../lib/apiClient';
import type { AuthResponse, MeResponse } from '../types/auth-types';

const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }),

  register: (email: string, password: string, username: string) =>
    apiClient.post<AuthResponse>('/auth/register', { email, password, username }),

  me: () =>
    apiClient.get<MeResponse>('/auth/me'),
};

export default authApi;
