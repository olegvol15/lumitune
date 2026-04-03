import type { BackendSong } from './song-api.types';

export interface LikesResponse {
  success: boolean;
  songs: BackendSong[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LikeStatusResponse {
  success: boolean;
  liked: boolean;
}
