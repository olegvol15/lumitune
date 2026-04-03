import express from 'express';
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

const mediaFields = adminSongUpload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

const coverOnly = adminSongUpload.fields([{ name: 'cover', maxCount: 1 }]);

router.put('/chapters/:chapterId', protectAdmin, mediaFields, updateAudiobookChapter);
router.delete('/chapters/:chapterId', protectAdmin, deleteAudiobookChapter);

router.post('/', protectAdmin, coverOnly, createAudiobook);
router.put('/:id', protectAdmin, coverOnly, updateAudiobook);
router.delete('/:id', protectAdmin, deleteAudiobook);

router.post('/:audiobookId/chapters', protectAdmin, mediaFields, uploadAudiobookChapter);

export default router;
