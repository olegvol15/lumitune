import express, { RequestHandler } from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import { listUsersByAdmin } from '../controllers/admin-user.controller';

const router = express.Router();
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', protectAdmin, h(listUsersByAdmin));

export default router;
