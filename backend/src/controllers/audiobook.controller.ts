import { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { audiobookService } from '../services/audiobook.service';

const getFileFromField = (req: Request, field: string): Express.Multer.File | undefined => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (!files) return undefined;
  const target = files[field];
  return Array.isArray(target) ? target[0] : undefined;
};

const getUserId = (req: AuthRequest): string | undefined =>
  req.user?._id ? String(req.user._id) : undefined;

export const listAudiobooks = async (req: AuthRequest, res: Response) => {
  try {
    const result = await audiobookService.listAudiobooks(getUserId(req));
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error fetching audiobooks'),
    });
  }
};

export const getAudiobook = async (req: AuthRequest, res: Response) => {
  try {
    const result = await audiobookService.getAudiobookById(String(req.params.id), getUserId(req));
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error fetching audiobook'),
    });
  }
};

export const createAudiobook = async (req: AuthRequest, res: Response) => {
  try {
    const coverFile = getFileFromField(req, 'cover');
    const { audiobook } = await audiobookService.createAudiobook({
      title: req.body.title,
      authorName: req.body.authorName,
      description: req.body.description,
      genre: req.body.genre,
      publishedAt: req.body.publishedAt,
      coverImage: coverFile?.path,
    });
    res.status(201).json({ success: true, audiobook });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error creating audiobook'),
    });
  }
};

export const updateAudiobook = async (req: AuthRequest, res: Response) => {
  try {
    const coverFile = getFileFromField(req, 'cover');
    const { audiobook } = await audiobookService.updateAudiobook(String(req.params.id), {
      ...req.body,
      ...(coverFile?.path ? { coverImage: coverFile.path } : {}),
    });
    res.status(200).json({ success: true, audiobook });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error updating audiobook'),
    });
  }
};

export const deleteAudiobook = async (req: AuthRequest, res: Response) => {
  try {
    await audiobookService.deleteAudiobook(String(req.params.id));
    res.status(200).json({ success: true, message: 'Audiobook deleted' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error deleting audiobook'),
    });
  }
};

export const getAudiobookChapter = async (req: Request, res: Response) => {
  try {
    const { chapter } = await audiobookService.getChapterById(String(req.params.chapterId));
    res.status(200).json({ success: true, chapter });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error fetching audiobook chapter'),
    });
  }
};

export const uploadAudiobookChapter = async (req: AuthRequest, res: Response) => {
  try {
    const audioFile = req.file ?? getFileFromField(req, 'audio');
    const coverFile = getFileFromField(req, 'cover');
    const { chapter } = await audiobookService.uploadChapter({
      file: audioFile,
      coverImage: coverFile?.path,
      body: req.body,
      audiobookId: String(req.params.audiobookId),
    });
    res.status(201).json({ success: true, chapter });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error uploading audiobook chapter'),
    });
  }
};

export const updateAudiobookChapter = async (req: AuthRequest, res: Response) => {
  try {
    const audioFile = req.file ?? getFileFromField(req, 'audio');
    const coverFile = getFileFromField(req, 'cover');
    const { chapter } = await audiobookService.updateChapter(String(req.params.chapterId), {
      ...req.body,
      ...(audioFile ? { audioFile } : {}),
      ...(coverFile?.path ? { coverImage: coverFile.path } : {}),
    });
    res.status(200).json({ success: true, chapter });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error updating audiobook chapter'),
    });
  }
};

export const deleteAudiobookChapter = async (req: AuthRequest, res: Response) => {
  try {
    await audiobookService.deleteChapter(String(req.params.chapterId));
    res.status(200).json({ success: true, message: 'Audiobook chapter deleted' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error deleting audiobook chapter'),
    });
  }
};

export const streamAudiobookChapter = async (req: AuthRequest, res: Response) => {
  try {
    const { statusCode, headers, stream } = await audiobookService.streamChapter(
      String(req.params.chapterId),
      req.headers.range,
      getUserId(req)
    );
    res.writeHead(statusCode, headers);
    stream.pipe(res);
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error streaming audiobook chapter'),
    });
  }
};

export const getSavedAudiobooks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, 'Not authorized');
    const result = await audiobookService.listSavedAudiobooks(userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error fetching saved audiobooks'),
    });
  }
};

export const saveAudiobook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, 'Not authorized');
    const result = await audiobookService.saveAudiobook(userId, String(req.params.audiobookId));
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error saving audiobook'),
    });
  }
};

export const unsaveAudiobook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, 'Not authorized');
    const result = await audiobookService.unsaveAudiobook(userId, String(req.params.audiobookId));
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error removing audiobook from library'),
    });
  }
};

export const getAudiobookProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, 'Not authorized');
    const result = await audiobookService.getProgress(userId, String(req.params.audiobookId));
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error fetching audiobook progress'),
    });
  }
};

export const updateAudiobookProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, 'Not authorized');
    const { progress } = await audiobookService.updateProgress(userId, {
      audiobookId: String(req.params.audiobookId),
      chapterId: String(req.body.chapterId),
      progressSeconds: Number(req.body.progressSeconds ?? 0),
      progressPct: Number(req.body.progressPct ?? 0),
    });
    res.status(200).json({ success: true, progress });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error updating audiobook progress'),
    });
  }
};
