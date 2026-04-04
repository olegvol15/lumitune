import fs from 'fs';
import type { IAlbum } from './album.types';
import type { ISong } from '../song/song.types';

export interface AlbumCreateInput {
  title: string;
  artistName?: string;
  description?: string;
  genre?: string;
  releaseDate?: string;
  coverImage?: string;
  trackIds?: string[];
  ownerUserId?: string;
}

export interface AlbumUpdateInput extends Partial<AlbumCreateInput> {
  trackIds?: string[];
}

export interface AlbumListResult {
  albums: IAlbum[];
  savedIds: string[];
}

export interface AlbumDetailResult {
  album: IAlbum;
  tracks: ISong[];
  saved: boolean;
}

export interface AlbumStreamResult {
  statusCode: 200 | 206;
  headers: Record<string, string | number>;
  stream: fs.ReadStream;
}
