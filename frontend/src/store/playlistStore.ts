import { create } from "zustand";
import type { PlaylistStore } from "../types/store/store.types";

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
