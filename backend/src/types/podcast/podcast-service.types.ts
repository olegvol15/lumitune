import fs from 'fs';
import type { IPodcast, IEpisode } from './podcast.types';

export interface PodcastCreateInput {
  title: string;
  author: string;
  description: string;
  coverImage?: string;
  category?: string;
}

export interface PodcastUpdateInput {
  title?: string;
  author?: string;
  description?: string;
  coverImage?: string;
  category?: string;
}

export interface EpisodeUploadInput {
  file?: Express.Multer.File;
  coverImage?: string;
  body: {
    title?: string;
    description?: string;
    episodeNumber?: string | number;
    publishedAt?: string;
  };
  podcastId: string;
}

export interface EpisodeUpdateInput {
  title?: string;
  description?: string;
  coverImage?: string;
  episodeNumber?: number;
  audioFile?: Express.Multer.File;
  filePath?: string;
  duration?: number;
}

export interface PodcastWithEpisodes {
  podcast: IPodcast;
  episodes: IEpisode[];
}

export interface StreamEpisodeResult {
  statusCode: 200 | 206;
  headers: Record<string, string | number>;
  stream: fs.ReadStream;
}
