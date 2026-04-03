import { useMutation, useQuery } from '@tanstack/react-query';
import podcastsApi from '../api/podcastsApi';
import { queryClient } from '../lib/queryClient';
import { podcastKeys } from './api-keys';

export function usePodcastsQuery() {
  return useQuery({
    queryKey: podcastKeys.list(),
    queryFn: podcastsApi.list,
  });
}

export function usePodcastQuery(id: string) {
  return useQuery({
    queryKey: podcastKeys.detail(id),
    queryFn: () => podcastsApi.getById(id),
    enabled: !!id,
  });
}

export function useEpisodeQuery(episodeId: string) {
  return useQuery({
    queryKey: podcastKeys.episode(episodeId),
    queryFn: () => podcastsApi.getEpisodeById(episodeId),
    enabled: !!episodeId,
  });
}

export function useCreatePodcastMutation() {
  return useMutation({
    mutationFn: (formData: FormData) => podcastsApi.create(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: podcastKeys.list() });
    },
  });
}

export function useUpdatePodcastMutation() {
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      podcastsApi.update(id, formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: podcastKeys.list() });
    },
  });
}

export function useDeletePodcastMutation() {
  return useMutation({
    mutationFn: (id: string) => podcastsApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: podcastKeys.list() });
    },
  });
}

export function useUploadEpisodeMutation(podcastId: string) {
  return useMutation({
    mutationFn: (formData: FormData) => podcastsApi.uploadEpisode(podcastId, formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: podcastKeys.detail(podcastId) });
    },
  });
}

export function useUpdateEpisodeMutation(podcastId: string) {
  return useMutation({
    mutationFn: ({ episodeId, formData }: { episodeId: string; formData: FormData }) =>
      podcastsApi.updateEpisode(episodeId, formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: podcastKeys.detail(podcastId) });
    },
  });
}

export function useDeleteEpisodeMutation(podcastId: string) {
  return useMutation({
    mutationFn: (episodeId: string) => podcastsApi.removeEpisode(episodeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: podcastKeys.detail(podcastId) });
    },
  });
}
