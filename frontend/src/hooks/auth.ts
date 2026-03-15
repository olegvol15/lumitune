import { useMutation } from '@tanstack/react-query';
import authApi from '../api/authApi';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../store/authStore';
import type { RegisterPayload, UpdateProfilePayload } from '../types/auth/auth-api.types';
import { authKeys } from './api-keys';

export function useAuthLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: ({ data }) => {
      useAuthStore.getState().setSession(data.accessToken, data.user);
    },
  });
}

export function useAuthRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ data }) => {
      useAuthStore.getState().setSession(data.accessToken, data.user);
    },
  });
}

export function useAuthLogoutMutation() {
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      useAuthStore.getState().clearSession();
      await queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useUpdateProfileMutation() {
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: async ({ data }) => {
      useAuthStore.getState().setUser(data.user);
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
  });
}
