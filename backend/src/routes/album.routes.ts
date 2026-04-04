import express from 'express';
import { optionalProtect, protect } from '../middleware/auth.middleware';
import { adminSongUpload } from '../middleware/upload.middleware';
import {
  createAlbum,
  deleteAlbum,
  getAlbum,
  getSavedAlbums,
  listAlbums,
  listOwnAlbums,
  saveAlbum,
  unsaveAlbum,
  updateAlbum,
} from '../controllers/album.controller';

const router = express.Router();

const coverOnly = adminSongUpload.fields([{ name: 'cover', maxCount: 1 }]);

router.get('/saved', protect, getSavedAlbums);
router.post('/saved/:albumId', protect, saveAlbum);
router.delete('/saved/:albumId', protect, unsaveAlbum);
router.get('/mine', protect, listOwnAlbums);

router.get('/', optionalProtect, listAlbums);
router.get('/:id', optionalProtect, getAlbum);
router.post('/', protect, coverOnly, createAlbum);
router.put('/:id', protect, coverOnly, updateAlbum);
router.delete('/:id', protect, deleteAlbum);

export default router;
