import fs from 'fs';
import path from 'path';
import * as musicMetadata from 'music-metadata';
import { Podcast } from '../models/podcast.model';
import { Episode } from '../models/episode.model';
import { ServiceError } from '../types/error/service-error';
import { safeUnlink } from '../utils/file.utils';
import { parseRangeHeader, toPositiveInt } from '../utils/song.utils';
import { ensureObjectId } from '../utils/mongoose.utils';
import { getAudioContentType } from '../utils/upload.utils';
import type {
  PodcastCreateInput,
  PodcastUpdateInput,
  EpisodeUploadInput,
  EpisodeUpdateInput,
  PodcastWithEpisodes,
  StreamEpisodeResult,
} from '../types/podcast/podcast-service.types';

export const podcastService = {
  async createPodcast(input: PodcastCreateInput) {
    const podcast = await Podcast.create({
      title: input.title,
      author: input.author,
      description: input.description,
      ...(input.coverImage ? { coverImage: input.coverImage } : {}),
      ...(input.category ? { category: input.category } : {}),
    });
    return { podcast };
  },

  async listPodcasts() {
    const podcasts = await Podcast.find().sort({ createdAt: -1 });
    return { podcasts };
  },

  async getPodcastById(podcastId: string): Promise<PodcastWithEpisodes> {
    ensureObjectId(podcastId, 'podcastId');
    const podcast = await Podcast.findById(podcastId);
    if (!podcast) throw new ServiceError(404, 'Podcast not found');
    const episodes = await Episode.find({ podcast: podcastId }).sort({ episodeNumber: 1 });
    return { podcast, episodes };
  },

  async updatePodcast(podcastId: string, input: PodcastUpdateInput) {
    ensureObjectId(podcastId, 'podcastId');
    const podcast = await Podcast.findById(podcastId);
    if (!podcast) throw new ServiceError(404, 'Podcast not found');

    const updateData: PodcastUpdateInput = {};
    if (typeof input.title === 'string') updateData.title = input.title.trim();
    if (typeof input.author === 'string') updateData.author = input.author.trim();
    if (typeof input.description === 'string') updateData.description = input.description.trim();
    if (typeof input.category === 'string') updateData.category = input.category.trim();

    if (input.coverImage) {
      updateData.coverImage = input.coverImage;
      if (
        typeof podcast.coverImage === 'string' &&
        podcast.coverImage.startsWith('uploads/')
      ) {
        safeUnlink(podcast.coverImage);
      }
    }

    const updated = await Podcast.findByIdAndUpdate(podcastId, updateData, { new: true });
    if (!updated) throw new ServiceError(404, 'Podcast not found');
    return { podcast: updated };
  },

  async deletePodcast(podcastId: string) {
    ensureObjectId(podcastId, 'podcastId');
    const podcast = await Podcast.findByIdAndDelete(podcastId);
    if (!podcast) throw new ServiceError(404, 'Podcast not found');

    if (typeof podcast.coverImage === 'string' && podcast.coverImage.startsWith('uploads/')) {
      safeUnlink(podcast.coverImage);
    }

    const episodes = await Episode.find({ podcast: podcastId });
    for (const ep of episodes) {
      safeUnlink(ep.filePath);
      if (typeof ep.coverImage === 'string' && ep.coverImage.startsWith('uploads/')) {
        safeUnlink(ep.coverImage);
      }
    }
    await Episode.deleteMany({ podcast: podcastId });
  },

  async uploadEpisode(input: EpisodeUploadInput) {
    ensureObjectId(input.podcastId, 'podcastId');
    const podcast = await Podcast.findById(input.podcastId);
    if (!podcast) throw new ServiceError(404, 'Podcast not found');

    if (!input.file) throw new ServiceError(400, 'No audio file uploaded');

    try {
      const metadata = await musicMetadata.parseFile(input.file.path);
      const duration = metadata.format.duration;
      if (!duration) {
        safeUnlink(input.file.path);
        throw new ServiceError(400, 'Could not read audio file duration');
      }

      const episodeNumber = toPositiveInt(input.body.episodeNumber, 1);

      const episode = await Episode.create({
        title:
          input.body.title ||
          path.basename(input.file.originalname, path.extname(input.file.originalname)),
        description: input.body.description,
        podcast: input.podcastId,
        filePath: input.file.path,
        coverImage: input.coverImage || podcast.coverImage,
        duration: Math.round(duration),
        episodeNumber,
        publishedAt: input.body.publishedAt ? new Date(input.body.publishedAt) : new Date(),
      });

      return { episode };
    } catch (error) {
      safeUnlink(input.file.path);
      throw error;
    }
  },

  async getEpisodeById(episodeId: string) {
    ensureObjectId(episodeId, 'episodeId');
    const episode = await Episode.findById(episodeId).populate('podcast');
    if (!episode) throw new ServiceError(404, 'Episode not found');
    return { episode };
  },

  async updateEpisode(episodeId: string, input: EpisodeUpdateInput) {
    ensureObjectId(episodeId, 'episodeId');
    const existing = await Episode.findById(episodeId);
    if (!existing) throw new ServiceError(404, 'Episode not found');

    const updateData: EpisodeUpdateInput = {};
    if (typeof input.title === 'string') updateData.title = input.title.trim();
    if (typeof input.description === 'string') updateData.description = input.description.trim();
    if (typeof input.episodeNumber === 'number') updateData.episodeNumber = input.episodeNumber;

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

    const episode = await Episode.findByIdAndUpdate(episodeId, updateData, { new: true }).populate(
      'podcast'
    );
    if (!episode) throw new ServiceError(404, 'Episode not found');
    return { episode };
  },

  async deleteEpisode(episodeId: string) {
    ensureObjectId(episodeId, 'episodeId');
    const episode = await Episode.findByIdAndDelete(episodeId);
    if (!episode) throw new ServiceError(404, 'Episode not found');
    safeUnlink(episode.filePath);
    if (typeof episode.coverImage === 'string' && episode.coverImage.startsWith('uploads/')) {
      safeUnlink(episode.coverImage);
    }
  },

  async streamEpisode(
    episodeId: string,
    rangeHeader?: string
  ): Promise<StreamEpisodeResult> {
    ensureObjectId(episodeId, 'episodeId');
    const episode = await Episode.findById(episodeId);
    if (!episode) throw new ServiceError(404, 'Episode not found');

    await Episode.findByIdAndUpdate(episodeId, { $inc: { plays: 1 } });

    const filePath = path.resolve(episode.filePath);
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
