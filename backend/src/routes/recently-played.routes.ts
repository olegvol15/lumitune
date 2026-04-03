import express, { RequestHandler } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getRecentlyPlayed, clearRecentlyPlayed } from '../controllers/recently-played.controller';

const router = express.Router();
const auth = protect as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', auth, h(getRecentlyPlayed));
router.delete('/', auth, h(clearRecentlyPlayed));

export default router;