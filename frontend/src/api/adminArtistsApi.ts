import apiClient from '../lib/apiClient';
import type {
  AdminArtistPayload,
  AdminArtistResponse,
  AdminArtistsResponse,
} from '../types/admin/admin-artists.types';

const adminArtistsApi = {
  list: () => apiClient.get<AdminArtistsResponse>('/admin/artists'),

  create: (payload: AdminArtistPayload) =>
    apiClient.post<AdminArtistResponse>('/admin/artists', payload),

  update: (artistId: string, payload: AdminArtistPayload) =>
    apiClient.put<AdminArtistResponse>(`/admin/artists/${artistId}`, payload),

  remove: (artistId: string) => apiClient.delete(`/admin/artists/${artistId}`),
};

export default adminArtistsApi;
