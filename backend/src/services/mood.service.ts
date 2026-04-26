import { Mood } from '../models/mood.model';
import { Song } from '../models/song.model';
import { ServiceError } from '../types/error/service-error';
import type { MoodUsage } from '../types/mood/mood.types';
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
  const existing = await Mood.findOne({
    name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

  if (existing) {
    throw new ServiceError(409, 'Mood name already exists');
  }
}

async function countByMood() {
  const rows = await Song.aggregate<{ _id: string; count: number }>([
    { $match: { mood: { $type: 'string', $ne: '' } } },
    {
      $group: {
        _id: { $toLower: { $trim: { input: '$mood' } } },
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [row._id, row.count]));
}

export const moodService = {
  async listMoods() {
    const moods = await Mood.find().sort({ name: 1 });
    return { moods };
  },

  async listMoodsWithUsage() {
    const [moods, trackCounts] = await Promise.all([Mood.find().sort({ name: 1 }), countByMood()]);

    return {
      moods: moods.map((mood) => {
        const key = mood.name.trim().toLowerCase();
        const usage: MoodUsage = {
          tracks: trackCounts.get(key) ?? 0,
          total: trackCounts.get(key) ?? 0,
        };

        return { mood, usage };
      }),
    };
  },

  async createMood(input: { name?: unknown }) {
    const name = normalizeName(typeof input.name === 'string' ? input.name : '');
    if (!name) {
      throw new ServiceError(400, 'Mood name is required');
    }
    if (name.length > 100) {
      throw new ServiceError(400, 'Mood name must be 100 characters or fewer');
    }

    const slug = slugify(name);
    if (!slug) {
      throw new ServiceError(400, 'Mood name must include letters or numbers');
    }

    await assertUniqueName(name);

    try {
      const mood = await Mood.create({ name, slug });
      return { mood };
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ServiceError(409, 'Mood name already exists');
      }
      throw error;
    }
  },

  async updateMood(moodId: string, input: { name?: unknown }) {
    ensureObjectId(moodId, 'moodId');
    const name = normalizeName(typeof input.name === 'string' ? input.name : '');
    if (!name) {
      throw new ServiceError(400, 'Mood name is required');
    }
    if (name.length > 100) {
      throw new ServiceError(400, 'Mood name must be 100 characters or fewer');
    }

    const slug = slugify(name);
    if (!slug) {
      throw new ServiceError(400, 'Mood name must include letters or numbers');
    }

    await assertUniqueName(name, moodId);

    try {
      const mood = await Mood.findByIdAndUpdate(moodId, { name, slug }, { new: true });
      if (!mood) {
        throw new ServiceError(404, 'Mood not found');
      }

      return { mood };
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ServiceError(409, 'Mood name already exists');
      }
      throw error;
    }
  },

  async deleteMood(moodId: string) {
    ensureObjectId(moodId, 'moodId');
    const mood = await Mood.findByIdAndDelete(moodId);
    if (!mood) {
      throw new ServiceError(404, 'Mood not found');
    }
  },
};
