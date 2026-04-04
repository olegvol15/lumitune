import fs from 'fs';
import path from 'path';
import * as musicMetadata from 'music-metadata';
import { Song } from '../models/song.model';
import { Album } from '../models/album.model';
import { ServiceError } from '../types/error/service-error';
import { safeUnlink } from '../utils/file.utils';
import { parseRangeHeader, toPositiveInt } from '../utils/song.utils';
import { recentlyPlayedService } from './recently-played.service';
import { getAudioContentType } from '../utils/upload.utils';
import {
  SongListResult,
  SongQueryInput,
  SongUpdateInput,
  SongUploadInput,
  StreamSongResult,
} from '../types/song/song-service.types';
import { ensureObjectId } from '../utils/mongoose.utils';

async function recalculateAlbumStats(albumId: string) {
  const album = await Album.findById(albumId);
  if (!album) return;

  const tracks = await Song.find({ _id: { $in: album.trackIds } });
  const totalDuration = tracks.reduce((sum, track) => sum + track.duration, 0);

  await Album.findByIdAndUpdate(albumId, {
    trackCount: tracks.length,
    totalDuration,
  });
}

async function syncSongAlbumMembership(
  songId: string,
  nextAlbumId?: string,
  previousAlbumId?: string
) {
  if (previousAlbumId && previousAlbumId !== nextAlbumId) {
    await Album.findByIdAndUpdate(previousAlbumId, { $pull: { trackIds: songId } });
    await recalculateAlbumStats(previousAlbumId);
  }

  if (nextAlbumId) {
    const album = await Album.findById(nextAlbumId);
    if (!album) {
      throw new ServiceError(404, 'Album not found');
    }

    await Album.updateMany(
      { _id: { $ne: nextAlbumId }, trackIds: songId },
      { $pull: { trackIds: songId } }
    );
    await Album.findByIdAndUpdate(nextAlbumId, { $addToSet: { trackIds: songId } });
    await recalculateAlbumStats(nextAlbumId);

    return album;
  }

  return null;
}

export const songService = {
  async uploadSong(input: SongUploadInput) {
    const { file, body, uploadedBy, allowEmptyUploader, coverImage } = input;

    if (!uploadedBy && !allowEmptyUploader) {
      throw new ServiceError(401, 'Not authorized to access this route');
    }

    if (!file) {
      throw new ServiceError(400, 'No file uploaded');
    }

    try {
      const metadata = await musicMetadata.parseFile(file.path);
      const duration = metadata.format.duration;
      if (!duration) {
        safeUnlink(file.path);
        throw new ServiceError(400, 'Could not read audio file duration');
      }

      const nextAlbumId = input.body.albumId?.trim();
      const album = nextAlbumId ? await Album.findById(nextAlbumId) : null;
      if (nextAlbumId && !album) {
        safeUnlink(file.path);
        throw new ServiceError(404, 'Album not found');
      }

      const song = await Song.create({
        title: body.title || path.basename(file.originalname, path.extname(file.originalname)),
        artist: body.artist || 'Unknown Artist',
        album: album?.title || body.album,
        ...(nextAlbumId ? { albumId: nextAlbumId } : {}),
        genre: body.genre,
        coverImage: coverImage || body.coverImage,
        duration: Math.round(duration),
        filePath: file.path,
        ...(uploadedBy ? { uploadedBy } : {}),
      });

      if (nextAlbumId) {
        await syncSongAlbumMembership(String(song._id), nextAlbumId);
      }

      return { song };
    } catch (error) {
      safeUnlink(file.path);
      throw error;
    }
  },

  async listSongs(input: SongQueryInput): Promise<SongListResult> {
    const page = toPositiveInt(input.page, 1);
    const limit = toPositiveInt(input.limit, 20);
    const search = typeof input.search === 'string' ? input.search : undefined;
    const genre = typeof input.genre === 'string' ? input.genre : undefined;
    const uploadedBy = typeof input.uploadedBy === 'string' ? input.uploadedBy : undefined;

    const query: Record<string, unknown> = {};
    if (search) query.$text = { $search: search };
    if (genre) query.genre = genre;
    if (uploadedBy) {
      ensureObjectId(uploadedBy, 'uploadedBy');
      query.uploadedBy = uploadedBy;
    }

    const songs = await Song.find(query)
      .populate('uploadedBy', 'username')
      .populate('albumId', 'title artistName coverImage')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Song.countDocuments(query);

    return {
      songs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  async getSongById(songId: string) {
    ensureObjectId(songId, 'songId');
    const song = await Song.findById(songId)
      .populate('uploadedBy', 'username')
      .populate('albumId', 'title artistName coverImage');
    if (!song) throw new ServiceError(404, 'Song not found');
    return { song };
  },

  async updateSong(songId: string, input: SongUpdateInput) {
    ensureObjectId(songId, 'songId');

    const updateData: SongUpdateInput = {};
    const albumIdProvided = Object.prototype.hasOwnProperty.call(input, 'albumId');
    if (typeof input.title === 'string') updateData.title = input.title.trim();
    if (typeof input.artist === 'string') updateData.artist = input.artist.trim();
    if (typeof input.album === 'string') updateData.album = input.album.trim();
    if (albumIdProvided && typeof input.albumId === 'string') {
      updateData.albumId = input.albumId.trim();
    }
    if (typeof input.genre === 'string') updateData.genre = input.genre.trim();
    if (typeof input.coverImage === 'string') updateData.coverImage = input.coverImage.trim();

    if (updateData.title !== undefined && updateData.title.length === 0) {
      throw new ServiceError(400, 'Song title cannot be empty');
    }
    if (updateData.artist !== undefined && updateData.artist.length === 0) {
      throw new ServiceError(400, 'Artist name cannot be empty');
    }

    const existingSong = await Song.findById(songId);
    if (!existingSong) throw new ServiceError(404, 'Song not found');
    const previousAlbumId = existingSong.albumId ? String(existingSong.albumId) : undefined;

    let nextAudioPath: string | undefined;
    if (input.audioFile) {
      try {
        const metadata = await musicMetadata.parseFile(input.audioFile.path);
        const duration = metadata.format.duration;
        if (!duration) {
          safeUnlink(input.audioFile.path);
          throw new ServiceError(400, 'Could not read audio file duration');
        }

        updateData.audioFile = undefined;
        updateData.filePath = input.audioFile.path;
        updateData.duration = Math.round(duration);
        nextAudioPath = input.audioFile.path;
      } catch (error) {
        safeUnlink(input.audioFile.path);
        throw error;
      }
    }

    let nextAlbumId = previousAlbumId;
    if (albumIdProvided) {
      nextAlbumId = updateData.albumId || undefined;
    }

    if (updateData.title !== undefined) existingSong.title = updateData.title;
    if (updateData.artist !== undefined) existingSong.artist = updateData.artist;
    if (updateData.genre !== undefined) existingSong.genre = updateData.genre;
    if (updateData.coverImage !== undefined) existingSong.coverImage = updateData.coverImage;
    if (updateData.filePath !== undefined) existingSong.filePath = updateData.filePath;
    if (updateData.duration !== undefined) existingSong.duration = updateData.duration;

    if (albumIdProvided) {
      if (nextAlbumId) {
        const album = await Album.findById(nextAlbumId);
        if (!album) throw new ServiceError(404, 'Album not found');
        existingSong.albumId = album._id;
        existingSong.album = album.title;
      } else {
        existingSong.albumId = undefined;
      }
    } else if (updateData.album !== undefined) {
      existingSong.album = updateData.album;
    }

    const song = await existingSong.save();
    await song.populate('uploadedBy', 'username');
    await song.populate('albumId', 'title artistName coverImage');

    if (previousAlbumId !== nextAlbumId) {
      await syncSongAlbumMembership(songId, nextAlbumId, previousAlbumId);
    } else if (nextAlbumId) {
      await recalculateAlbumStats(nextAlbumId);
    }

    if (
      typeof updateData.coverImage === 'string' &&
      updateData.coverImage !== existingSong.coverImage &&
      typeof existingSong.coverImage === 'string' &&
      existingSong.coverImage.startsWith('uploads/')
    ) {
      safeUnlink(existingSong.coverImage);
    }

    if (
      nextAudioPath &&
      typeof existingSong.filePath === 'string' &&
      existingSong.filePath !== nextAudioPath
    ) {
      safeUnlink(existingSong.filePath);
    }

    return { song };
  },

  async updateSongForUploader(songId: string, userId: string | undefined, input: SongUpdateInput) {
    if (!userId) {
      throw new ServiceError(401, 'Not authorized to access this route');
    }

    ensureObjectId(songId, 'songId');
    const existingSong = await Song.findById(songId);
    if (!existingSong) {
      throw new ServiceError(404, 'Song not found');
    }

    if (String(existingSong.uploadedBy) !== userId) {
      throw new ServiceError(403, 'You can only edit your own tracks');
    }

    return this.updateSong(songId, input);
  },

  async deleteSong(songId: string) {
    ensureObjectId(songId, 'songId');

    const song = await Song.findByIdAndDelete(songId);
    if (!song) throw new ServiceError(404, 'Song not found');

    if (song.albumId) {
      await Album.findByIdAndUpdate(String(song.albumId), { $pull: { trackIds: song._id } });
      await recalculateAlbumStats(String(song.albumId));
    }

    safeUnlink(song.filePath);
    if (typeof song.coverImage === 'string' && song.coverImage.startsWith('uploads/')) {
      safeUnlink(song.coverImage);
    }
  },

  async streamSong(
    songId: string,
    rangeHeader?: string,
    userId?: string
  ): Promise<StreamSongResult> {
    ensureObjectId(songId, 'songId');

    const song = await Song.findById(songId);
    if (!song) throw new ServiceError(404, 'Song not found');

    await Song.findByIdAndUpdate(songId, { $inc: { plays: 1 } });

    // Record in recently played if a user is authenticated
    if (userId) {
      recentlyPlayedService.recordPlay(userId, songId).catch(() => {});
    }

    const filePath = path.resolve(song.filePath);
    if (!fs.existsSync(filePath)) throw new ServiceError(404, 'Audio file not found');

    const fileSize = fs.statSync(filePath).size;
    const contentType = getAudioContentType(filePath);

    if (rangeHeader) {
      const { start, end } = parseRangeHeader(rangeHeader, fileSize);
      const chunkSize = end - start + 1;
      return {
        statusCode: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType,
        },
        stream: fs.createReadStream(filePath, { start, end }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Length': fileSize, 'Content-Type': contentType },
      stream: fs.createReadStream(filePath),
    };
  },
};
