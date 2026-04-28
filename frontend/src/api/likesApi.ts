import apiClient from '../lib/apiClient';
import type { LikeStatusResponse, LikesResponse } from '../types/media/likes-api.types';

const likesApi = {
  list: (limit = 100) => apiClient.get<LikesResponse>('/likes', { params: { limit } }),
  check: (songId: string) => apiClient.get<LikeStatusResponse>(`/likes/${songId}`),
  like: (songId: string) => apiClient.post<LikeStatusResponse>(`/likes/${songId}`),
  unlike: (songId: string) => apiClient.delete<LikeStatusResponse>(`/likes/${songId}`),
};

export default likesApi;
