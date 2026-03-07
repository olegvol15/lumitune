import express from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  deleteSongByAdmin,
  getAllSongs,
  getSongById,
  updateSongByAdmin,
  uploadSongByAdmin,
} from '../controllers/song.controller';

const router = express.Router();

router.get('/', protectAdmin, getAllSongs);
router.get('/:id', protectAdmin, getSongById);
router.post('/upload', protectAdmin, upload.single('audio'), uploadSongByAdmin);
router.put('/:id', protectAdmin, updateSongByAdmin);
router.delete('/:id', protectAdmin, deleteSongByAdmin);

export default router;
