import express, { RequestHandler } from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import {
  createMoodByAdmin,
  deleteMoodByAdmin,
  listMoodsByAdmin,
  updateMoodByAdmin,
} from '../controllers/mood.controller';

const router = express.Router();
const admin = protectAdmin as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', admin, h(listMoodsByAdmin));
router.post('/', admin, h(createMoodByAdmin));
router.put('/:id', admin, h(updateMoodByAdmin));
router.delete('/:id', admin, h(deleteMoodByAdmin));

export default router;
