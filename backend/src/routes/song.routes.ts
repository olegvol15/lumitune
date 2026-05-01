import express, { RequestHandler } from 'express';
import {
  uploadSong,
  getAllSongs,
  getSongById,
  streamSong,
  getOwnSongs,
  updateOwnSong,
  deleteOwnSong,
} from '../controllers/song.controller';
import { protect } from '../middleware/auth.middleware';
import { adminSongUpload } from '../middleware/upload.middleware';

const router = express.Router();
const auth = protect as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', getAllSongs);
router.get('/mine', auth, h(getOwnSongs));
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
router.delete('/:id', auth, h(deleteOwnSong));

export default router;
