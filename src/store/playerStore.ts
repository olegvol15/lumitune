import { create } from 'zustand';
import type { Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number; // 0–1
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  // Actions
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  shuffle: false,
  repeat: 'off',

  play: (track, queue) =>
    set({
      currentTrack: track,
      queue: queue ?? get().queue,
      isPlaying: true,
      progress: 0,
    }),

  pause: () => set({ isPlaying: false }),

  resume: () => set({ isPlaying: true }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { queue, currentTrack, shuffle, repeat } = get();
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (repeat === 'one') {
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

  seek: (progress) => set({ progress }),

  setVolume: (volume) => set({ volume }),

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  toggleRepeat: () =>
    set((s) => ({
      repeat:
        s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off',
    })),

  toggleLike: () =>
    set((s) => {
      if (!s.currentTrack) return s;
      return {
        currentTrack: { ...s.currentTrack, liked: !s.currentTrack.liked },
      };
    }),
}));
