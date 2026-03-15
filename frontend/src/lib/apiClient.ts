import axios from 'axios';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useAuthStore } from '../store/authStore';

const isAdminRequest = (url?: string): boolean => Boolean(url?.startsWith('/admin/'));

const isRefreshRequest = (url?: string): boolean =>
  url === '/auth/refresh' || url === '/admin/auth/refresh';

const isAuthMutationRequest = (url?: string): boolean =>
  url === '/auth/login' ||
  url === '/auth/register' ||
  url === '/auth/logout' ||
  url === '/admin/auth/login' ||
  url === '/admin/auth/signup' ||
  url === '/admin/auth/logout';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = isAdminRequest(config.url)
    ? useAdminAuthStore.getState().accessToken
    : useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const url = originalRequest?.url;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest(url) &&
      !isAuthMutationRequest(url)
    ) {
      originalRequest._retry = true;

      const nextToken = isAdminRequest(url)
        ? await useAdminAuthStore.getState().refreshSession()
        : await useAuthStore.getState().refreshSession();

      if (nextToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
