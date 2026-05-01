import type { BackendSong } from './media/song-api.types';

export interface FollowUser {
  id: string;
  username: string;
  displayName?: string;
  profilePicture?: string;
  role: 'user' | 'creator';
  isFollowedByMe: boolean | null;
}

export interface UserProfileResponse {
  success: boolean;
  user: {
    _id: string;
    email?: string;
    username: string;
    displayName?: string;
    role: 'user' | 'creator';
    bio?: string;
    coverImage?: string;
    profilePicture?: string;
  };
  followerCount: number;
  followingCount: number;
  isFollowing: boolean | null;
  tracks: BackendSong[];
}

export interface FollowingListResponse {
  success: boolean;
  following: FollowUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FollowingIdsResponse {
  success: boolean;
  ids: string[];
}

export interface FollowMutationResponse {
  success: boolean;
  following: boolean;
}

export interface ArtistFollow {
  _id: string;
  artistId: string;
  artistName: string;
  image?: string;
  genre?: string;
  createdAt: string;
}

export interface ArtistFollowStatusResponse {
  success: boolean;
  following: boolean | null;
  followerCount: number;
}

export interface FollowedArtistsResponse {
  success: boolean;
  artists: ArtistFollow[];
}

export interface ArtistFollowMutationResponse {
  success: boolean;
  following: boolean;
  followerCount: number;
}
