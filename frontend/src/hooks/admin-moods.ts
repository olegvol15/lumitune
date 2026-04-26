import { useMutation, useQuery } from '@tanstack/react-query';
import adminMoodsApi from '../api/adminMoodsApi';
import { queryClient } from '../lib/queryClient';
import type { AdminMood, BackendMoodWithUsage } from '../types/admin/admin-moods.types';
import { adminMoodsKeys, tracksKeys } from './api-keys';

function mapAdminMood(item: BackendMoodWithUsage): AdminMood {
  return {
    id: item.mood._id,
    name: item.mood.name,
    slug: item.mood.slug,
    createdAt: item.mood.createdAt,
    updatedAt: item.mood.updatedAt,
    usage: item.usage,
  };
}

export function useAdminMoodsQuery() {
  return useQuery({
    queryKey: adminMoodsKeys.list(),
    queryFn: async () => {
      const { data } = await adminMoodsApi.list();
      return data.moods.map(mapAdminMood);
    },
  });
}

export function useAdminCreateMoodMutation() {
  return useMutation({
    mutationFn: adminMoodsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminMoodsKeys.all });
    },
  });
}

export function useAdminUpdateMoodMutation() {
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => adminMoodsApi.update(id, { name }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminMoodsKeys.all }),
        queryClient.invalidateQueries({ queryKey: tracksKeys.adminList() }),
      ]);
    },
  });
}

export function useAdminDeleteMoodMutation() {
  return useMutation({
    mutationFn: adminMoodsApi.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminMoodsKeys.all });
    },
  });
}
