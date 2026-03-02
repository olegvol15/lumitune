import { create } from "zustand";

export interface UserPlaylist {
  id: string;
  title: string;
  trackIds: string[];
}

interface PlaylistStore {
  playlists: UserPlaylist[];
  createPlaylist: () => string;
  addTrack: (playlistId: string, trackId: string) => void;
  removeTrack: (playlistId: string, trackId: string) => void;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],

  createPlaylist: () => {
    const id = `up-${Date.now()}`;
    const num = get().playlists.length + 1;
    const title = `Мій плейлист №${num}`;
    set((s) => ({ playlists: [...s.playlists, { id, title, trackIds: [] }] }));
    return id;
  },

  addTrack: (playlistId, trackId) => {
    set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === playlistId && !p.trackIds.includes(trackId)
          ? { ...p, trackIds: [...p.trackIds, trackId] }
          : p,
      ),
    }));
  },

  removeTrack: (playlistId, trackId) => {
    set((s) => ({
      playlists: s.playlists.map((p) =>
        p.id === playlistId
          ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) }
          : p,
      ),
    }));
  },
}));
