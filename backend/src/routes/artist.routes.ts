import express, { RequestHandler } from 'express';
import { getArtist, listArtists } from '../controllers/artist.controller';

const router = express.Router();
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', h(listArtists));
router.get('/:id', h(getArtist));

export default router;
