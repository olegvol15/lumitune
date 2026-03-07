import fs from 'fs';
import path from 'path';
import * as musicMetadata from 'music-metadata';
import { Song } from '../models/song.model';
import { ServiceError } from '../types/error/service-error';
import { safeUnlink } from '../utils/file.utils';
import { parseRangeHeader, toPositiveInt } from '../utils/song.utils';
import {
  SongListResult,
  SongQueryInput,
  SongUploadInput,
  StreamSongResult,
} from '../types/song/song-service.types';

export const songService = {
  async uploadSong(input: SongUploadInput) {
    const { file, body, uploadedBy } = input;

    if (!uploadedBy) {
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

      const song = await Song.create({
        title: body.title || path.basename(file.originalname, path.extname(file.originalname)),
        artist: body.artist || 'Unknown Artist',
        album: body.album,
        genre: body.genre,
        duration: Math.round(duration),
        filePath: file.path,
        uploadedBy,
      });

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

    const query: Record<string, unknown> = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (genre) {
      query.genre = genre;
    }

    const songs = await Song.find(query)
      .populate('uploadedBy', 'username')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Song.countDocuments(query);

    return {
      songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getSongById(songId: string) {
    const song = await Song.findById(songId).populate('uploadedBy', 'username');
    if (!song) {
      throw new ServiceError(404, 'Song not found');
    }
    return { song };
  },

  async streamSong(songId: string, rangeHeader?: string): Promise<StreamSongResult> {
    const song = await Song.findById(songId);
    if (!song) {
      throw new ServiceError(404, 'Song not found');
    }

    await Song.findByIdAndUpdate(songId, { $inc: { plays: 1 } });

    const filePath = path.resolve(song.filePath);
    if (!fs.existsSync(filePath)) {
      throw new ServiceError(404, 'Audio file not found');
    }

    const fileSize = fs.statSync(filePath).size;
    if (rangeHeader) {
      const { start, end } = parseRangeHeader(rangeHeader, fileSize);
      const chunkSize = end - start + 1;
      return {
        statusCode: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'audio/mpeg',
        },
        stream: fs.createReadStream(filePath, { start, end }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      },
      stream: fs.createReadStream(filePath),
    };
  },
};
