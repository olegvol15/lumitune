import express, { RequestHandler } from 'express';
import { protect, optionalProtect } from '../middleware/auth.middleware';
import {
  getAudiobook,
  getAudiobookChapter,
  getAudiobookProgress,
  getSavedAudiobooks,
  listAudiobooks,
  saveAudiobook,
  streamAudiobookChapter,
  unsaveAudiobook,
  updateAudiobookProgress,
} from '../controllers/audiobook.controller';

const router = express.Router();
const auth = protect as unknown as RequestHandler;
const maybeAuth = optionalProtect as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/saved', auth, h(getSavedAudiobooks));
router.post('/saved/:audiobookId', auth, h(saveAudiobook));
router.delete('/saved/:audiobookId', auth, h(unsaveAudiobook));
router.get('/progress/:audiobookId', auth, h(getAudiobookProgress));
router.put('/progress/:audiobookId', auth, h(updateAudiobookProgress));

router.get('/chapters/:chapterId', getAudiobookChapter);
router.get('/chapters/:chapterId/stream', maybeAuth, h(streamAudiobookChapter));

router.get('/', maybeAuth, h(listAudiobooks));
router.get('/:id', maybeAuth, h(getAudiobook));

export default router;
