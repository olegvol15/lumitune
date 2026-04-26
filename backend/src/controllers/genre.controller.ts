import { Request, Response } from 'express';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { genreService } from '../services/genre.service';

export const listGenresByAdmin = async (_req: Request, res: Response) => {
  try {
    const result = await genreService.listGenres();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching genres') });
  }
};

export const createGenreByAdmin = async (req: Request, res: Response) => {
  try {
    const { genre } = await genreService.createGenre({ name: req.body.name });
    res.status(201).json({ success: true, genre });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error creating genre') });
  }
};

export const updateGenreByAdmin = async (req: Request, res: Response) => {
  try {
    const { genre } = await genreService.updateGenre(String(req.params.id), { name: req.body.name });
    res.status(200).json({ success: true, genre });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error updating genre') });
  }
};

export const deleteGenreByAdmin = async (req: Request, res: Response) => {
  try {
    await genreService.deleteGenre(String(req.params.id));
    res.status(200).json({ success: true, message: 'Genre deleted' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error deleting genre') });
  }
};
