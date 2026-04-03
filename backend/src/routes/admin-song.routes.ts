// src/routes/admin-song.routes.ts
import express, { RequestHandler } from 'express';
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
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', protectAdmin, h(getAllSongs));
router.get('/:id', protectAdmin, h(getSongById));
router.post(
  '/upload',
  protectAdmin,
  adminSongUpload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  h(uploadSongByAdmin)
);
router.put('/:id', protectAdmin, adminSongUpload.single('cover'), h(updateSongByAdmin));
router.delete('/:id', protectAdmin, h(deleteSongByAdmin));

export default router;