import apiClient from '../lib/apiClient';
import type { MoodsResponse } from '../types/admin/admin-moods.types';

const moodsApi = {
  list: () => apiClient.get<MoodsResponse>('/moods'),
};

export default moodsApi;
