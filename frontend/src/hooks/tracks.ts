import { useMutation, useQuery } from '@tanstack/react-query';
import adminSongsApi from '../api/adminSongsApi';
import songsApi from '../api/songsApi';
import { queryClient } from '../lib/queryClient';
import type { AdminTrack } from '../types/admin/admin-tracks.types';
import { mapBackendSongToAdminTrack } from '../utils/admin-song-mapper.utils';
import { tracksKeys } from './api-keys';

function buildTrackFormData(track: AdminTrack, coverFile?: File | null) {
  const formData = new FormData();
  formData.append('title', track.title);
  formData.append('artist', track.artistName || track.artistId || track.artist || '');
  formData.append('album', track.albumTitle || track.albumId || track.album || '');
  formData.append('genre', track.genreId || track.genre || '');
  if (coverFile) {
    formData.append('cover', coverFile);
  }
  return formData;
}

export function useCatalogTracks() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: tracksKeys.catalog(),
    queryFn: songsApi.listCatalogTracks,
  });

  return {
    tracks: data ?? [],
    isLoading,
    hasLoaded: data !== undefined || error !== null,
    error: error instanceof Error ? error.message : null,
    refresh: refetch,
    isFetching,
  };
}

export function useAdminTracksQuery() {
  return useQuery({
    queryKey: tracksKeys.adminList(),
    queryFn: async () => {
      const { data } = await adminSongsApi.list();
      return data.songs.map((song, index) => mapBackendSongToAdminTrack(song, index));
    },
  });
}

export function useSaveAdminTrackMutation() {
  return useMutation({
    mutationFn: async ({
      mode,
      track,
      audioFile,
      coverFile,
    }: {
      mode: 'new' | 'edit';
      track: AdminTrack;
      audioFile?: File | null;
      coverFile?: File | null;
    }) => {
      if (mode === 'new') {
        if (!audioFile) {
          throw new Error('Audio file is required for new songs');
        }

        const formData = buildTrackFormData(track, coverFile);
        formData.append('audio', audioFile);
        return adminSongsApi.create(formData);
      }

      const songId = track.backendId || track.id;
      const formData = buildTrackFormData(track, coverFile);
      return adminSongsApi.update(songId, formData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tracksKeys.adminList() });
    },
  });
}

export function useDeleteAdminTrackMutation() {
  return useMutation({
    mutationFn: (songId: string) => adminSongsApi.remove(songId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tracksKeys.adminList() });
    },
  });
}

export function useDeleteSelectedAdminTracksMutation() {
  return useMutation({
    mutationFn: (songIds: string[]) =>
      Promise.all(songIds.map((songId) => adminSongsApi.remove(songId))),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tracksKeys.adminList() });
    },
  });
}
