import express from 'express';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// We'll implement these later
router.get('/', protect, (req, res) => {
  res.json({ message: 'Get all playlists - to be implemented' });
});

router.post('/', protect, (req, res) => {
  res.json({ message: 'Create playlist - to be implemented' });
});

router.get('/:id', protect, (req, res) => {
  res.json({ message: 'Get playlist by id - to be implemented' });
});

router.put('/:id', protect, (req, res) => {
  res.json({ message: 'Update playlist - to be implemented' });
});

router.delete('/:id', protect, (req, res) => {
  res.json({ message: 'Delete playlist - to be implemented' });
});

router.post('/:id/songs', protect, (req, res) => {
  res.json({ message: 'Add song to playlist - to be implemented' });
});

router.delete('/:id/songs/:songId', protect, (req, res) => {
  res.json({ message: 'Remove song from playlist - to be implemented' });
});

export default router;