import { useMutation, useQuery } from '@tanstack/react-query';
import audiobooksApi from '../api/audiobooksApi';
import { queryClient } from '../lib/queryClient';
import { audiobookKeys } from './api-keys';

export function useAudiobooksQuery() {
  return useQuery({
    queryKey: audiobookKeys.list(),
    queryFn: audiobooksApi.list,
  });
}

export function useAudiobookQuery(id: string) {
  return useQuery({
    queryKey: audiobookKeys.detail(id),
    queryFn: () => audiobooksApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useSavedAudiobooksQuery() {
  return useQuery({
    queryKey: audiobookKeys.saved(),
    queryFn: audiobooksApi.listSaved,
  });
}

export function useSaveAudiobookMutation() {
  return useMutation({
    mutationFn: async ({ audiobookId, saved }: { audiobookId: string; saved: boolean }) =>
      saved ? audiobooksApi.unsave(audiobookId) : audiobooksApi.save(audiobookId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: audiobookKeys.list() }),
        queryClient.invalidateQueries({ queryKey: audiobookKeys.saved() }),
      ]);
    },
  });
}

export function useUpdateAudiobookProgressMutation(audiobookId: string) {
  return useMutation({
    mutationFn: (payload: { chapterId: string; progressSeconds: number; progressPct: number }) =>
      audiobooksApi.updateProgress(audiobookId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: audiobookKeys.detail(audiobookId) }),
        queryClient.invalidateQueries({ queryKey: audiobookKeys.list() }),
      ]);
    },
  });
}

export function useCreateAudiobookMutation() {
  return useMutation({
    mutationFn: (formData: FormData) => audiobooksApi.create(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: audiobookKeys.list() });
    },
  });
}

export function useUpdateAudiobookMutation() {
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      audiobooksApi.update(id, formData),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: audiobookKeys.list() }),
        queryClient.invalidateQueries({ queryKey: audiobookKeys.detail(variables.id) }),
      ]);
    },
  });
}

export function useDeleteAudiobookMutation() {
  return useMutation({
    mutationFn: (id: string) => audiobooksApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: audiobookKeys.list() });
    },
  });
}

export function useUploadAudiobookChapterMutation(audiobookId: string) {
  return useMutation({
    mutationFn: (formData: FormData) => audiobooksApi.uploadChapter(audiobookId, formData),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: audiobookKeys.list() }),
        queryClient.invalidateQueries({ queryKey: audiobookKeys.detail(audiobookId) }),
      ]);
    },
  });
}

export function useUpdateAudiobookChapterMutation(audiobookId: string) {
  return useMutation({
    mutationFn: ({ chapterId, formData }: { chapterId: string; formData: FormData }) =>
      audiobooksApi.updateChapter(chapterId, formData),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: audiobookKeys.list() }),
        queryClient.invalidateQueries({ queryKey: audiobookKeys.detail(audiobookId) }),
      ]);
    },
  });
}

export function useDeleteAudiobookChapterMutation(audiobookId: string) {
  return useMutation({
    mutationFn: (chapterId: string) => audiobooksApi.removeChapter(chapterId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: audiobookKeys.list() }),
        queryClient.invalidateQueries({ queryKey: audiobookKeys.detail(audiobookId) }),
      ]);
    },
  });
}
