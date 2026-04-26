import apiClient from '../lib/apiClient';
import type { AdminMoodResponse, AdminMoodsResponse } from '../types/admin/admin-moods.types';

const adminMoodsApi = {
  list: () => apiClient.get<AdminMoodsResponse>('/admin/moods'),

  create: (payload: { name: string }) => apiClient.post<AdminMoodResponse>('/admin/moods', payload),

  update: (moodId: string, payload: { name: string }) =>
    apiClient.put<AdminMoodResponse>(`/admin/moods/${moodId}`, payload),

  remove: (moodId: string) => apiClient.delete(`/admin/moods/${moodId}`),
};

export default adminMoodsApi;
