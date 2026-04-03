import express, { RequestHandler } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getLikedSongs, likeSong, unlikeSong, checkLiked } from '../controllers/likes.controller';

const router = express.Router();
const auth = protect as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', auth, h(getLikedSongs));
router.get('/:songId', auth, h(checkLiked));
router.post('/:songId', auth, h(likeSong));
router.delete('/:songId', auth, h(unlikeSong));

export default router;