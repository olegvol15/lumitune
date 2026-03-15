import apiClient from '../lib/apiClient';

interface BackendSong {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration: number;
  filePath: string;
  coverImage?: string;
  plays: number;
}

interface SongsResponse {
  success: boolean;
  songs: BackendSong[];
}

interface SongResponse {
  success: boolean;
  song: BackendSong;
}

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

export type { BackendSong };
export default adminSongsApi;
