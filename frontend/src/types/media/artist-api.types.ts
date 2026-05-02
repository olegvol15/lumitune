export interface BackendArtist {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bannerImage?: string;
  genre?: string;
  bio?: string;
  verified: boolean;
  artistUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendArtistStats {
  artist: BackendArtist;
  monthlyListeners: number;
  followers: number;
  trackCount: number;
}

export interface ArtistsResponse {
  success: boolean;
  artists: BackendArtistStats[];
}

export interface ArtistResponse extends BackendArtistStats {
  success: boolean;
}
