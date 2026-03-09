import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getLikedSongs, likeSong, unlikeSong, checkLiked } from '../controllers/likes.controller';

const router = express.Router();

// All likes routes require authentication
router.get('/', protect, getLikedSongs);
router.get('/:songId', protect, checkLiked);
router.post('/:songId', protect, likeSong);
router.delete('/:songId', protect, unlikeSong);

export default router;