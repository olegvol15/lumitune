import fs from 'fs';
import { ISong } from './song.types';

export interface SongQueryInput {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
  genre?: unknown;
}

export interface SongUploadInput {
  file?: Express.Multer.File;
  body: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    coverImage?: string;
  };
  uploadedBy: string;
  allowEmptyUploader?: boolean;
  coverImage?: string;
}

export interface SongUpdateInput {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  coverImage?: string;
}

export interface SongListResult {
  songs: ISong[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StreamSongResult {
  statusCode: 200 | 206;
  headers: Record<string, string | number>;
  stream: fs.ReadStream;
}
