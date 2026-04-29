import { Follow } from '../models/follow.model';
import { User } from '../models/user.model';
import { Song } from '../models/song.model';
import { ServiceError } from '../types/error/service-error';
import { ensureObjectId } from '../utils/mongoose.utils';

export const followService = {
  /**
   * Follow a user. Throws if:
   * - targetId is invalid
   * - target user does not exist
   * - follower tries to follow themselves
   * - already following
   */
  async follow(followerId: string, targetId: string) {
    ensureObjectId(targetId, 'userId');

    if (followerId === targetId) {
      throw new ServiceError(400, 'You cannot follow yourself');
    }

    const target = await User.findById(targetId).select('_id username displayName profilePicture role');
    if (!target) {
      throw new ServiceError(404, 'User not found');
    }

    const existing = await Follow.exists({ followerId, followingId: targetId });
    if (existing) {
      throw new ServiceError(409, 'You are already following this user');
    }

    await Follow.create({ followerId, followingId: targetId });
    return { following: true };
  },

  /**
   * Unfollow a user. Silent no-op if not currently following.
   */
  async unfollow(followerId: string, targetId: string) {
    ensureObjectId(targetId, 'userId');

    if (followerId === targetId) {
      throw new ServiceError(400, 'You cannot unfollow yourself');
    }

    await Follow.findOneAndDelete({ followerId, followingId: targetId });
    return { following: false };
  },

  /**
   * Check whether followerId is following targetId.
   */
  async isFollowing(followerId: string, targetId: string): Promise<boolean> {
    ensureObjectId(targetId, 'userId');
    return Boolean(await Follow.exists({ followerId, followingId: targetId }));
  },

  /**
   * Get a user's public profile along with:
   * - follower count
   * - following count
   * - whether the requesting user follows them (optional)
   * - their uploaded tracks (if creator)
   */
  async getUserProfile(targetId: string, requesterId?: string) {
    ensureObjectId(targetId, 'userId');

    const user = await User.findById(targetId).select(
      '-password -oauthProvider -oauthId'
    );
    if (!user) {
      throw new ServiceError(404, 'User not found');
    }

    const [followerCount, followingCount, isFollowing, tracks] = await Promise.all([
      Follow.countDocuments({ followingId: targetId }),
      Follow.countDocuments({ followerId: targetId }),
      requesterId && requesterId !== targetId
        ? Follow.exists({ followerId: requesterId, followingId: targetId })
        : Promise.resolve(null),
      user.role === 'creator'
        ? Song.find({ uploadedBy: targetId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title artist duration coverImage plays createdAt albumId')
        : Promise.resolve([]),
    ]);

    return {
      user,
      followerCount,
      followingCount,
      isFollowing: isFollowing !== null ? Boolean(isFollowing) : null,
      tracks,
    };
  },

  /**
   * Get all followers of a user (people who follow them), paginated.
   */
  async getFollowers(targetId: string, requesterId?: string, page = 1, limit = 20) {
    ensureObjectId(targetId, 'userId');

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      Follow.find({ followingId: targetId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('followerId', 'username displayName profilePicture role'),
      Follow.countDocuments({ followingId: targetId }),
    ]);

    const followerIds = records.map((r) => String((r.followerId as any)._id));

    // If the requester is logged in, figure out which of these users they also follow
    let followingSet = new Set<string>();
    if (requesterId) {
      const mutual = await Follow.find({
        followerId: requesterId,
        followingId: { $in: followerIds },
      }).select('followingId');
      followingSet = new Set(mutual.map((m) => String(m.followingId)));
    }

    const followers = records.map((r) => {
      const u = r.followerId as any;
      return {
        id: String(u._id),
        username: u.username,
        displayName: u.displayName,
        profilePicture: u.profilePicture,
        role: u.role,
        isFollowedByMe: requesterId ? followingSet.has(String(u._id)) : null,
      };
    });

    return {
      followers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  /**
   * Get all users that a user is following, paginated.
   */
  async getFollowing(targetId: string, requesterId?: string, page = 1, limit = 20) {
    ensureObjectId(targetId, 'userId');

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      Follow.find({ followerId: targetId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('followingId', 'username displayName profilePicture role'),
      Follow.countDocuments({ followerId: targetId }),
    ]);

    const followingIds = records.map((r) => String((r.followingId as any)._id));

    // If the requester is logged in, check which of these they also follow
    let followingSet = new Set<string>();
    if (requesterId && requesterId !== targetId) {
      const mutual = await Follow.find({
        followerId: requesterId,
        followingId: { $in: followingIds },
      }).select('followingId');
      followingSet = new Set(mutual.map((m) => String(m.followingId)));
    } else if (requesterId === targetId) {
      // Viewing own following list — they follow all of them by definition
      followingSet = new Set(followingIds);
    }

    const following = records.map((r) => {
      const u = r.followingId as any;
      return {
        id: String(u._id),
        username: u.username,
        displayName: u.displayName,
        profilePicture: u.profilePicture,
        role: u.role,
        isFollowedByMe: requesterId ? followingSet.has(String(u._id)) : null,
      };
    });

    return {
      following,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  /**
   * Get the feed of songs uploaded by users that the requester follows.
   * Useful for a "From Artists You Follow" section.
   */
  async getFollowingFeed(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const followingRecords = await Follow.find({ followerId: userId }).select('followingId');
    const followingIds = followingRecords.map((r) => r.followingId);

    if (followingIds.length === 0) {
      return {
        songs: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }

    const [songs, total] = await Promise.all([
      Song.find({ uploadedBy: { $in: followingIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('uploadedBy', 'username displayName profilePicture')
        .populate('albumId', 'title artistName coverImage'),
      Song.countDocuments({ uploadedBy: { $in: followingIds } }),
    ]);

    return {
      songs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  /**
   * Get the IDs of all users a given user follows (used for batch UI checks).
   */
  async getFollowingIds(userId: string): Promise<string[]> {
    const records = await Follow.find({ followerId: userId }).select('followingId');
    return records.map((r) => String(r.followingId));
  },
};