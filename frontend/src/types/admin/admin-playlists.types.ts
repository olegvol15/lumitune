import type { Track } from '../index';

export interface AdminPlaylist {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  isPublic: boolean;
  kind: 'curated';
  tracks: Track[];
  trackIds: string[];
  updatedAt?: string;
}
