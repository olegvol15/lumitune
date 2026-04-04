import { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { albumService } from '../services/album.service';

const getFileFromField = (req: Request, field: string): Express.Multer.File | undefined => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (!files) return undefined;
  const target = files[field];
  return Array.isArray(target) ? target[0] : undefined;
};

const parseTrackIds = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === 'string') {
    if (!value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [value];
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const getUserId = (req: AuthRequest): string | undefined =>
  req.user?._id ? String(req.user._id) : undefined;

export const listAlbums = async (req: AuthRequest, res: Response) => {
  try {
    const result = await albumService.listAlbums(getUserId(req));
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching albums') });
  }
};

export const listOwnAlbums = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, 'Not authorized');
    const result = await albumService.listAlbums(userId, userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching albums') });
  }
};

export const getAlbum = async (req: AuthRequest, res: Response) => {
  try {
    const result = await albumService.getAlbumById(String(req.params.id), getUserId(req));
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching album') });
  }
};

export const createAlbum = async (req: AuthRequest, res: Response) => {
  try {
    const coverFile = getFileFromField(req, 'cover');
    const { album } = await albumService.createAlbum({
      title: req.body.title,
      artistName: req.body.artistName,
      description: req.body.description,
      genre: req.body.genre,
      releaseDate: req.body.releaseDate,
      coverImage: coverFile?.path,
      trackIds: parseTrackIds(req.body.trackIds),
      ownerUserId: getUserId(req),
    });
    res.status(201).json({ success: true, album });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error creating album') });
  }
};

export const updateAlbum = async (req: AuthRequest, res: Response) => {
  try {
    const coverFile = getFileFromField(req, 'cover');
    const { album } = await albumService.updateAlbum(
      String(req.params.id),
      {
        title: req.body.title,
        artistName: req.body.artistName,
        description: req.body.description,
        genre: req.body.genre,
        releaseDate: req.body.releaseDate,
        ...(coverFile?.path ? { coverImage: coverFile.path } : {}),
        ...(req.body.trackIds !== undefined ? { trackIds: parseTrackIds(req.body.trackIds) } : {}),
      },
      getUserId(req)
    );
    res.status(200).json({ success: true, album });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error updating album') });
  }
};

export const deleteAlbum = async (req: AuthRequest, res: Response) => {
  try {
    await albumService.deleteAlbum(String(req.params.id), getUserId(req));
    res.status(200).json({ success: true, message: 'Album deleted' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error deleting album') });
  }
};

export const createAlbumByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const coverFile = getFileFromField(req, 'cover');
    const { album } = await albumService.createAlbum({
      title: req.body.title,
      artistName: req.body.artistName,
      description: req.body.description,
      genre: req.body.genre,
      releaseDate: req.body.releaseDate,
      coverImage: coverFile?.path,
      trackIds: parseTrackIds(req.body.trackIds),
    });
    res.status(201).json({ success: true, album });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error creating album') });
  }
};

export const updateAlbumByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const coverFile = getFileFromField(req, 'cover');
    const { album } = await albumService.updateAlbum(String(req.params.id), {
      title: req.body.title,
      artistName: req.body.artistName,
      description: req.body.description,
      genre: req.body.genre,
      releaseDate: req.body.releaseDate,
      ...(coverFile?.path ? { coverImage: coverFile.path } : {}),
      ...(req.body.trackIds !== undefined ? { trackIds: parseTrackIds(req.body.trackIds) } : {}),
    });
    res.status(200).json({ success: true, album });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error updating album') });
  }
};

export const deleteAlbumByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    await albumService.deleteAlbum(String(req.params.id));
    res.status(200).json({ success: true, message: 'Album deleted' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error deleting album') });
  }
};

export const getSavedAlbums = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, 'Not authorized');
    const result = await albumService.listSavedAlbums(userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching saved albums') });
  }
};

export const saveAlbum = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, 'Not authorized');
    const result = await albumService.saveAlbum(userId, String(req.params.albumId));
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error saving album') });
  }
};

export const unsaveAlbum = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw new ServiceError(401, 'Not authorized');
    const result = await albumService.unsaveAlbum(userId, String(req.params.albumId));
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error removing album from library') });
  }
};
