import apiClient from '../lib/apiClient';
import { ADMIN_TOKEN_KEY } from '../utils/admin-auth-store.utils';

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

const withAdminAuth = () => {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

const adminSongsApi = {
  list: () => apiClient.get<SongsResponse>('/admin/songs', withAdminAuth()),

  create: (data: FormData) =>
    apiClient.post<SongResponse>('/admin/songs/upload', data, {
      ...withAdminAuth(),
      headers: {
        ...withAdminAuth().headers,
        'Content-Type': 'multipart/form-data',
      },
    }),

  update: (songId: string, payload: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    coverImage?: string;
  }) => apiClient.put<SongResponse>(`/admin/songs/${songId}`, payload, withAdminAuth()),

  remove: (songId: string) => apiClient.delete(`/admin/songs/${songId}`, withAdminAuth()),
};

export type { BackendSong };
export default adminSongsApi;
