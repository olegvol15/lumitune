import express from 'express';
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

router.get('/', protect, getPlaylists);
router.post('/', protect, createPlaylist);
router.get('/:id', protect, getPlaylistById);
router.put('/:id', protect, updatePlaylist);
router.delete('/:id', protect, deletePlaylist);
router.post('/:id/songs', protect, addSongToPlaylist);
router.delete('/:id/songs/:songId', protect, removeSongFromPlaylist);

export default router;
