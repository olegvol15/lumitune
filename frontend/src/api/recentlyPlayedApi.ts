import apiClient from '../lib/apiClient';
import type {
  RecentlyPlayedRecordPayload,
  RecentlyPlayedResponse,
} from '../types/media/recently-played-api.types';

const recentlyPlayedApi = {
  list: async (limit = 6) => {
    const { data } = await apiClient.get<RecentlyPlayedResponse>('/recently-played', {
      headers: { 'Cache-Control': 'no-cache' },
      params: { limit, t: Date.now() },
    });
    return data.items;
  },
  record: (payload: RecentlyPlayedRecordPayload) => apiClient.post('/recently-played', payload),
  clear: () => apiClient.delete('/recently-played'),
};

export default recentlyPlayedApi;
