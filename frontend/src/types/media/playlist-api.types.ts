import type { BackendSong } from './song-api.types';

export type BackendPlaylistSong = BackendSong;

export interface BackendPlaylist {
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  owner?: string;
  songs: BackendPlaylistSong[];
  isPublic: boolean;
  kind?: 'user' | 'curated';
}

export interface PlaylistResponse {
  success: boolean;
  playlist: BackendPlaylist;
}

export interface PlaylistsResponse {
  success: boolean;
  playlists: BackendPlaylist[];
}
