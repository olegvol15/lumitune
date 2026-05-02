import apiClient from '../lib/apiClient';
import type { Artist } from '../types';
import type {
  ArtistResponse,
  ArtistsResponse,
  BackendArtistStats,
} from '../types/media/artist-api.types';

const fallbackImage = '/vite.svg';

function mediaUrl(path?: string): string {
  if (!path) return fallbackImage;
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

export function mapBackendArtist(stats: BackendArtistStats): Artist {
  const { artist } = stats;

  return {
    id: artist.slug,
    backendId: artist._id,
    name: artist.name,
    image: mediaUrl(artist.image),
    bannerImage: artist.bannerImage ? mediaUrl(artist.bannerImage) : undefined,
    genre: artist.genre ?? '',
    monthlyListeners: stats.monthlyListeners,
    followers: stats.followers,
    trackCount: stats.trackCount,
    bio: artist.bio ?? '',
    verified: artist.verified,
    artistUserId: artist.artistUserId,
    isFollowable: true,
  };
}

const artistsApi = {
  list: async (): Promise<Artist[]> => {
    const { data } = await apiClient.get<ArtistsResponse>('/artists');
    return data.artists.map(mapBackendArtist);
  },

  getById: async (id: string): Promise<Artist> => {
    const { data } = await apiClient.get<ArtistResponse>(`/artists/${id}`);
    return mapBackendArtist(data);
  },
};

export default artistsApi;
