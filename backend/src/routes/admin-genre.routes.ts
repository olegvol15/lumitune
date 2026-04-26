import express, { RequestHandler } from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import {
  createGenreByAdmin,
  deleteGenreByAdmin,
  listGenresByAdmin,
  updateGenreByAdmin,
} from '../controllers/genre.controller';

const router = express.Router();
const admin = protectAdmin as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', admin, h(listGenresByAdmin));
router.post('/', admin, h(createGenreByAdmin));
router.put('/:id', admin, h(updateGenreByAdmin));
router.delete('/:id', admin, h(deleteGenreByAdmin));

export default router;
