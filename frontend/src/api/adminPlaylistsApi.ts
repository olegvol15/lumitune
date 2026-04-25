import apiClient from '../lib/apiClient';
import type { BackendPlaylist, PlaylistResponse, PlaylistsResponse } from '../types/media/playlist-api.types';

const adminPlaylistsApi = {
  list: () => apiClient.get<PlaylistsResponse>('/admin/playlists'),

  getById: (playlistId: string) => apiClient.get<PlaylistResponse>(`/admin/playlists/${playlistId}`),

  create: (payload: {
    name: string;
    description?: string;
    coverImage?: string;
    isPublic?: boolean;
  }) => apiClient.post<PlaylistResponse>('/admin/playlists', payload),

  update: (
    playlistId: string,
    payload: {
      name?: string;
      description?: string;
      coverImage?: string;
      isPublic?: boolean;
    }
  ) => apiClient.put<PlaylistResponse>(`/admin/playlists/${playlistId}`, payload),

  remove: (playlistId: string) => apiClient.delete(`/admin/playlists/${playlistId}`),

  addSong: (playlistId: string, songId: string) =>
    apiClient.post<PlaylistResponse>(`/admin/playlists/${playlistId}/songs`, { songId }),

  removeSong: (playlistId: string, songId: string) =>
    apiClient.delete(`/admin/playlists/${playlistId}/songs/${songId}`),
};

export default adminPlaylistsApi;
export type { BackendPlaylist };
