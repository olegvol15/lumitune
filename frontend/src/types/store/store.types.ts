import type { Track, Episode } from '../index';
import type { AuthUser } from '../auth/auth-types';

export interface UserPlaylist {
  id: string;
  title: string;
  trackIds: string[];
}

export interface AuthStore {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  setSession: (accessToken: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  bootstrap: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
}

export interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (progress: number) => void;
  setProgress: (progress: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: () => void;
  currentEpisode: Episode | null;
  playEpisode: (episode: Episode) => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: (open: boolean) => void;
}
