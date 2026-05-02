import type { BackendArtist, BackendArtistStats } from '../media/artist-api.types';

export interface AdminArtist {
  id: string;
  name: string;
  slug: string;
  image: string;
  bannerImage: string;
  genre: string;
  bio: string;
  verified: boolean;
  artistUserId?: string;
  monthlyListeners: number;
  followers: number;
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AdminArtistPayload = {
  name: string;
  slug?: string;
  image?: string;
  bannerImage?: string;
  genre?: string;
  bio?: string;
  verified?: boolean;
  artistUserId?: string;
};

export interface AdminArtistsResponse {
  success: boolean;
  artists: BackendArtistStats[];
}

export interface AdminArtistResponse {
  success: boolean;
  artist: BackendArtist;
}
