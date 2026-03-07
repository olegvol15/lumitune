import express from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import { adminSongUpload } from '../middleware/upload.middleware';
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
router.post(
  '/upload',
  protectAdmin,
  adminSongUpload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  uploadSongByAdmin,
);
router.put('/:id', protectAdmin, adminSongUpload.single('cover'), updateSongByAdmin);
router.delete('/:id', protectAdmin, deleteSongByAdmin);

export default router;
