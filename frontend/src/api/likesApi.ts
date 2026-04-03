import apiClient from '../lib/apiClient';
import type { LikeStatusResponse, LikesResponse } from '../types/media/likes-api.types';

const likesApi = {
  list: () => apiClient.get<LikesResponse>('/likes'),
  check: (songId: string) => apiClient.get<LikeStatusResponse>(`/likes/${songId}`),
  like: (songId: string) => apiClient.post<LikeStatusResponse>(`/likes/${songId}`),
  unlike: (songId: string) => apiClient.delete<LikeStatusResponse>(`/likes/${songId}`),
};

export default likesApi;
