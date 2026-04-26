import apiClient from '../lib/apiClient';
import type { AdminGenreResponse, AdminGenresResponse } from '../types/admin/admin-genres.types';

const adminGenresApi = {
  list: () => apiClient.get<AdminGenresResponse>('/admin/genres'),

  create: (payload: { name: string }) => apiClient.post<AdminGenreResponse>('/admin/genres', payload),

  update: (genreId: string, payload: { name: string }) =>
    apiClient.put<AdminGenreResponse>(`/admin/genres/${genreId}`, payload),

  remove: (genreId: string) => apiClient.delete(`/admin/genres/${genreId}`),
};

export default adminGenresApi;
