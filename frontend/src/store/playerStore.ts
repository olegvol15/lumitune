import { create } from "zustand";
import type { PlayerStore } from "../types/store/store.types";

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  shuffle: false,
  repeat: "off",

  play: (track, queue) =>
    set({
      currentTrack: track,
      queue: queue ?? get().queue,
      isPlaying: true,
      progress: 0,
    }),

  pause: () => set({ isPlaying: false }),

  resume: () => set({ isPlaying: true }),

  togglePlay: () =>
    set((s) => {
      if (!s.currentTrack) {
        return s;
      }
      return { isPlaying: !s.isPlaying };
    }),

  next: () => {
    const { queue, currentTrack, shuffle, repeat } = get();
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (repeat === "one") {
      nextIdx = idx;
    } else {
      nextIdx = (idx + 1) % queue.length;
    }
    set({ currentTrack: queue[nextIdx], progress: 0, isPlaying: true });
  },

  prev: () => {
    const { queue, currentTrack, progress } = get();
    if (!currentTrack) return;
    // If more than 3s in, restart; otherwise go to previous
    if (progress > 0.05) {
      set({ progress: 0 });
      return;
    }
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = idx <= 0 ? queue.length - 1 : idx - 1;
    set({ currentTrack: queue[prevIdx], progress: 0, isPlaying: true });
  },

  seek: (progress) => set({ progress: Math.max(0, Math.min(1, progress)) }),

  setProgress: (progress) =>
    set({ progress: Math.max(0, Math.min(1, progress)) }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setVolume: (volume) => set({ volume }),

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  toggleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
    })),

  toggleLike: () =>
    set((s) => {
      if (!s.currentTrack) return s;
      return {
        currentTrack: { ...s.currentTrack, liked: !s.currentTrack.liked },
      };
    }),
}));
