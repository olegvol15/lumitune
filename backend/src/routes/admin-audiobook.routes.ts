import express, { RequestHandler } from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import { adminSongUpload } from '../middleware/upload.middleware';
import {
  createAudiobook,
  deleteAudiobook,
  deleteAudiobookChapter,
  updateAudiobook,
  updateAudiobookChapter,
  uploadAudiobookChapter,
} from '../controllers/audiobook.controller';

const router = express.Router();
const admin = protectAdmin as unknown as RequestHandler;
const h = (fn: Function) => fn as unknown as RequestHandler;

const mediaFields = adminSongUpload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

const coverOnly = adminSongUpload.fields([{ name: 'cover', maxCount: 1 }]);

router.put('/chapters/:chapterId', admin, mediaFields, h(updateAudiobookChapter));
router.delete('/chapters/:chapterId', admin, h(deleteAudiobookChapter));

router.post('/', admin, coverOnly, h(createAudiobook));
router.put('/:id', admin, coverOnly, h(updateAudiobook));
router.delete('/:id', admin, h(deleteAudiobook));

router.post('/:audiobookId/chapters', admin, mediaFields, h(uploadAudiobookChapter));

export default router;
