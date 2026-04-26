import express, { RequestHandler } from 'express';
import { listMoods } from '../controllers/mood.controller';

const router = express.Router();
const h = (fn: Function) => fn as unknown as RequestHandler;

router.get('/', h(listMoods));

export default router;
