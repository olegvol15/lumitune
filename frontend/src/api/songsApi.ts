import apiClient from '../lib/apiClient';
import type { SongResponse, SongsResponse } from '../types/media/song-api.types';
import { mapBackendSongToTrack } from '../utils/song-catalog.utils';

const songsApi = {
  list: () => apiClient.get<SongsResponse>('/songs'),
  listMine: () => apiClient.get<SongsResponse>('/songs/mine'),
  listCatalogTracks: async () => {
    const { data } = await apiClient.get<SongsResponse>('/songs');
    return data.songs.map(mapBackendSongToTrack);
  },
  uploadCreatorTrack: (data: FormData) =>
    apiClient.post<SongResponse>('/songs/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateCreatorTrack: (songId: string, data: FormData) =>
    apiClient.put<SongResponse>(`/songs/${songId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default songsApi;
