import apiClient from '../lib/apiClient';
import type { PlaylistResponse, PlaylistsResponse } from '../types/media/playlist-api.types';

const playlistsApi = {
  list: () => apiClient.get<PlaylistsResponse>('/playlists'),
  create: (payload: {
    name: string;
    description?: string;
    coverImage?: string;
    isPublic?: boolean;
  }) => apiClient.post<PlaylistResponse>('/playlists', payload),
  addSong: (playlistId: string, songId: string) =>
    apiClient.post<PlaylistResponse>(`/playlists/${playlistId}/songs`, { songId }),
};

export default playlistsApi;
