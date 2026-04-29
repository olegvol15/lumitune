import express, { RequestHandler } from 'express';
import { protect, optionalProtect } from '../middleware/auth.middleware';
import {
  followUser,
  unfollowUser,
  checkFollowing,
  getUserProfile,
  getFollowers,
  getFollowing,
  getFollowingFeed,
  getFollowingIds,
} from '../controllers/follow.controller';

const router = express.Router();
const auth = protect as unknown as RequestHandler;
const maybeAuth = optionalProtect as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

// ─── Authenticated-user-scoped routes (no :userId param) ──────────────────
// IMPORTANT: these must come before /:userId to avoid param collision

// GET  /api/users/feed         — songs from followed creators
router.get('/feed', auth, h(getFollowingFeed));

// GET  /api/users/following-ids — all IDs the authed user follows (for UI)
router.get('/following-ids', auth, h(getFollowingIds));

// ─── Public profile routes ────────────────────────────────────────────────

// GET  /api/users/:userId               — public profile + stats
router.get('/:userId', maybeAuth, h(getUserProfile));

// GET  /api/users/:userId/followers     — paginated follower list
router.get('/:userId/followers', maybeAuth, h(getFollowers));

// GET  /api/users/:userId/following     — paginated following list
router.get('/:userId/following', maybeAuth, h(getFollowing));

// ─── Follow actions (require auth) ───────────────────────────────────────

// POST   /api/users/:userId/follow      — follow a user
router.post('/:userId/follow', auth, h(followUser));

// DELETE /api/users/:userId/follow      — unfollow a user
router.delete('/:userId/follow', auth, h(unfollowUser));

// GET    /api/users/:userId/follow      — check if authed user follows them
router.get('/:userId/follow', auth, h(checkFollowing));

export default router;