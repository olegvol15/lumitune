import { Response } from 'express';
import { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { likesService } from '../services/likes.service';

const getUserId = (req: AuthRequest): string => {
  if (!req.user?._id) throw new ServiceError(401, 'Not authorized');
  return String(req.user._id);
};

export const getLikedSongs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await likesService.getLikedSongs(userId, page, limit);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching liked songs') });
  }
};

export const likeSong = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const result = await likesService.likeSong(userId, String(req.params.songId));
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error liking song') });
  }
};

export const unlikeSong = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const result = await likesService.unlikeSong(userId, String(req.params.songId));
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error unliking song') });
  }
};

export const checkLiked = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const liked = await likesService.isSongLiked(userId, String(req.params.songId));
    return res.status(200).json({ success: true, liked });
  } catch (error) {
    if (error instanceof ServiceError) return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error checking like status') });
  }
};