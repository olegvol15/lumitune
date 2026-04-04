import express from 'express';
import {
  uploadSong,
  getAllSongs,
  getOwnSongs,
  getSongById,
  streamSong,
  updateOwnSong,
} from '../controllers/song.controller';
import { optionalProtect, protect } from '../middleware/auth.middleware';
import { adminSongUpload } from '../middleware/upload.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllSongs);
router.get('/mine', protect, getOwnSongs);
router.get('/:id', getSongById);
router.get('/:id/stream', optionalProtect, streamSong);

// Protected routes — accept both audio + optional cover
router.post(
  '/upload',
  protect,
  adminSongUpload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  uploadSong
);
router.put(
  '/:id',
  protect,
  adminSongUpload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  updateOwnSong
);

export default router;
