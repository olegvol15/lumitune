import { LikedSong } from '../models/liked-song.model';
import { Song } from '../models/song.model';
import { ServiceError } from '../types/error/service-error';
import { ensureObjectId } from '../utils/mongoose.utils';

export const likesService = {
  async getLikedSongs(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      LikedSong.find({ userId }).sort({ likedAt: -1 }).skip(skip).limit(limit).populate('songId'),
      LikedSong.countDocuments({ userId }),
    ]);

    const songs = records.map((r) => r.songId);
    return {
      songs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async likeSong(userId: string, songId: string) {
    ensureObjectId(songId, 'songId');

    const song = await Song.findById(songId);
    if (!song) {
      throw new ServiceError(404, 'Song not found');
    }

    await LikedSong.findOneAndUpdate({ userId, songId }, { likedAt: new Date() }, { upsert: true });

    return { liked: true };
  },

  async unlikeSong(userId: string, songId: string) {
    ensureObjectId(songId, 'songId');

    await LikedSong.findOneAndDelete({ userId, songId });
    return { liked: false };
  },

  async isSongLiked(userId: string, songId: string): Promise<boolean> {
    ensureObjectId(songId, 'songId');
    const exists = await LikedSong.exists({ userId, songId });
    return Boolean(exists);
  },
};
