import { useMutation } from '@tanstack/react-query';
import adminAuthApi from '../api/adminAuthApi';
import { queryClient } from '../lib/queryClient';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { adminAuthKeys } from './api-keys';

export function useAdminLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      adminAuthApi.login(email, password),
    onSuccess: ({ data }) => {
      useAdminAuthStore.getState().setSession(data.accessToken, data.admin);
    },
  });
}

export function useAdminSignupMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      adminAuthApi.signup(email, password),
  });
}

export function useAdminLogoutMutation() {
  return useMutation({
    mutationFn: () => adminAuthApi.logout(),
    onSettled: async () => {
      useAdminAuthStore.getState().clearSession();
      await queryClient.invalidateQueries({ queryKey: adminAuthKeys.all });
    },
  });
}

export function useAdminUpdatePasswordMutation() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => adminAuthApi.updatePassword(currentPassword, newPassword),
  });
}

export function useAdminForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => adminAuthApi.forgotPassword(email),
  });
}

export function useAdminVerifyResetCodeMutation() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      adminAuthApi.verifyResetCode(email, code),
  });
}

export function useAdminResetPasswordMutation() {
  return useMutation({
    mutationFn: ({
      email,
      code,
      newPassword,
    }: {
      email: string;
      code: string;
      newPassword: string;
    }) => adminAuthApi.resetPassword(email, code, newPassword),
  });
}
