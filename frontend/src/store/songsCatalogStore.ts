import { create } from 'zustand';
import songsApi from '../api/songsApi';
import type { SongsCatalogStore } from '../types/store/store.types';
import { getApiErrorMessage } from '../utils/api-error.utils';
import { mapBackendSongToTrack } from '../utils/song-catalog.utils';

export const useSongsCatalogStore = create<SongsCatalogStore>((set, get) => ({
  tracks: [],
  isLoading: false,
  hasLoaded: false,
  error: null,

  fetchTracks: async () => {
    if (get().isLoading) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data } = await songsApi.list();
      const tracks = data.songs.map(mapBackendSongToTrack);
      set({ tracks, isLoading: false, hasLoaded: true, error: null });
    } catch (error) {
      set({
        isLoading: false,
        hasLoaded: true,
        error: getApiErrorMessage(error, 'Failed to load songs'),
      });
    }
  },
}));
