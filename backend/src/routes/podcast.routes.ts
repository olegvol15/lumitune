import express from 'express';
import {
  listPodcasts,
  getPodcast,
  getEpisode,
  streamEpisode,
} from '../controllers/podcast.controller';

const router = express.Router();

// Episode read routes must come before /:id to avoid param clash
router.get('/episodes/:episodeId', getEpisode);
router.get('/episodes/:episodeId/stream', streamEpisode);

// Podcast read routes
router.get('/', listPodcasts);
router.get('/:id', getPodcast);

export default router;
