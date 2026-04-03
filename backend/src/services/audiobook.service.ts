import fs from 'fs';
import path from 'path';
import * as musicMetadata from 'music-metadata';
import {
  Audiobook,
  AudiobookChapter,
  AudiobookProgress,
  SavedAudiobook,
} from '../models/audiobook.model';
import { ServiceError } from '../types/error/service-error';
import { safeUnlink } from '../utils/file.utils';
import { ensureObjectId } from '../utils/mongoose.utils';
import { parseRangeHeader, toPositiveInt } from '../utils/song.utils';
import type {
  AudiobookChapterUpdateInput,
  AudiobookChapterUploadInput,
  AudiobookCreateInput,
  AudiobookProgressResult,
  AudiobookUpdateInput,
  AudiobookWithChapters,
  StreamAudiobookChapterResult,
  UpdateAudiobookProgressInput,
} from '../types/audiobook/audiobook-service.types';
import { recentlyPlayedService } from './recently-played.service';

async function recalculateAudiobookStats(audiobookId: string) {
  const chapters = await AudiobookChapter.find({ audiobook: audiobookId });
  const totalDuration = chapters.reduce((sum, chapter) => sum + chapter.duration, 0);
  const chapterCount = chapters.length;

  await Audiobook.findByIdAndUpdate(audiobookId, { totalDuration, chapterCount });
}

export const audiobookService = {
  async createAudiobook(input: AudiobookCreateInput) {
    const audiobook = await Audiobook.create({
      title: input.title,
      authorName: input.authorName,
      description: input.description,
      ...(input.coverImage ? { coverImage: input.coverImage } : {}),
      ...(input.genre ? { genre: input.genre } : {}),
      ...(input.publishedAt ? { publishedAt: new Date(input.publishedAt) } : {}),
    });
    return { audiobook };
  },

  async listAudiobooks(userId?: string) {
    const audiobooks = await Audiobook.find().sort({ createdAt: -1 });
    if (!userId) {
      return { audiobooks, savedIds: [], progressByAudiobookId: {} as Record<string, unknown> };
    }

    const [savedRecords, progressRecords] = await Promise.all([
      SavedAudiobook.find({ userId }).select('audiobookId'),
      AudiobookProgress.find({ userId }).select('audiobookId currentChapterId progressSeconds progressPct'),
    ]);

    const savedIds = savedRecords.map((record) => String(record.audiobookId));
    const progressByAudiobookId = Object.fromEntries(
      progressRecords.map((record) => [
        String(record.audiobookId),
        {
          currentChapterId: String(record.currentChapterId),
          progressSeconds: record.progressSeconds,
          progressPct: record.progressPct,
        },
      ])
    );

    return { audiobooks, savedIds, progressByAudiobookId };
  },

  async getAudiobookById(audiobookId: string, userId?: string): Promise<
    AudiobookWithChapters & {
      saved: boolean;
      progress: AudiobookProgressResult['progress'];
    }
  > {
    ensureObjectId(audiobookId, 'audiobookId');
    const audiobook = await Audiobook.findById(audiobookId);
    if (!audiobook) throw new ServiceError(404, 'Audiobook not found');

    const chapters = await AudiobookChapter.find({ audiobook: audiobookId }).sort({ chapterNumber: 1 });

    if (!userId) {
      return { audiobook, chapters, saved: false, progress: null };
    }

    const [saved, progress] = await Promise.all([
      SavedAudiobook.exists({ userId, audiobookId }),
      AudiobookProgress.findOne({ userId, audiobookId }),
    ]);

    return { audiobook, chapters, saved: Boolean(saved), progress };
  },

  async updateAudiobook(audiobookId: string, input: AudiobookUpdateInput) {
    ensureObjectId(audiobookId, 'audiobookId');
    const audiobook = await Audiobook.findById(audiobookId);
    if (!audiobook) throw new ServiceError(404, 'Audiobook not found');

    const updateData: AudiobookUpdateInput = {};
    if (typeof input.title === 'string') updateData.title = input.title.trim();
    if (typeof input.authorName === 'string') updateData.authorName = input.authorName.trim();
    if (typeof input.description === 'string') updateData.description = input.description.trim();
    if (typeof input.genre === 'string') updateData.genre = input.genre.trim();
    if (typeof input.coverImage === 'string') updateData.coverImage = input.coverImage;
    if (typeof input.publishedAt === 'string') updateData.publishedAt = input.publishedAt;

    if (input.coverImage && typeof audiobook.coverImage === 'string' && audiobook.coverImage.startsWith('uploads/')) {
      safeUnlink(audiobook.coverImage);
    }

    const updated = await Audiobook.findByIdAndUpdate(
      audiobookId,
      {
        ...updateData,
        ...(updateData.publishedAt ? { publishedAt: new Date(updateData.publishedAt) } : {}),
      },
      { new: true }
    );
    if (!updated) throw new ServiceError(404, 'Audiobook not found');
    return { audiobook: updated };
  },

  async deleteAudiobook(audiobookId: string) {
    ensureObjectId(audiobookId, 'audiobookId');
    const audiobook = await Audiobook.findByIdAndDelete(audiobookId);
    if (!audiobook) throw new ServiceError(404, 'Audiobook not found');

    if (typeof audiobook.coverImage === 'string' && audiobook.coverImage.startsWith('uploads/')) {
      safeUnlink(audiobook.coverImage);
    }

    const chapters = await AudiobookChapter.find({ audiobook: audiobookId });
    for (const chapter of chapters) {
      safeUnlink(chapter.filePath);
      if (
        typeof chapter.coverImage === 'string' &&
        chapter.coverImage.startsWith('uploads/') &&
        chapter.coverImage !== audiobook.coverImage
      ) {
        safeUnlink(chapter.coverImage);
      }
    }

    await Promise.all([
      AudiobookChapter.deleteMany({ audiobook: audiobookId }),
      SavedAudiobook.deleteMany({ audiobookId }),
      AudiobookProgress.deleteMany({ audiobookId }),
    ]);
  },

  async uploadChapter(input: AudiobookChapterUploadInput) {
    ensureObjectId(input.audiobookId, 'audiobookId');
    const audiobook = await Audiobook.findById(input.audiobookId);
    if (!audiobook) throw new ServiceError(404, 'Audiobook not found');
    if (!input.file) throw new ServiceError(400, 'No audio file uploaded');

    try {
      const metadata = await musicMetadata.parseFile(input.file.path);
      const duration = metadata.format.duration;
      if (!duration) {
        safeUnlink(input.file.path);
        throw new ServiceError(400, 'Could not read audio file duration');
      }

      const chapterNumber = toPositiveInt(input.body.chapterNumber, 1);

      const chapter = await AudiobookChapter.create({
        title:
          input.body.title ||
          path.basename(input.file.originalname, path.extname(input.file.originalname)),
        description: input.body.description,
        audiobook: input.audiobookId,
        filePath: input.file.path,
        coverImage: input.coverImage || audiobook.coverImage,
        duration: Math.round(duration),
        chapterNumber,
        publishedAt: input.body.publishedAt ? new Date(input.body.publishedAt) : new Date(),
      });

      await recalculateAudiobookStats(input.audiobookId);
      return { chapter };
    } catch (error) {
      safeUnlink(input.file.path);
      throw error;
    }
  },

  async getChapterById(chapterId: string) {
    ensureObjectId(chapterId, 'chapterId');
    const chapter = await AudiobookChapter.findById(chapterId).populate('audiobook');
    if (!chapter) throw new ServiceError(404, 'Audiobook chapter not found');
    return { chapter };
  },

  async updateChapter(chapterId: string, input: AudiobookChapterUpdateInput) {
    ensureObjectId(chapterId, 'chapterId');
    const existing = await AudiobookChapter.findById(chapterId);
    if (!existing) throw new ServiceError(404, 'Audiobook chapter not found');

    const updateData: AudiobookChapterUpdateInput = {};
    if (typeof input.title === 'string') updateData.title = input.title.trim();
    if (typeof input.description === 'string') updateData.description = input.description.trim();
    if (typeof input.chapterNumber === 'number') updateData.chapterNumber = input.chapterNumber;
    if (typeof input.publishedAt === 'string') updateData.publishedAt = input.publishedAt;

    if (input.coverImage) {
      updateData.coverImage = input.coverImage;
      if (typeof existing.coverImage === 'string' && existing.coverImage.startsWith('uploads/')) {
        safeUnlink(existing.coverImage);
      }
    }

    if (input.audioFile) {
      try {
        const metadata = await musicMetadata.parseFile(input.audioFile.path);
        const duration = metadata.format.duration;
        if (!duration) {
          safeUnlink(input.audioFile.path);
          throw new ServiceError(400, 'Could not read audio file duration');
        }
        updateData.filePath = input.audioFile.path;
        updateData.duration = Math.round(duration);
        safeUnlink(existing.filePath);
      } catch (error) {
        safeUnlink(input.audioFile.path);
        throw error;
      }
    }

    const chapter = await AudiobookChapter.findByIdAndUpdate(
      chapterId,
      {
        ...updateData,
        ...(updateData.publishedAt ? { publishedAt: new Date(updateData.publishedAt) } : {}),
      },
      { new: true }
    ).populate('audiobook');
    if (!chapter) throw new ServiceError(404, 'Audiobook chapter not found');

    await recalculateAudiobookStats(String(existing.audiobook));
    return { chapter };
  },

  async deleteChapter(chapterId: string) {
    ensureObjectId(chapterId, 'chapterId');
    const chapter = await AudiobookChapter.findByIdAndDelete(chapterId);
    if (!chapter) throw new ServiceError(404, 'Audiobook chapter not found');

    safeUnlink(chapter.filePath);
    if (typeof chapter.coverImage === 'string' && chapter.coverImage.startsWith('uploads/')) {
      safeUnlink(chapter.coverImage);
    }

    await Promise.all([
      AudiobookProgress.deleteMany({ currentChapterId: chapterId }),
      recalculateAudiobookStats(String(chapter.audiobook)),
    ]);
  },

  async streamChapter(
    chapterId: string,
    rangeHeader?: string,
    userId?: string
  ): Promise<StreamAudiobookChapterResult> {
    ensureObjectId(chapterId, 'chapterId');
    const chapter = await AudiobookChapter.findById(chapterId);
    if (!chapter) throw new ServiceError(404, 'Audiobook chapter not found');

    await AudiobookChapter.findByIdAndUpdate(chapterId, { $inc: { plays: 1 } });

    if (userId) {
      recentlyPlayedService
        .recordPlay(userId, {
          itemType: 'audiobook_chapter',
          itemId: chapterId,
          parentId: String(chapter.audiobook),
        })
        .catch(() => {});
    }

    const filePath = path.resolve(chapter.filePath);
    if (!fs.existsSync(filePath)) throw new ServiceError(404, 'Audio file not found');

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
      headers: { 'Content-Length': fileSize, 'Content-Type': 'audio/mpeg' },
      stream: fs.createReadStream(filePath),
    };
  },

  async listSavedAudiobooks(userId: string) {
    const saved = await SavedAudiobook.find({ userId })
      .sort({ savedAt: -1 })
      .populate('audiobookId');
    return { audiobooks: saved.map((record) => record.audiobookId) };
  },

  async saveAudiobook(userId: string, audiobookId: string) {
    ensureObjectId(audiobookId, 'audiobookId');
    const audiobook = await Audiobook.findById(audiobookId);
    if (!audiobook) throw new ServiceError(404, 'Audiobook not found');

    await SavedAudiobook.findOneAndUpdate(
      { userId, audiobookId },
      { savedAt: new Date() },
      { upsert: true }
    );

    return { saved: true };
  },

  async unsaveAudiobook(userId: string, audiobookId: string) {
    ensureObjectId(audiobookId, 'audiobookId');
    await SavedAudiobook.findOneAndDelete({ userId, audiobookId });
    return { saved: false };
  },

  async getProgress(userId: string, audiobookId: string): Promise<AudiobookProgressResult> {
    ensureObjectId(audiobookId, 'audiobookId');
    const progress = await AudiobookProgress.findOne({ userId, audiobookId });
    return { progress };
  },

  async updateProgress(userId: string, input: UpdateAudiobookProgressInput) {
    ensureObjectId(input.audiobookId, 'audiobookId');
    ensureObjectId(input.chapterId, 'chapterId');

    const chapter = await AudiobookChapter.findById(input.chapterId);
    if (!chapter || String(chapter.audiobook) !== input.audiobookId) {
      throw new ServiceError(404, 'Audiobook chapter not found');
    }

    const progressSeconds = Math.max(0, input.progressSeconds);
    const progressPct = Math.max(0, Math.min(1, input.progressPct));

    const progress = await AudiobookProgress.findOneAndUpdate(
      { userId, audiobookId: input.audiobookId },
      {
        currentChapterId: input.chapterId,
        progressSeconds,
        progressPct,
        lastPlayedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return { progress };
  },
};
