import { Artist } from '../models/artist.model';
import { ArtistFollow } from '../models/artist-follow.model';
import { Album } from '../models/album.model';
import { RecentlyPlayed } from '../models/recently-played.model';
import { Song } from '../models/song.model';
import { ServiceError } from '../types/error/service-error';
import { ensureObjectId } from '../utils/mongoose.utils';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeString = (value: unknown): string =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

const normalizeOptionalString = (value: unknown): string | undefined => {
  const normalized = normalizeString(value);
  return normalized || undefined;
};

async function assertUniqueSlug(slug: string, excludeId?: string) {
  const existing = await Artist.findOne({
    slug,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

  if (existing) {
    throw new ServiceError(409, 'Artist slug already exists');
  }
}

async function getMonthlyListenersBySlug() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const rows = await RecentlyPlayed.aggregate<{ _id: string; listenerIds: unknown[] }>([
    {
      $match: {
        itemType: 'song',
        playedAt: { $gte: since },
      },
    },
    {
      $lookup: {
        from: 'songs',
        localField: 'itemId',
        foreignField: '_id',
        as: 'song',
      },
    },
    { $unwind: '$song' },
    {
      $group: {
        _id: '$song.artist',
        listenerIds: { $addToSet: '$userId' },
      },
    },
  ]);

  return new Map(rows.map((row) => [slugify(row._id), row.listenerIds.length]));
}

async function getFollowerCountsBySlug() {
  const rows = await ArtistFollow.aggregate<{ _id: string; count: number }>([
    { $group: { _id: '$artistId', count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [row._id, row.count]));
}

async function getTrackCountsBySlug() {
  const rows = await Song.aggregate<{ _id: string; count: number }>([
    { $group: { _id: '$artist', count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [slugify(row._id), row.count]));
}

async function syncArtistsFromCatalog() {
  const [songArtists, albumArtists] = await Promise.all([
    Song.aggregate<{
      _id: string;
      coverImages: string[];
      genres: string[];
      uploadedByIds: unknown[];
    }>([
      { $match: { artist: { $type: 'string', $ne: '' } } },
      {
        $group: {
          _id: '$artist',
          coverImages: { $addToSet: '$coverImage' },
          genres: { $addToSet: '$genre' },
          uploadedByIds: { $addToSet: '$uploadedBy' },
        },
      },
    ]),
    Album.aggregate<{
      _id: string;
      coverImages: string[];
      genres: string[];
      artistUserIds: unknown[];
      descriptions: string[];
    }>([
      { $match: { artistName: { $type: 'string', $ne: '' } } },
      {
        $group: {
          _id: '$artistName',
          coverImages: { $addToSet: '$coverImage' },
          genres: { $addToSet: '$genre' },
          artistUserIds: { $addToSet: '$artistUserId' },
          descriptions: { $addToSet: '$description' },
        },
      },
    ]),
  ]);

  const bySlug = new Map<
    string,
    {
      name: string;
      image?: string;
      bannerImage?: string;
      genre?: string;
      bio?: string;
      artistUserId?: unknown;
    }
  >();

  const firstNonEmpty = <T>(values: T[], predicate: (value: T) => boolean): T | undefined =>
    values.find(predicate);

  for (const item of songArtists) {
    const name = normalizeString(item._id);
    const slug = slugify(name);
    if (!name || !slug) continue;

    bySlug.set(slug, {
      name,
      image: firstNonEmpty(
        item.coverImages,
        (value) => typeof value === 'string' && value !== 'default-album-cover.jpg'
      ) as string | undefined,
      genre: firstNonEmpty(item.genres, (value) => typeof value === 'string' && value.trim().length > 0) as
        | string
        | undefined,
      artistUserId: firstNonEmpty(item.uploadedByIds, Boolean),
    });
  }

  for (const item of albumArtists) {
    const name = normalizeString(item._id);
    const slug = slugify(name);
    if (!name || !slug) continue;

    const current = bySlug.get(slug);
    const coverImage = firstNonEmpty(
      item.coverImages,
      (value) => typeof value === 'string' && value !== 'default-album-cover.jpg'
    ) as string | undefined;

    bySlug.set(slug, {
      name,
      image: current?.image || coverImage,
      bannerImage: current?.bannerImage || coverImage,
      genre:
        current?.genre ||
        (firstNonEmpty(item.genres, (value) => typeof value === 'string' && value.trim().length > 0) as
          | string
          | undefined),
      bio:
        current?.bio ||
        (firstNonEmpty(
          item.descriptions,
          (value) => typeof value === 'string' && value.trim().length > 0
        ) as string | undefined),
      artistUserId: current?.artistUserId || firstNonEmpty(item.artistUserIds, Boolean),
    });
  }

  await Promise.all(
    Array.from(bySlug.entries()).map(([slug, artist]) =>
      Artist.updateOne(
        { slug },
        {
          $setOnInsert: {
            name: artist.name,
            slug,
            ...(artist.image ? { image: artist.image } : {}),
            ...(artist.bannerImage ? { bannerImage: artist.bannerImage } : {}),
            ...(artist.genre ? { genre: artist.genre } : {}),
            ...(artist.bio ? { bio: artist.bio } : {}),
            ...(artist.artistUserId ? { artistUserId: artist.artistUserId } : {}),
            verified: false,
          },
        },
        { upsert: true }
      )
    )
  );
}

export const artistService = {
  async listArtists() {
    await syncArtistsFromCatalog();

    const [artists, monthlyListenersBySlug, followerCountsBySlug, trackCountsBySlug] =
      await Promise.all([
        Artist.find().sort({ name: 1 }),
        getMonthlyListenersBySlug(),
        getFollowerCountsBySlug(),
        getTrackCountsBySlug(),
      ]);

    return {
      artists: artists.map((artist) => ({
        artist,
        monthlyListeners: monthlyListenersBySlug.get(artist.slug) ?? 0,
        followers: followerCountsBySlug.get(artist.slug) ?? 0,
        trackCount: trackCountsBySlug.get(artist.slug) ?? 0,
      })),
    };
  },

  async getArtistBySlug(slugOrId: string) {
    const slug = slugify(slugOrId);
    const artist =
      slug && !slugOrId.match(/^[a-f\d]{24}$/i)
        ? await Artist.findOne({ slug })
        : await Artist.findById(slugOrId);

    if (!artist) {
      throw new ServiceError(404, 'Artist not found');
    }

    const [monthlyListenersBySlug, followerCountsBySlug, trackCountsBySlug] = await Promise.all([
      getMonthlyListenersBySlug(),
      getFollowerCountsBySlug(),
      getTrackCountsBySlug(),
    ]);

    return {
      artist,
      monthlyListeners: monthlyListenersBySlug.get(artist.slug) ?? 0,
      followers: followerCountsBySlug.get(artist.slug) ?? 0,
      trackCount: trackCountsBySlug.get(artist.slug) ?? 0,
    };
  },

  async createArtist(input: Record<string, unknown>) {
    const name = normalizeString(input.name);
    if (!name) {
      throw new ServiceError(400, 'Artist name is required');
    }

    const slug = normalizeOptionalString(input.slug) ? slugify(String(input.slug)) : slugify(name);
    if (!slug) {
      throw new ServiceError(400, 'Artist slug is required');
    }

    await assertUniqueSlug(slug);

    const artist = await Artist.create({
      name,
      slug,
      image: normalizeOptionalString(input.image),
      bannerImage: normalizeOptionalString(input.bannerImage),
      genre: normalizeOptionalString(input.genre),
      bio: normalizeOptionalString(input.bio),
      verified: Boolean(input.verified),
      ...(normalizeOptionalString(input.artistUserId)
        ? { artistUserId: normalizeOptionalString(input.artistUserId) }
        : {}),
    });

    return { artist };
  },

  async updateArtist(artistId: string, input: Record<string, unknown>) {
    ensureObjectId(artistId, 'artistId');
    const existing = await Artist.findById(artistId);
    if (!existing) {
      throw new ServiceError(404, 'Artist not found');
    }

    const name = normalizeOptionalString(input.name);
    const slugInput = normalizeOptionalString(input.slug);
    const nextSlug = slugInput ? slugify(slugInput) : name ? slugify(name) : existing.slug;
    if (!nextSlug) {
      throw new ServiceError(400, 'Artist slug is required');
    }

    await assertUniqueSlug(nextSlug, artistId);

    const artist = await Artist.findByIdAndUpdate(
      artistId,
      {
        ...(name ? { name } : {}),
        slug: nextSlug,
        ...(input.image !== undefined ? { image: normalizeOptionalString(input.image) } : {}),
        ...(input.bannerImage !== undefined
          ? { bannerImage: normalizeOptionalString(input.bannerImage) }
          : {}),
        ...(input.genre !== undefined ? { genre: normalizeOptionalString(input.genre) } : {}),
        ...(input.bio !== undefined ? { bio: normalizeOptionalString(input.bio) } : {}),
        ...(input.verified !== undefined ? { verified: Boolean(input.verified) } : {}),
        ...(input.artistUserId !== undefined
          ? { artistUserId: normalizeOptionalString(input.artistUserId) }
          : {}),
      },
      { new: true }
    );

    if (!artist) {
      throw new ServiceError(404, 'Artist not found');
    }

    return { artist };
  },

  async deleteArtist(artistId: string) {
    ensureObjectId(artistId, 'artistId');
    const artist = await Artist.findByIdAndDelete(artistId);
    if (!artist) {
      throw new ServiceError(404, 'Artist not found');
    }
  },
};
