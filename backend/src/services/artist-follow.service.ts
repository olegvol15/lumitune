import { ArtistFollow } from '../models/artist-follow.model';
import { ServiceError } from '../types/error/service-error';

const normalizeValue = (value: unknown): string =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

const normalizeArtistId = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    : '';

export const artistFollowService = {
  async follow(userId: string, input: { artistId?: unknown; artistName?: unknown; image?: unknown; genre?: unknown }) {
    const artistId = normalizeArtistId(input.artistId);
    const artistName = normalizeValue(input.artistName);
    const image = normalizeValue(input.image);
    const genre = normalizeValue(input.genre);

    if (!artistId) {
      throw new ServiceError(400, 'Artist id is required');
    }
    if (!artistName) {
      throw new ServiceError(400, 'Artist name is required');
    }

    const existing = await ArtistFollow.exists({ userId, artistId });
    if (existing) {
      throw new ServiceError(409, 'You are already following this artist');
    }

    await ArtistFollow.create({
      userId,
      artistId,
      artistName,
      ...(image ? { image } : {}),
      ...(genre ? { genre } : {}),
    });

    const followerCount = await ArtistFollow.countDocuments({ artistId });
    return { following: true, followerCount };
  },

  async unfollow(userId: string, artistIdInput: unknown) {
    const artistId = normalizeArtistId(artistIdInput);
    if (!artistId) {
      throw new ServiceError(400, 'Artist id is required');
    }

    await ArtistFollow.findOneAndDelete({ userId, artistId });
    const followerCount = await ArtistFollow.countDocuments({ artistId });
    return { following: false, followerCount };
  },

  async getStatus(userId: string | undefined, artistIdInput: unknown) {
    const artistId = normalizeArtistId(artistIdInput);
    if (!artistId) {
      throw new ServiceError(400, 'Artist id is required');
    }

    const [following, followerCount] = await Promise.all([
      userId ? ArtistFollow.exists({ userId, artistId }) : Promise.resolve(null),
      ArtistFollow.countDocuments({ artistId }),
    ]);

    return {
      following: userId ? Boolean(following) : null,
      followerCount,
    };
  },

  async listMine(userId: string) {
    const artists = await ArtistFollow.find({ userId }).sort({ createdAt: -1 });
    return { artists };
  },
};
