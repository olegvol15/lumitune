import { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { podcastService } from '../services/podcast.service';

const getFileFromField = (req: Request, field: string): Express.Multer.File | undefined => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (!files) return undefined;
  const target = files[field];
  return Array.isArray(target) ? target[0] : undefined;
};

export const listPodcasts = async (_req: Request, res: Response) => {
  try {
    const { podcasts } = await podcastService.listPodcasts();
    res.status(200).json({ success: true, podcasts });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching podcasts') });
  }
};

export const getPodcast = async (req: Request, res: Response) => {
  try {
    const { podcast, episodes } = await podcastService.getPodcastById(String(req.params.id));
    res.status(200).json({ success: true, podcast, episodes });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching podcast') });
  }
};

export const createPodcast = async (req: AuthRequest, res: Response) => {
  try {
    const coverFile = getFileFromField(req, 'cover');
    const { podcast } = await podcastService.createPodcast({
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      category: req.body.category,
      coverImage: coverFile?.path,
    });
    res.status(201).json({ success: true, podcast });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error creating podcast') });
  }
};

export const updatePodcast = async (req: AuthRequest, res: Response) => {
  try {
    const coverFile = getFileFromField(req, 'cover');
    const { podcast } = await podcastService.updatePodcast(String(req.params.id), {
      ...req.body,
      ...(coverFile?.path ? { coverImage: coverFile.path } : {}),
    });
    res.status(200).json({ success: true, podcast });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error updating podcast') });
  }
};

export const deletePodcast = async (req: AuthRequest, res: Response) => {
  try {
    await podcastService.deletePodcast(String(req.params.id));
    res.status(200).json({ success: true, message: 'Podcast deleted' });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error deleting podcast') });
  }
};

export const getEpisode = async (req: Request, res: Response) => {
  try {
    const { episode } = await podcastService.getEpisodeById(String(req.params.episodeId));
    res.status(200).json({ success: true, episode });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching episode') });
  }
};

export const streamEpisode = async (req: Request, res: Response) => {
  try {
    const { statusCode, headers, stream } = await podcastService.streamEpisode(
      String(req.params.episodeId),
      req.headers.range
    );
    res.writeHead(statusCode, headers);
    stream.pipe(res);
  } catch (error) {
    if (error instanceof ServiceError) {
      console.warn(`Podcast episode stream failed: ${req.params.episodeId} - ${error.message}`);
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error streaming episode') });
  }
};

export const uploadEpisode = async (req: AuthRequest, res: Response) => {
  try {
    const audioFile = req.file ?? getFileFromField(req, 'audio');
    const coverFile = getFileFromField(req, 'cover');
    const { episode } = await podcastService.uploadEpisode({
      file: audioFile,
      coverImage: coverFile?.path,
      body: req.body,
      podcastId: String(req.params.podcastId),
    });
    res.status(201).json({ success: true, episode });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error uploading episode') });
  }
};

export const updateEpisode = async (req: AuthRequest, res: Response) => {
  try {
    const audioFile = req.file ?? getFileFromField(req, 'audio');
    const coverFile = getFileFromField(req, 'cover');
    const { episode } = await podcastService.updateEpisode(String(req.params.episodeId), {
      ...req.body,
      ...(audioFile ? { audioFile } : {}),
      ...(coverFile?.path ? { coverImage: coverFile.path } : {}),
    });
    res.status(200).json({ success: true, episode });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error updating episode') });
  }
};

export const deleteEpisode = async (req: AuthRequest, res: Response) => {
  try {
    await podcastService.deleteEpisode(String(req.params.episodeId));
    res.status(200).json({ success: true, message: 'Episode deleted' });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error deleting episode') });
  }
};
