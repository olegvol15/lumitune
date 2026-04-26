import { useMutation, useQuery } from '@tanstack/react-query';
import adminGenresApi from '../api/adminGenresApi';
import { queryClient } from '../lib/queryClient';
import type { AdminGenre, BackendGenreWithUsage } from '../types/admin/admin-genres.types';
import { albumKeys, audiobookKeys, tracksKeys, adminGenresKeys } from './api-keys';

function mapAdminGenre(item: BackendGenreWithUsage): AdminGenre {
  return {
    id: item.genre._id,
    name: item.genre.name,
    slug: item.genre.slug,
    createdAt: item.genre.createdAt,
    updatedAt: item.genre.updatedAt,
    usage: item.usage,
  };
}

export function useAdminGenresQuery() {
  return useQuery({
    queryKey: adminGenresKeys.list(),
    queryFn: async () => {
      const { data } = await adminGenresApi.list();
      return data.genres.map(mapAdminGenre);
    },
  });
}

export function useAdminCreateGenreMutation() {
  return useMutation({
    mutationFn: adminGenresApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminGenresKeys.all });
    },
  });
}

export function useAdminUpdateGenreMutation() {
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => adminGenresApi.update(id, { name }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminGenresKeys.all }),
        queryClient.invalidateQueries({ queryKey: tracksKeys.adminList() }),
        queryClient.invalidateQueries({ queryKey: albumKeys.list() }),
        queryClient.invalidateQueries({ queryKey: audiobookKeys.list() }),
      ]);
    },
  });
}

export function useAdminDeleteGenreMutation() {
  return useMutation({
    mutationFn: adminGenresApi.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminGenresKeys.all });
    },
  });
}
