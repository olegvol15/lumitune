import express, { RequestHandler } from 'express';
import { optionalProtect, protect } from '../middleware/auth.middleware';
import {
  followArtist,
  getArtistFollowStatus,
  getFollowedArtists,
  unfollowArtist,
} from '../controllers/artist-follow.controller';

const router = express.Router();
const auth = protect as unknown as RequestHandler;
const maybeAuth = optionalProtect as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', auth, h(getFollowedArtists));
router.get('/:artistId', maybeAuth, h(getArtistFollowStatus));
router.post('/:artistId', auth, h(followArtist));
router.delete('/:artistId', auth, h(unfollowArtist));

export default router;
