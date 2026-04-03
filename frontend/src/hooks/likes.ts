import { useMutation, useQuery } from '@tanstack/react-query';
import likesApi from '../api/likesApi';
import { queryClient } from '../lib/queryClient';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { mapBackendSongToTrack } from '../utils/song-catalog.utils';
import { tracksKeys } from './api-keys';

export function useLikedSongsQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: [...tracksKeys.all, 'liked'],
    queryFn: async () => {
      const { data } = await likesApi.list();
      return data.songs.map(mapBackendSongToTrack);
    },
    enabled: isAuthenticated,
  });
}

export function useToggleTrackLikeMutation() {
  return useMutation({
    mutationFn: async ({ songId, liked }: { songId: string; liked: boolean }) => {
      const response = liked ? await likesApi.unlike(songId) : await likesApi.like(songId);
      return response.data.liked;
    },
    onSuccess: async (liked, { songId }) => {
      queryClient.setQueryData(tracksKeys.catalog(), (old: Array<Record<string, unknown>> | undefined) =>
        old?.map((track) =>
          track.id === songId
            ? {
                ...track,
                liked,
              }
            : track
        )
      );

      const currentTrack = usePlayerStore.getState().currentTrack;
      if (currentTrack?.id === songId) {
        usePlayerStore.setState({
          currentTrack: {
            ...currentTrack,
            liked,
          },
        });
      }

      await queryClient.invalidateQueries({ queryKey: [...tracksKeys.all, 'liked'] });
    },
  });
}
