import { useMutation, useQuery } from '@tanstack/react-query';
import adminPlaylistsApi from '../api/adminPlaylistsApi';
import { queryClient } from '../lib/queryClient';
import { mapBackendSongToTrack } from '../utils/song-catalog.utils';
import type { BackendPlaylist } from '../types/media/playlist-api.types';
import type { AdminPlaylist } from '../types/admin/admin-playlists.types';

const adminPlaylistKeys = {
  all: ['admin-playlists'] as const,
  detail: (id: string) => ['admin-playlists', id] as const,
};

function coverUrl(path?: string) {
  if (!path || path === 'default-playlist-cover.jpg') return undefined;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
  return `/${path}`;
}

function mapAdminPlaylist(playlist: BackendPlaylist): AdminPlaylist {
  const tracks = playlist.songs.map(mapBackendSongToTrack);
  return {
    id: playlist._id,
    title: playlist.name,
    description: playlist.description ?? '',
    coverUrl: coverUrl(playlist.coverImage),
    isPublic: playlist.isPublic,
    kind: 'curated',
    tracks,
    trackIds: tracks.map((track) => track.id),
  };
}

export function useAdminPlaylistsQuery() {
  return useQuery({
    queryKey: adminPlaylistKeys.all,
    queryFn: async () => {
      const { data } = await adminPlaylistsApi.list();
      return data.playlists.map(mapAdminPlaylist);
    },
  });
}

export function useAdminPlaylistQuery(id: string) {
  return useQuery({
    queryKey: adminPlaylistKeys.detail(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await adminPlaylistsApi.getById(id);
      return mapAdminPlaylist(data.playlist);
    },
  });
}

export function useAdminCreatePlaylistMutation() {
  return useMutation({
    mutationFn: adminPlaylistsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminPlaylistKeys.all });
      await queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

export function useAdminUpdatePlaylistMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; description?: string; coverImage?: string; isPublic?: boolean } }) =>
      adminPlaylistsApi.update(id, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminPlaylistKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminPlaylistKeys.detail(variables.id) }),
        queryClient.invalidateQueries({ queryKey: ['playlists'] }),
      ]);
    },
  });
}

export function useAdminDeletePlaylistMutation() {
  return useMutation({
    mutationFn: adminPlaylistsApi.remove,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminPlaylistKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['playlists'] }),
      ]);
    },
  });
}

export function useAdminAddSongToPlaylistMutation() {
  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      adminPlaylistsApi.addSong(playlistId, songId),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminPlaylistKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminPlaylistKeys.detail(variables.playlistId) }),
        queryClient.invalidateQueries({ queryKey: ['playlists'] }),
      ]);
    },
  });
}

export function useAdminRemoveSongFromPlaylistMutation() {
  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      adminPlaylistsApi.removeSong(playlistId, songId),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminPlaylistKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminPlaylistKeys.detail(variables.playlistId) }),
        queryClient.invalidateQueries({ queryKey: ['playlists'] }),
      ]);
    },
  });
}
