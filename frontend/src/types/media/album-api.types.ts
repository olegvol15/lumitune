import type { BackendSong } from './song-api.types';

export interface BackendAlbum {
  _id: string;
  title: string;
  artistName: string;
  artistUserId?: string;
  description?: string;
  coverImage?: string;
  genre?: string;
  releaseDate?: string;
  publishedAt: string;
  trackIds: string[];
  trackCount: number;
  totalDuration: number;
  createdAt: string;
}

export interface AlbumsResponse {
  success: boolean;
  albums: BackendAlbum[];
  savedIds?: string[];
}

export interface AlbumResponse {
  success: boolean;
  album: BackendAlbum;
  tracks: BackendSong[];
  saved: boolean;
}

export interface SavedAlbumsResponse {
  success: boolean;
  albums: BackendAlbum[];
}

export interface SaveAlbumResponse {
  success: boolean;
  saved: boolean;
}
