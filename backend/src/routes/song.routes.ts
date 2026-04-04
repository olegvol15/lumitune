import express, { RequestHandler } from 'express';
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
const auth = protect as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', getAllSongs);
router.get('/mine', protect, getOwnSongs);
router.get('/:id', getSongById);
router.get('/:id/stream', h(streamSong));

router.post(
  '/upload',
  auth,
  adminSongUpload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  h(uploadSong)
);
router.put(
  '/:id',
  auth,
  adminSongUpload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  h(updateOwnSong)
);

export default router;