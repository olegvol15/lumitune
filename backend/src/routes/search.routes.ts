import express from 'express';
import { search } from '../controllers/search.controller';

const router = express.Router();

// Public search: GET /api/search?q=term&page=1&limit=20
router.get('/', search);

export default router;