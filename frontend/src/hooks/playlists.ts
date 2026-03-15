import { useMutation } from '@tanstack/react-query';
import playlistsApi from '../api/playlistsApi';

export function useCreatePlaylistMutation() {
  return useMutation({
    mutationFn: (payload: {
      name: string;
      description?: string;
      coverImage?: string;
      isPublic?: boolean;
    }) => playlistsApi.create(payload),
  });
}

export function useAddSongToPlaylistMutation() {
  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      playlistsApi.addSong(playlistId, songId),
  });
}
