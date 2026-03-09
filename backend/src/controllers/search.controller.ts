import { Request, Response } from 'express';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { searchService } from '../services/search.service';

export const search = async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '');
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await searchService.search(query, page, limit);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: getErrorMessage(error, 'Error searching') });
  }
};