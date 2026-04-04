import { useMutation, useQuery } from '@tanstack/react-query';
import albumsApi from '../api/albumsApi';
import { queryClient } from '../lib/queryClient';
import { albumKeys } from './api-keys';

export function useAlbumsQuery() {
  return useQuery({
    queryKey: albumKeys.list(),
    queryFn: albumsApi.list,
  });
}

export function useAlbumQuery(id: string) {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => albumsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useSavedAlbumsQuery() {
  return useQuery({
    queryKey: albumKeys.saved(),
    queryFn: albumsApi.listSaved,
  });
}

export function useMyAlbumsQuery() {
  return useQuery({
    queryKey: albumKeys.mine(),
    queryFn: albumsApi.listMine,
  });
}

export function useSaveAlbumMutation() {
  return useMutation({
    mutationFn: ({ albumId, saved }: { albumId: string; saved: boolean }) =>
      saved ? albumsApi.unsave(albumId) : albumsApi.save(albumId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: albumKeys.list() }),
        queryClient.invalidateQueries({ queryKey: albumKeys.saved() }),
        queryClient.invalidateQueries({ queryKey: albumKeys.mine() }),
        queryClient.invalidateQueries({ queryKey: albumKeys.all }),
      ]);
    },
  });
}

export function useCreateAlbumMutation() {
  return useMutation({
    mutationFn: (formData: FormData) => albumsApi.create(formData),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: albumKeys.list() }),
        queryClient.invalidateQueries({ queryKey: albumKeys.mine() }),
      ]);
    },
  });
}

export function useUpdateAlbumMutation() {
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      albumsApi.update(id, formData),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: albumKeys.list() }),
        queryClient.invalidateQueries({ queryKey: albumKeys.mine() }),
        queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.id) }),
      ]);
    },
  });
}

export function useDeleteAlbumMutation() {
  return useMutation({
    mutationFn: (id: string) => albumsApi.remove(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: albumKeys.list() }),
        queryClient.invalidateQueries({ queryKey: albumKeys.mine() }),
      ]);
    },
  });
}

export function useAdminCreateAlbumMutation() {
  return useMutation({
    mutationFn: (formData: FormData) => albumsApi.createByAdmin(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: albumKeys.list() });
    },
  });
}

export function useAdminUpdateAlbumMutation() {
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      albumsApi.updateByAdmin(id, formData),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: albumKeys.list() }),
        queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.id) }),
      ]);
    },
  });
}

export function useAdminDeleteAlbumMutation() {
  return useMutation({
    mutationFn: (id: string) => albumsApi.removeByAdmin(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: albumKeys.list() });
    },
  });
}
