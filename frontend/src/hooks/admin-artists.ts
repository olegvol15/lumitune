import { useMutation, useQuery } from '@tanstack/react-query';
import adminArtistsApi from '../api/adminArtistsApi';
import { queryClient } from '../lib/queryClient';
import type {
  AdminArtist,
  AdminArtistPayload,
  AdminArtistsResponse,
} from '../types/admin/admin-artists.types';
import { adminArtistsKeys, artistKeys } from './api-keys';

function mediaPath(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

function mapAdminArtist(item: AdminArtistsResponse['artists'][number]): AdminArtist {
  return {
    id: item.artist._id,
    name: item.artist.name,
    slug: item.artist.slug,
    image: mediaPath(item.artist.image),
    bannerImage: mediaPath(item.artist.bannerImage),
    genre: item.artist.genre ?? '',
    bio: item.artist.bio ?? '',
    verified: item.artist.verified,
    artistUserId: item.artist.artistUserId,
    monthlyListeners: item.monthlyListeners,
    followers: item.followers,
    trackCount: item.trackCount,
    createdAt: item.artist.createdAt,
    updatedAt: item.artist.updatedAt,
  };
}

export function useAdminArtistsQuery() {
  return useQuery({
    queryKey: adminArtistsKeys.list(),
    queryFn: async () => {
      const { data } = await adminArtistsApi.list();
      return data.artists.map(mapAdminArtist);
    },
  });
}

export function useAdminCreateArtistMutation() {
  return useMutation({
    mutationFn: (payload: AdminArtistPayload) => adminArtistsApi.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminArtistsKeys.all }),
        queryClient.invalidateQueries({ queryKey: artistKeys.all }),
      ]);
    },
  });
}

export function useAdminUpdateArtistMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminArtistPayload }) =>
      adminArtistsApi.update(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminArtistsKeys.all }),
        queryClient.invalidateQueries({ queryKey: artistKeys.all }),
      ]);
    },
  });
}

export function useAdminDeleteArtistMutation() {
  return useMutation({
    mutationFn: adminArtistsApi.remove,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminArtistsKeys.all }),
        queryClient.invalidateQueries({ queryKey: artistKeys.all }),
      ]);
    },
  });
}
