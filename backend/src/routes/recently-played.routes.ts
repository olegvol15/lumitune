import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getRecentlyPlayed, clearRecentlyPlayed } from '../controllers/recently-played.controller';

const router = express.Router();

router.get('/', protect, getRecentlyPlayed);
router.delete('/', protect, clearRecentlyPlayed);

export default router;
