import express, { RequestHandler } from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import { adminSongUpload } from '../middleware/upload.middleware';
import {
  createAlbumByAdmin,
  deleteAlbumByAdmin,
  updateAlbumByAdmin,
} from '../controllers/album.controller';

const router = express.Router();
const admin = protectAdmin as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;
const coverOnly = adminSongUpload.fields([{ name: 'cover', maxCount: 1 }]);

router.post('/', admin, coverOnly, h(createAlbumByAdmin));
router.put('/:id', admin, coverOnly, h(updateAlbumByAdmin));
router.delete('/:id', admin, h(deleteAlbumByAdmin));

export default router;
