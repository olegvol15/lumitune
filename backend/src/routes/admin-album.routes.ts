import express from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import { adminSongUpload } from '../middleware/upload.middleware';
import {
  createAlbumByAdmin,
  deleteAlbumByAdmin,
  updateAlbumByAdmin,
} from '../controllers/album.controller';

const router = express.Router();
const coverOnly = adminSongUpload.fields([{ name: 'cover', maxCount: 1 }]);

router.post('/', protectAdmin, coverOnly, createAlbumByAdmin);
router.put('/:id', protectAdmin, coverOnly, updateAlbumByAdmin);
router.delete('/:id', protectAdmin, deleteAlbumByAdmin);

export default router;
