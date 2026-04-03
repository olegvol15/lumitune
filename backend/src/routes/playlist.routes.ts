import express, { RequestHandler } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylists,
  removeSongFromPlaylist,
  updatePlaylist,
} from '../controllers/playlist.controller';

const router = express.Router();
const auth = protect as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', auth, h(getPlaylists));
router.post('/', auth, h(createPlaylist));
router.get('/:id', auth, h(getPlaylistById));
router.put('/:id', auth, h(updatePlaylist));
router.delete('/:id', auth, h(deletePlaylist));
router.post('/:id/songs', auth, h(addSongToPlaylist));
router.delete('/:id/songs/:songId', auth, h(removeSongFromPlaylist));

export default router;