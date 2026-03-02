import express from 'express';
import { 
  uploadSong, 
  getAllSongs, 
  getSongById, 
  streamSong 
} from '../controllers/song.controller';
import { protect } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllSongs);
router.get('/:id', getSongById);
router.get('/:id/stream', streamSong);

// Protected routes
router.post('/upload', protect, upload.single('audio'), uploadSong);

export default router;