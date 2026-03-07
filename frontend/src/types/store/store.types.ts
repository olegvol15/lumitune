import type { Track } from '../index';
import type { AuthUser } from '../auth/auth-types';

export interface UserPlaylist {
  id: string;
  title: string;
  trackIds: string[];
}

export interface PlaylistStore {
  playlists: UserPlaylist[];
  createPlaylist: () => string;
  addTrack: (playlistId: string, trackId: string) => void;
  removeTrack: (playlistId: string, trackId: string) => void;
}

export interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
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
}

export interface SongsCatalogStore {
  tracks: Track[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchTracks: () => Promise<void>;
}
