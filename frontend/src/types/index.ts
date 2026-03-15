export interface Artist {
  id: string;
  name: string;
  image: string;
  genre: string;
  monthlyListeners: number;
  followers: number;
  bio: string;
  verified: boolean;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  year: number;
  genre: string;
  trackIds: string[];
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumTitle: string;
  albumCover: string;
  duration: number; // seconds
  playCount: number;
  liked: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  createdBy: string;
  isPublic: boolean;
}

export interface Episode {
  id: string;
  title: string;
  podcastName: string;
  coverUrl: string;
  duration: number;
  publishedAt: string;
}

export interface Notification {
  id: string;
  type: 'new_release' | 'follow' | 'playlist' | 'podcast';
  title: string;
  body: string;
  imageUrl: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  followers: number;
  following: number;
  totalStreams: number;
  topTrackIds: string[];
  topAlbumIds: string[];
  favoriteArtistIds: string[];
}

export interface Podcast {
  id: string;
  title: string;
  podcastName: string;
  coverUrl: string;
  description: string;
  publishedAt: string;
  duration: number; // seconds
}

export interface Audiobook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  genre: string;
  description: string;
  publishedAt: string;
  duration: number; // seconds
}
