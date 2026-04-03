import apiClient from '../lib/apiClient';
import type {
  PodcastsResponse,
  PodcastResponse,
  EpisodeResponse,
  BackendPodcast,
  BackendEpisode,
} from '../types/media/podcast-api.types';
import type { Episode, Podcast } from '../types';

const COVER_BASE = '/uploads/';

function coverUrl(path?: string): string {
  if (!path || path === 'default-podcast-cover.jpg') return '/default-cover.jpg';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

export function mapBackendEpisode(ep: BackendEpisode, podcast?: BackendPodcast): Episode {
  const pod = typeof ep.podcast === 'string' ? podcast : (ep.podcast as BackendPodcast);
  return {
    id: ep._id,
    title: ep.title,
    description: ep.description ?? '',
    podcastId: pod?._id ?? (typeof ep.podcast === 'string' ? ep.podcast : ''),
    podcastTitle: pod?.title ?? '',
    podcastCover: coverUrl(ep.coverImage ?? pod?.coverImage),
    duration: ep.duration,
    episodeNumber: ep.episodeNumber,
    publishedAt: ep.publishedAt,
    plays: ep.plays,
  };
}

export function mapBackendPodcast(p: BackendPodcast, episodes?: BackendEpisode[]): Podcast {
  return {
    id: p._id,
    title: p.title,
    author: p.author,
    description: p.description,
    coverUrl: coverUrl(p.coverImage),
    category: p.category,
    episodes: episodes?.map((ep) => mapBackendEpisode(ep, p)),
  };
}

const podcastsApi = {
  list: async (): Promise<Podcast[]> => {
    const { data } = await apiClient.get<PodcastsResponse>('/podcasts');
    return data.podcasts.map((p) => mapBackendPodcast(p));
  },

  getById: async (id: string): Promise<Podcast> => {
    const { data } = await apiClient.get<PodcastResponse>(`/podcasts/${id}`);
    return mapBackendPodcast(data.podcast, data.episodes);
  },

  getEpisodeById: async (episodeId: string): Promise<Episode> => {
    const { data } = await apiClient.get<EpisodeResponse>(`/podcasts/episodes/${episodeId}`);
    const pod =
      typeof data.episode.podcast === 'string' ? undefined : (data.episode.podcast as BackendPodcast);
    return mapBackendEpisode(data.episode, pod);
  },

  create: (formData: FormData) =>
    apiClient.post<{ success: boolean; podcast: BackendPodcast }>('/admin/podcasts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    apiClient.put<{ success: boolean; podcast: BackendPodcast }>(`/admin/podcasts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  remove: (id: string) => apiClient.delete(`/admin/podcasts/${id}`),

  uploadEpisode: (podcastId: string, formData: FormData) =>
    apiClient.post<EpisodeResponse>(`/admin/podcasts/${podcastId}/episodes`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateEpisode: (episodeId: string, formData: FormData) =>
    apiClient.put<EpisodeResponse>(`/admin/podcasts/episodes/${episodeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  removeEpisode: (episodeId: string) =>
    apiClient.delete(`/admin/podcasts/episodes/${episodeId}`),

  episodeStreamUrl: (episodeId: string) => `/api/podcasts/episodes/${episodeId}/stream`,
};

export default podcastsApi;
export { COVER_BASE };
