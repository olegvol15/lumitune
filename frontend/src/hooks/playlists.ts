import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import playlistsApi from '../api/playlistsApi';
import { playlistKeys } from './api-keys';
import { useAuthStore } from '../store/authStore';
import type { BackendPlaylist } from '../types/media/playlist-api.types';
import type { UserPlaylist } from '../types/store/store.types';

function mapPlaylist(p: BackendPlaylist): UserPlaylist {
  return {
    id: p._id,
    title: p.name,
    trackIds: p.songs.map((s) => s._id),
  };
}

export function usePlaylistsQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: playlistKeys.all,
    queryFn: async () => {
      const res = await playlistsApi.list();
      return res.data.playlists.map(mapPlaylist);
    },
    enabled: isAuthenticated,
  });
}

export function useCreatePlaylistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await playlistsApi.create({ name });
      return mapPlaylist(res.data.playlist);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: playlistKeys.all }),
  });
}

export function useRenamePlaylistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, name }: { playlistId: string; name: string }) =>
      playlistsApi.rename(playlistId, name),
    onSuccess: (res, { playlistId }) => {
      qc.setQueryData<UserPlaylist[]>(playlistKeys.all, (old = []) =>
        old.map((p) => (p.id === playlistId ? mapPlaylist(res.data.playlist) : p))
      );
    },
  });
}

export function useDeletePlaylistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playlistId: string) => playlistsApi.remove(playlistId),
    onSuccess: () => qc.invalidateQueries({ queryKey: playlistKeys.all }),
  });
}

export function useAddSongMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      playlistsApi.addSong(playlistId, songId),
    onSuccess: () => qc.invalidateQueries({ queryKey: playlistKeys.all }),
  });
}

export function useRemoveSongMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      playlistsApi.removeSong(playlistId, songId),
    onSuccess: () => qc.invalidateQueries({ queryKey: playlistKeys.all }),
  });
}
