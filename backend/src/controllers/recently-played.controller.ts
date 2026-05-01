import { Response } from 'express';
import { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { recentlyPlayedService } from '../services/recently-played.service';

const getUserId = (req: AuthRequest): string => {
  if (!req.user?._id) throw new ServiceError(401, 'Not authorized');
  return String(req.user._id);
};

export const recordRecentlyPlayed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const { itemType, itemId, parentId } = (req.body ?? {}) as {
      itemType?: 'song' | 'podcast_episode' | 'audiobook_chapter';
      itemId?: string;
      parentId?: string;
    };

    if (!itemType || !itemId) {
      throw new ServiceError(400, 'itemType and itemId are required');
    }

    if (!['song', 'podcast_episode', 'audiobook_chapter'].includes(itemType)) {
      throw new ServiceError(400, 'Invalid recently played item type');
    }

    if (itemType !== 'song' && !parentId) {
      throw new ServiceError(400, 'parentId is required for this item type');
    }

    try {
      await recentlyPlayedService.recordPlay(userId, { itemType, itemId, parentId });
    } catch {
      // Recently played should never break playback. Stale ids or local-only media are ignored.
    }

    return res.status(201).json({ success: true });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error recording history') });
  }
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
