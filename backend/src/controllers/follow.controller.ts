import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { followService } from '../services/follow.service';

const getRequiredUserId = (req: AuthRequest): string => {
  if (!req.user?._id) throw new ServiceError(401, 'Not authorized');
  return String(req.user._id);
};

const getOptionalUserId = (req: AuthRequest): string | undefined =>
  req.user?._id ? String(req.user._id) : undefined;

// POST /api/users/:userId/follow
export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const followerId = getRequiredUserId(req);
    const result = await followService.follow(followerId, String(req.params.userId));
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error following user') });
  }
};

// DELETE /api/users/:userId/follow
export const unfollowUser = async (req: AuthRequest, res: Response) => {
  try {
    const followerId = getRequiredUserId(req);
    const result = await followService.unfollow(followerId, String(req.params.userId));
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error unfollowing user') });
  }
};

// GET /api/users/:userId/follow
export const checkFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const followerId = getRequiredUserId(req);
    const following = await followService.isFollowing(followerId, String(req.params.userId));
    return res.status(200).json({ success: true, following });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error checking follow status') });
  }
};

// GET /api/users/:userId
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const requesterId = getOptionalUserId(req);
    const result = await followService.getUserProfile(String(req.params.userId), requesterId);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching user profile') });
  }
};

// GET /api/users/:userId/followers
export const getFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const requesterId = getOptionalUserId(req);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await followService.getFollowers(String(req.params.userId), requesterId, page, limit);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching followers') });
  }
};

// GET /api/users/:userId/following
export const getFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const requesterId = getOptionalUserId(req);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await followService.getFollowing(String(req.params.userId), requesterId, page, limit);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching following') });
  }
};

// GET /api/users/feed  — songs from artists the authenticated user follows
export const getFollowingFeed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getRequiredUserId(req);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await followService.getFollowingFeed(userId, page, limit);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching feed') });
  }
};

// GET /api/users/following-ids  — lightweight list of IDs for UI state
export const getFollowingIds = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getRequiredUserId(req);
    const ids = await followService.getFollowingIds(userId);
    return res.status(200).json({ success: true, ids });
  } catch (error) {
    if (error instanceof ServiceError)
      return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching following IDs') });
  }
};