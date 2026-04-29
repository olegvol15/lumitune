import express, { RequestHandler } from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import { Follow } from '../models/follow.model';
import { User } from '../models/user.model';
import { getErrorMessage } from '../utils/error.utils';

const router = express.Router();
const admin = protectAdmin as unknown as RequestHandler;

// GET /api/admin/users/:userId/followers — admin view of a user's followers
router.get('/:userId/followers', admin, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Follow.find({ followingId: req.params.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('followerId', 'username displayName profilePicture role email createdAt'),
      Follow.countDocuments({ followingId: req.params.userId }),
    ]);

    res.status(200).json({
      success: true,
      followers: records.map((r) => r.followerId),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching followers') });
  }
});

// GET /api/admin/users/:userId/following — admin view of who a user follows
router.get('/:userId/following', admin, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Follow.find({ followerId: req.params.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('followingId', 'username displayName profilePicture role email createdAt'),
      Follow.countDocuments({ followerId: req.params.userId }),
    ]);

    res.status(200).json({
      success: true,
      following: records.map((r) => r.followingId),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching following') });
  }
});

// GET /api/admin/users/stats — top creators by follower count
router.get('/stats', admin, async (_req, res) => {
  try {
    const topCreators = await Follow.aggregate([
      {
        $group: {
          _id: '$followingId',
          followerCount: { $sum: 1 },
        },
      },
      { $sort: { followerCount: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          followerCount: 1,
          username: '$user.username',
          displayName: '$user.displayName',
          profilePicture: '$user.profilePicture',
          role: '$user.role',
        },
      },
    ]);

    res.status(200).json({ success: true, topCreators });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching follow stats') });
  }
});

export default router;