// src/routes/admin-podcast.routes.ts
import express, { RequestHandler } from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import { adminSongUpload } from '../middleware/upload.middleware';
import {
  createPodcast,
  updatePodcast,
  deletePodcast,
  uploadEpisode,
  updateEpisode,
  deleteEpisode,
} from '../controllers/podcast.controller';

const router = express.Router();
const h = (fn: Function) => fn as unknown as RequestHandler;

const mediaFields = adminSongUpload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

const coverOnly = adminSongUpload.fields([{ name: 'cover', maxCount: 1 }]);

router.put('/episodes/:episodeId', protectAdmin, mediaFields, h(updateEpisode));
router.delete('/episodes/:episodeId', protectAdmin, h(deleteEpisode));

router.post('/', protectAdmin, coverOnly, h(createPodcast));
router.put('/:id', protectAdmin, coverOnly, h(updatePodcast));
router.delete('/:id', protectAdmin, h(deletePodcast));

router.post('/:podcastId/episodes', protectAdmin, mediaFields, h(uploadEpisode));

export default router;