import apiClient from '../lib/apiClient';
import type {
  ArtistFollowMutationResponse,
  ArtistFollowStatusResponse,
  FollowMutationResponse,
  FollowedArtistsResponse,
  FollowingIdsResponse,
  FollowingListResponse,
  UserProfileResponse,
} from '../types/user-follow.types';

const followsApi = {
  getUserProfile: async (userId: string) => {
    const { data } = await apiClient.get<UserProfileResponse>(`/users/${userId}`);
    return data;
  },

  listFollowing: async (userId: string) => {
    const { data } = await apiClient.get<FollowingListResponse>(`/users/${userId}/following`);
    return data;
  },

  listFollowingIds: async () => {
    const { data } = await apiClient.get<FollowingIdsResponse>('/users/following-ids');
    return data.ids;
  },

  follow: async (userId: string) => {
    const { data } = await apiClient.post<FollowMutationResponse>(`/users/${userId}/follow`);
    return data.following;
  },

  unfollow: async (userId: string) => {
    const { data } = await apiClient.delete<FollowMutationResponse>(`/users/${userId}/follow`);
    return data.following;
  },

  getArtistStatus: async (artistId: string) => {
    const { data } = await apiClient.get<ArtistFollowStatusResponse>(`/artist-follows/${artistId}`);
    return data;
  },

  listFollowedArtists: async () => {
    const { data } = await apiClient.get<FollowedArtistsResponse>('/artist-follows');
    return data.artists;
  },

  followArtist: async (input: { artistId: string; artistName: string; image?: string; genre?: string }) => {
    const { data } = await apiClient.post<ArtistFollowMutationResponse>(
      `/artist-follows/${input.artistId}`,
      input
    );
    return data;
  },

  unfollowArtist: async (artistId: string) => {
    const { data } = await apiClient.delete<ArtistFollowMutationResponse>(`/artist-follows/${artistId}`);
    return data;
  },
};

export default followsApi;
