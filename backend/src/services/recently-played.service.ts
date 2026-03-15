import { RecentlyPlayed } from '../models/recently-played.model';
import { ensureObjectId } from '../utils/mongoose.utils';

const MAX_HISTORY = 50;

export const recentlyPlayedService = {
  async recordPlay(userId: string, songId: string) {
    ensureObjectId(songId, 'songId');

    // Upsert: update playedAt so the song floats to the top
    await RecentlyPlayed.findOneAndUpdate(
      { userId, songId },
      { playedAt: new Date() },
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
        .limit(limit)
        .populate('songId'),
      RecentlyPlayed.countDocuments({ userId }),
    ]);

    const songs = records.map((r) => ({ song: r.songId, playedAt: r.playedAt }));
    return {
      songs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async clearHistory(userId: string) {
    await RecentlyPlayed.deleteMany({ userId });
  },
};
