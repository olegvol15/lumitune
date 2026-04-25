import express, { RequestHandler } from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import {
  addSongToCuratedPlaylistByAdmin,
  createCuratedPlaylistByAdmin,
  deleteCuratedPlaylistByAdmin,
  getCuratedPlaylistByAdmin,
  getCuratedPlaylistsByAdmin,
  removeSongFromCuratedPlaylistByAdmin,
  updateCuratedPlaylistByAdmin,
} from '../controllers/playlist.controller';

const router = express.Router();
const admin = protectAdmin as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', admin, h(getCuratedPlaylistsByAdmin));
router.post('/', admin, h(createCuratedPlaylistByAdmin));
router.get('/:id', admin, h(getCuratedPlaylistByAdmin));
router.put('/:id', admin, h(updateCuratedPlaylistByAdmin));
router.delete('/:id', admin, h(deleteCuratedPlaylistByAdmin));
router.post('/:id/songs', admin, h(addSongToCuratedPlaylistByAdmin));
router.delete('/:id/songs/:songId', admin, h(removeSongFromCuratedPlaylistByAdmin));

export default router;
