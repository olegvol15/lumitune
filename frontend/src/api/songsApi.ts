import apiClient from '../lib/apiClient';
import type { SongsResponse } from '../types/media/song-api.types';

const songsApi = {
  list: () => apiClient.get<SongsResponse>('/songs'),
};

export default songsApi;
