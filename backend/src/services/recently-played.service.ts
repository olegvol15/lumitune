import { RecentlyPlayed } from '../models/recently-played.model';
import { Song } from '../models/song.model';
import { Audiobook } from '../models/audiobook.model';
import { ensureObjectId } from '../utils/mongoose.utils';

const MAX_HISTORY = 50;

interface RecordPlayInput {
  itemType: 'song' | 'audiobook_chapter';
  itemId: string;
  parentId?: string;
}

export const recentlyPlayedService = {
  async recordPlay(userId: string, input: string | RecordPlayInput) {
    const normalized =
      typeof input === 'string' ? { itemType: 'song' as const, itemId: input } : input;

    ensureObjectId(normalized.itemId, 'itemId');
    if (normalized.parentId) {
      ensureObjectId(normalized.parentId, 'parentId');
    }

    // Upsert: update playedAt so the song floats to the top
    await RecentlyPlayed.findOneAndUpdate(
      { userId, itemType: normalized.itemType, itemId: normalized.itemId },
      {
        playedAt: new Date(),
        ...(normalized.parentId ? { parentId: normalized.parentId } : {}),
      },
      { upsert: true }
    );

    // Cap history at MAX_HISTORY entries per user
    const count = await RecentlyPlayed.countDocuments({ userId });
    if (count > MAX_HISTORY) {
      const oldest = await RecentlyPlayed.find({ userId })
        .sort({ playedAt: 1 })
        .limit(count - MAX_HISTORY)
        .select('_id');
      await RecentlyPlayed.deleteMany({ _id: { $in: oldest.map((d) => d._id) } });
    }
  },

  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      RecentlyPlayed.find({ userId })
        .sort({ playedAt: -1 })
        .skip(skip)
        .limit(limit),
      RecentlyPlayed.countDocuments({ userId }),
    ]);

    const itemIdsByType = {
      songs: records.filter((r) => r.itemType === 'song').map((r) => String(r.itemId)),
      audiobookIds: records
        .filter((r) => r.itemType === 'audiobook_chapter' && r.parentId)
        .map((r) => String(r.parentId)),
    };

    const [songs, audiobooks] = await Promise.all([
      Song.find({ _id: { $in: itemIdsByType.songs } }),
      Audiobook.find({ _id: { $in: itemIdsByType.audiobookIds } }),
    ]);

    const songMap = new Map(songs.map((song) => [String(song._id), song]));
    const audiobookMap = new Map(audiobooks.map((audiobook) => [String(audiobook._id), audiobook]));

    const items = records
      .map((record) => {
        if (record.itemType === 'song') {
          const song = songMap.get(String(record.itemId));
          if (!song) return null;
          return { type: 'song', song, playedAt: record.playedAt };
        }

        const audiobook = record.parentId ? audiobookMap.get(String(record.parentId)) : null;
        if (!audiobook) return null;
        return {
          type: 'audiobook',
          audiobook,
          chapterId: String(record.itemId),
          playedAt: record.playedAt,
        };
      })
      .filter(Boolean);

    return {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async clearHistory(userId: string) {
    await RecentlyPlayed.deleteMany({ userId });
  },
};
