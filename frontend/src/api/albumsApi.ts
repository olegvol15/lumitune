import apiClient from '../lib/apiClient';
import type { Album, Track } from '../types';
import type {
  AlbumResponse,
  AlbumsResponse,
  BackendAlbum,
  SavedAlbumsResponse,
  SaveAlbumResponse,
} from '../types/media/album-api.types';
import { mapBackendSongToTrack } from '../utils/song-catalog.utils';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function coverUrl(path?: string): string {
  if (!path || path === 'default-album-cover.jpg') return '/vite.svg';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

export function mapBackendAlbum(album: BackendAlbum, saved?: boolean): Album {
  const artistId = slugify(album.artistName) || 'unknown-artist';

  return {
    id: album._id,
    title: album.title,
    artistId,
    artistName: album.artistName,
    coverUrl: coverUrl(album.coverImage),
    year: album.releaseDate ? new Date(album.releaseDate).getFullYear() : new Date(album.publishedAt).getFullYear(),
    genre: album.genre ?? '',
    trackIds: album.trackIds ?? [],
    description: album.description ?? '',
    releaseDate: album.releaseDate,
    duration: album.totalDuration ?? 0,
    trackCount: album.trackCount ?? album.trackIds?.length ?? 0,
    saved,
    artistUserId: album.artistUserId,
  };
}

const albumsApi = {
  list: async (): Promise<Album[]> => {
    const { data } = await apiClient.get<AlbumsResponse>('/albums');
    return data.albums.map((album) => mapBackendAlbum(album, data.savedIds?.includes(album._id)));
  },

  getById: async (id: string): Promise<{ album: Album; tracks: Track[]; saved: boolean }> => {
    const { data } = await apiClient.get<AlbumResponse>(`/albums/${id}`);
    return {
      album: mapBackendAlbum(data.album, data.saved),
      tracks: data.tracks.map(mapBackendSongToTrack),
      saved: data.saved,
    };
  },

  listSaved: async (): Promise<Album[]> => {
    const { data } = await apiClient.get<SavedAlbumsResponse>('/albums/saved');
    return data.albums.map((album) => mapBackendAlbum(album, true));
  },

  listMine: async (): Promise<Album[]> => {
    const { data } = await apiClient.get<AlbumsResponse>('/albums/mine');
    return data.albums.map((album) => mapBackendAlbum(album, data.savedIds?.includes(album._id)));
  },

  save: async (albumId: string): Promise<boolean> => {
    const { data } = await apiClient.post<SaveAlbumResponse>(`/albums/saved/${albumId}`);
    return data.saved;
  },

  unsave: async (albumId: string): Promise<boolean> => {
    const { data } = await apiClient.delete<SaveAlbumResponse>(`/albums/saved/${albumId}`);
    return data.saved;
  },

  create: (formData: FormData) =>
    apiClient.post('/albums', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    apiClient.put(`/albums/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  remove: (id: string) => apiClient.delete(`/albums/${id}`),

  createByAdmin: (formData: FormData) =>
    apiClient.post('/admin/albums', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateByAdmin: (id: string, formData: FormData) =>
    apiClient.put(`/admin/albums/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  removeByAdmin: (id: string) => apiClient.delete(`/admin/albums/${id}`),
};

export default albumsApi;
