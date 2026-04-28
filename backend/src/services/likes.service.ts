import mongoose from 'mongoose';
import { LikedSong } from '../models/liked-song.model';
import { Song } from '../models/song.model';
import { ServiceError } from '../types/error/service-error';
import { ensureObjectId } from '../utils/mongoose.utils';

const objectIdCandidates = (value: string) => {
  if (!mongoose.Types.ObjectId.isValid(value)) return [value];
  return [value, new mongoose.Types.ObjectId(value)];
};

const likedSongUserFilter = (userId: string) => ({
  $or: [
    { userId: { $in: objectIdCandidates(userId) } },
    { user: { $in: objectIdCandidates(userId) } },
  ],
});

const likedSongRecordFilter = (userId: string, songId: string) => ({
  $and: [
    likedSongUserFilter(userId),
    {
      $or: [
        { songId: { $in: objectIdCandidates(songId) } },
        { song: { $in: objectIdCandidates(songId) } },
      ],
    },
  ],
});

const getRecordSongId = (record: { songId?: unknown; song?: unknown }): string | null => {
  const value = record.songId ?? record.song;
  if (!value) return null;

  if (typeof value === 'object' && '_id' in value && value._id) {
    return String(value._id);
  }

  return String(value);
};

export const likesService = {
  async getLikedSongs(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const filter = likedSongUserFilter(userId);
    const [records, total] = await Promise.all([
      LikedSong.find(filter).sort({ likedAt: -1 }).skip(skip).limit(limit).lean(),
      LikedSong.countDocuments(filter),
    ]);

    const songIds = records.map(getRecordSongId).filter((songId): songId is string => Boolean(songId));
    const songsById = new Map(
      (await Song.find({ _id: { $in: songIds } })
        .populate('uploadedBy', 'username')
        .populate('albumId', 'title artistName coverImage')).map((song) => [String(song._id), song])
    );

    const songs = songIds.map((songId) => songsById.get(songId)).filter(Boolean);
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

    const existing = await LikedSong.findOne(likedSongRecordFilter(userId, songId));

    if (existing) {
      existing.userId = new mongoose.Types.ObjectId(userId);
      existing.songId = new mongoose.Types.ObjectId(songId);
      existing.likedAt = new Date();
      await existing.save();
    } else {
      await LikedSong.create({ userId, songId, likedAt: new Date() });
    }

    return { liked: true };
  },

  async unlikeSong(userId: string, songId: string) {
    ensureObjectId(songId, 'songId');

    await LikedSong.deleteMany(likedSongRecordFilter(userId, songId));
    return { liked: false };
  },

  async isSongLiked(userId: string, songId: string): Promise<boolean> {
    ensureObjectId(songId, 'songId');
    const exists = await LikedSong.exists(likedSongRecordFilter(userId, songId));
    return Boolean(exists);
  },
};
