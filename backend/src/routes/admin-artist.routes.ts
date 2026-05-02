import express, { RequestHandler } from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import {
  createArtistByAdmin,
  deleteArtistByAdmin,
  listArtists,
  updateArtistByAdmin,
} from '../controllers/artist.controller';

const router = express.Router();
const admin = protectAdmin as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', admin, h(listArtists));
router.post('/', admin, h(createArtistByAdmin));
router.put('/:id', admin, h(updateArtistByAdmin));
router.delete('/:id', admin, h(deleteArtistByAdmin));

export default router;
