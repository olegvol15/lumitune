import express, { RequestHandler } from 'express';
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
const auth = protect as unknown as RequestHandler;
const maybeAuth = optionalProtect as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

const coverOnly = adminSongUpload.fields([{ name: 'cover', maxCount: 1 }]);

router.get('/saved', auth, h(getSavedAlbums));
router.post('/saved/:albumId', auth, h(saveAlbum));
router.delete('/saved/:albumId', auth, h(unsaveAlbum));
router.get('/mine', auth, h(listOwnAlbums));

router.get('/', maybeAuth, h(listAlbums));
router.get('/:id', maybeAuth, h(getAlbum));
router.post('/', auth, coverOnly, h(createAlbum));
router.put('/:id', auth, coverOnly, h(updateAlbum));
router.delete('/:id', auth, h(deleteAlbum));

export default router;
