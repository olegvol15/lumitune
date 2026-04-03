import express from 'express';
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

const mediaFields = adminSongUpload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

const coverOnly = adminSongUpload.fields([{ name: 'cover', maxCount: 1 }]);

// Episode routes before /:id to avoid param clash
router.put('/episodes/:episodeId', protectAdmin, mediaFields, updateEpisode);
router.delete('/episodes/:episodeId', protectAdmin, deleteEpisode);

// Podcast CRUD
router.post('/', protectAdmin, coverOnly, createPodcast);
router.put('/:id', protectAdmin, coverOnly, updatePodcast);
router.delete('/:id', protectAdmin, deletePodcast);

// Upload episode to a podcast
router.post('/:podcastId/episodes', protectAdmin, mediaFields, uploadEpisode);

export default router;
