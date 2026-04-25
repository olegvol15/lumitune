import express, { RequestHandler } from 'express';
import { protectAdmin } from '../middleware/admin-auth.middleware';
import { getAdminDashboard } from '../controllers/admin-dashboard.controller';

const router = express.Router();
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', protectAdmin, h(getAdminDashboard));

export default router;
