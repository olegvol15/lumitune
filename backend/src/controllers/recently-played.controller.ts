import { Response } from 'express';
import { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { recentlyPlayedService } from '../services/recently-played.service';

const getUserId = (req: AuthRequest): string => {
  if (!req.user?._id) throw new ServiceError(401, 'Not authorized');
  return String(req.user._id);
};

export const getRecentlyPlayed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await recentlyPlayedService.getHistory(userId, page, limit);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error fetching history') });
  }
};

export const clearRecentlyPlayed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    await recentlyPlayedService.clearHistory(userId);
    return res.status(200).json({ success: true, message: 'Listening history cleared' });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error clearing history') });
  }
};
