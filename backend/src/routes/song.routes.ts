import express from 'express';
import { uploadSong, getAllSongs, getSongById, streamSong } from '../controllers/song.controller';
import { protect } from '../middleware/auth.middleware';
import { adminSongUpload } from '../middleware/upload.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllSongs);
router.get('/:id', getSongById);
router.get('/:id/stream', streamSong);

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

export default router;
