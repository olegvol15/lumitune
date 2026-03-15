import publicApiClient from '../lib/publicApiClient';
import type { AuthResponse, MeResponse } from '../types/auth/auth-types';

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  displayName: string;
  dateOfBirth: {
    day: number;
    month: number;
    year: number;
  };
  country: string;
  city: string;
  role: 'user' | 'creator';
}

const authApi = {
  login: (email: string, password: string) =>
    publicApiClient.post<AuthResponse>('/auth/login', { email, password }),

  register: (payload: RegisterPayload) =>
    publicApiClient.post<AuthResponse>('/auth/register', payload),

  refresh: () =>
    publicApiClient.post<AuthResponse>('/auth/refresh'),

  logout: () =>
    publicApiClient.post('/auth/logout'),

  me: () =>
    publicApiClient.get<MeResponse>('/auth/me'),
};

export default authApi;
