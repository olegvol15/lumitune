import apiClient from '../lib/apiClient';
import type { SongResponse, SongsResponse } from '../types/media/song-api.types';

const adminSongsApi = {
  list: () => apiClient.get<SongsResponse>('/admin/songs'),

  create: (data: FormData) => {
    return apiClient.post<SongResponse>('/admin/songs/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  update: (songId: string, data: FormData) => {
    return apiClient.put<SongResponse>(`/admin/songs/${songId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  remove: (songId: string) => apiClient.delete(`/admin/songs/${songId}`),
};
export default adminSongsApi;
