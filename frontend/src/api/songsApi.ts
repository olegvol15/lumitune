import apiClient from '../lib/apiClient';
import type { SongsResponse } from '../types/media/song-api.types';
import { mapBackendSongToTrack } from '../utils/song-catalog.utils';

const songsApi = {
  list: () => apiClient.get<SongsResponse>('/songs'),
  listCatalogTracks: async () => {
    const { data } = await apiClient.get<SongsResponse>('/songs');
    return data.songs.map(mapBackendSongToTrack);
  },
};

export default songsApi;
