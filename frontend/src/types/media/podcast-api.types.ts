export interface BackendPodcast {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage?: string;
  category?: string;
  createdAt: string;
}

export interface BackendEpisode {
  _id: string;
  title: string;
  description?: string;
  podcast: string | BackendPodcast;
  filePath: string;
  coverImage?: string;
  duration: number;
  episodeNumber: number;
  plays: number;
  publishedAt: string;
}

export interface PodcastsResponse {
  success: boolean;
  podcasts: BackendPodcast[];
}

export interface PodcastResponse {
  success: boolean;
  podcast: BackendPodcast;
  episodes: BackendEpisode[];
}

export interface EpisodeResponse {
  success: boolean;
  episode: BackendEpisode;
}
