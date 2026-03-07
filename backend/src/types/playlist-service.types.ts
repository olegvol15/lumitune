import { IPlaylist } from './playlist.types';

export interface PlaylistCreateInput {
  name?: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
}

export interface PlaylistUpdateInput {
  name?: string;
  description?: string;
  coverImage?: string;
  isPublic?: boolean;
}

export interface PlaylistListResult {
  playlists: IPlaylist[];
}

export interface PlaylistResult {
  playlist: IPlaylist;
}
