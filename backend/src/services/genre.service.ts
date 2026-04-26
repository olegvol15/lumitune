import { Album } from '../models/album.model';
import { Audiobook } from '../models/audiobook.model';
import { Genre } from '../models/genre.model';
import { Song } from '../models/song.model';
import { ServiceError } from '../types/error/service-error';
import type { GenreUsage } from '../types/genre/genre.types';
import { ensureObjectId } from '../utils/mongoose.utils';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeName = (value: string): string => value.trim().replace(/\s+/g, ' ');

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function assertUniqueName(name: string, excludeId?: string) {
  const existing = await Genre.findOne({
    name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

  if (existing) {
    throw new ServiceError(409, 'Genre name already exists');
  }
}

async function countByGenre(model: typeof Song | typeof Album | typeof Audiobook) {
  const rows = await model.aggregate<{ _id: string; count: number }>([
    { $match: { genre: { $type: 'string', $ne: '' } } },
    {
      $group: {
        _id: { $toLower: { $trim: { input: '$genre' } } },
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [row._id, row.count]));
}

export const genreService = {
  async listGenres() {
    const [genres, trackCounts, albumCounts, audiobookCounts] = await Promise.all([
      Genre.find().sort({ name: 1 }),
      countByGenre(Song),
      countByGenre(Album),
      countByGenre(Audiobook),
    ]);

    return {
      genres: genres.map((genre) => {
        const key = genre.name.trim().toLowerCase();
        const usage: GenreUsage = {
          tracks: trackCounts.get(key) ?? 0,
          albums: albumCounts.get(key) ?? 0,
          audiobooks: audiobookCounts.get(key) ?? 0,
          total: (trackCounts.get(key) ?? 0) + (albumCounts.get(key) ?? 0) + (audiobookCounts.get(key) ?? 0),
        };

        return { genre, usage };
      }),
    };
  },

  async createGenre(input: { name?: unknown }) {
    const name = normalizeName(typeof input.name === 'string' ? input.name : '');
    if (!name) {
      throw new ServiceError(400, 'Genre name is required');
    }
    if (name.length > 100) {
      throw new ServiceError(400, 'Genre name must be 100 characters or fewer');
    }

    const slug = slugify(name);
    if (!slug) {
      throw new ServiceError(400, 'Genre name must include letters or numbers');
    }

    await assertUniqueName(name);

    try {
      const genre = await Genre.create({ name, slug });
      return { genre };
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ServiceError(409, 'Genre name already exists');
      }
      throw error;
    }
  },

  async updateGenre(genreId: string, input: { name?: unknown }) {
    ensureObjectId(genreId, 'genreId');
    const name = normalizeName(typeof input.name === 'string' ? input.name : '');
    if (!name) {
      throw new ServiceError(400, 'Genre name is required');
    }
    if (name.length > 100) {
      throw new ServiceError(400, 'Genre name must be 100 characters or fewer');
    }

    const slug = slugify(name);
    if (!slug) {
      throw new ServiceError(400, 'Genre name must include letters or numbers');
    }

    await assertUniqueName(name, genreId);

    try {
      const genre = await Genre.findByIdAndUpdate(genreId, { name, slug }, { new: true });
      if (!genre) {
        throw new ServiceError(404, 'Genre not found');
      }

      return { genre };
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ServiceError(409, 'Genre name already exists');
      }
      throw error;
    }
  },

  async deleteGenre(genreId: string) {
    ensureObjectId(genreId, 'genreId');
    const genre = await Genre.findByIdAndDelete(genreId);
    if (!genre) {
      throw new ServiceError(404, 'Genre not found');
    }
  },
};
