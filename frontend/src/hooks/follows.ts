import { useMutation, useQuery } from '@tanstack/react-query';
import followsApi from '../api/followsApi';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../store/authStore';
import { followKeys } from './api-keys';

export function useUserProfileQuery(userId?: string) {
  return useQuery({
    queryKey: followKeys.userProfile(userId ?? ''),
    queryFn: () => followsApi.getUserProfile(userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useFollowingQuery(userId?: string) {
  return useQuery({
    queryKey: followKeys.following(userId ?? ''),
    queryFn: () => followsApi.listFollowing(userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useFollowingIdsQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: followKeys.followingIds(),
    queryFn: followsApi.listFollowingIds,
    enabled: isAuthenticated,
  });
}

export function useArtistFollowStatusQuery(artistId?: string) {
  return useQuery({
    queryKey: followKeys.artistStatus(artistId ?? ''),
    queryFn: () => followsApi.getArtistStatus(artistId ?? ''),
    enabled: Boolean(artistId),
  });
}

export function useFollowedArtistsQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: followKeys.followedArtists(),
    queryFn: followsApi.listFollowedArtists,
    enabled: isAuthenticated,
  });
}

export function useFollowMutation() {
  return useMutation({
    mutationFn: ({ userId, following }: { userId: string; following: boolean }) =>
      following ? followsApi.unfollow(userId) : followsApi.follow(userId),
    onSuccess: async (_, { userId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followKeys.all }),
        queryClient.invalidateQueries({ queryKey: followKeys.userProfile(userId) }),
      ]);
    },
  });
}

export function useArtistFollowMutation() {
  return useMutation({
    mutationFn: ({
      artistId,
      artistName,
      image,
      genre,
      following,
    }: {
      artistId: string;
      artistName: string;
      image?: string;
      genre?: string;
      following: boolean;
    }) =>
      following
        ? followsApi.unfollowArtist(artistId)
        : followsApi.followArtist({ artistId, artistName, image, genre }),
    onSuccess: async (_, { artistId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: followKeys.artistStatus(artistId) }),
        queryClient.invalidateQueries({ queryKey: followKeys.followedArtists() }),
      ]);
    },
  });
}
