import express from 'express';
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

router.get('/saved', protect, getSavedAudiobooks);
router.post('/saved/:audiobookId', protect, saveAudiobook);
router.delete('/saved/:audiobookId', protect, unsaveAudiobook);
router.get('/progress/:audiobookId', protect, getAudiobookProgress);
router.put('/progress/:audiobookId', protect, updateAudiobookProgress);

router.get('/chapters/:chapterId', getAudiobookChapter);
router.get('/chapters/:chapterId/stream', optionalProtect, streamAudiobookChapter);

router.get('/', optionalProtect, listAudiobooks);
router.get('/:id', optionalProtect, getAudiobook);

export default router;
