import { Response } from 'express';
import { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { artistFollowService } from '../services/artist-follow.service';

const getRequiredUserId = (req: AuthRequest): string => {
  if (!req.user?._id) throw new ServiceError(401, 'Not authorized');
  return String(req.user._id);
};

const getOptionalUserId = (req: AuthRequest): string | undefined =>
  req.user?._id ? String(req.user._id) : undefined;

export const getArtistFollowStatus = async (req: AuthRequest, res: Response) => {
  try {
    const result = await artistFollowService.getStatus(getOptionalUserId(req), req.params.artistId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching artist follow status') });
  }
};

export const followArtist = async (req: AuthRequest, res: Response) => {
  try {
    const result = await artistFollowService.follow(getRequiredUserId(req), {
      ...req.body,
      artistId: req.params.artistId,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error following artist') });
  }
};

export const unfollowArtist = async (req: AuthRequest, res: Response) => {
  try {
    const result = await artistFollowService.unfollow(getRequiredUserId(req), req.params.artistId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error unfollowing artist') });
  }
};

export const getFollowedArtists = async (req: AuthRequest, res: Response) => {
  try {
    const result = await artistFollowService.listMine(getRequiredUserId(req));
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching followed artists') });
  }
};
