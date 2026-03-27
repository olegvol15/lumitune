import apiClient from '../lib/apiClient';
import type { PlaylistResponse, PlaylistsResponse } from '../types/media/playlist-api.types';

const playlistsApi = {
  list: () => apiClient.get<PlaylistsResponse>('/playlists'),

  create: (payload: { name: string }) => apiClient.post<PlaylistResponse>('/playlists', payload),

  rename: (playlistId: string, name: string) =>
    apiClient.put<PlaylistResponse>(`/playlists/${playlistId}`, { name }),

  remove: (playlistId: string) => apiClient.delete(`/playlists/${playlistId}`),

  addSong: (playlistId: string, songId: string) =>
    apiClient.post<PlaylistResponse>(`/playlists/${playlistId}/songs`, { songId }),

  removeSong: (playlistId: string, songId: string) =>
    apiClient.delete(`/playlists/${playlistId}/songs/${songId}`),
};

export default playlistsApi;
