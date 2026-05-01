import express, { RequestHandler } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getRecentlyPlayed,
  clearRecentlyPlayed,
  recordRecentlyPlayed,
} from '../controllers/recently-played.controller';

const router = express.Router();
const auth = protect as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.get('/', auth, h(getRecentlyPlayed));
router.post('/', auth, h(recordRecentlyPlayed));
router.delete('/', auth, h(clearRecentlyPlayed));

export default router;
