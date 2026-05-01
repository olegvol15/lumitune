export interface Artist {
  id: string;
  name: string;
  image: string;
  genre: string;
  monthlyListeners: number;
  followers: number;
  bio: string;
  verified: boolean;
  artistUserId?: string;
  isFollowable?: boolean;
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
  description?: string;
  releaseDate?: string;
  duration?: number;
  trackCount?: number;
  saved?: boolean;
  artistUserId?: string;
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
  uploadedById?: string;
  uploadedByUsername?: string;
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
  description: string;
  podcastId: string;
  podcastTitle: string;
  podcastCover: string;
  duration: number;
  episodeNumber: number;
  publishedAt: string;
  plays: number;
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
  author: string;
  description: string;
  coverUrl: string;
  category?: string;
  episodes?: Episode[];
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
  chapterCount: number;
  saved?: boolean;
  progress?: AudiobookProgress | null;
}

export interface AudiobookChapter {
  id: string;
  audiobookId: string;
  audiobookTitle: string;
  audiobookCover: string;
  author: string;
  title: string;
  description: string;
  duration: number;
  chapterNumber: number;
  publishedAt: string;
  plays: number;
}

export interface AudiobookProgress {
  audiobookId: string;
  currentChapterId: string;
  progressSeconds: number;
  progressPct: number;
  lastPlayedAt: string;
}
