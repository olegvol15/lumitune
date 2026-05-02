import { Request, Response } from 'express';
import { artistService } from '../services/artist.service';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';

export const listArtists = async (_req: Request, res: Response) => {
  try {
    const result = await artistService.listArtists();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching artists') });
  }
};

export const getArtist = async (req: Request, res: Response) => {
  try {
    const result = await artistService.getArtistBySlug(String(req.params.id));
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching artist') });
  }
};

export const createArtistByAdmin = async (req: Request, res: Response) => {
  try {
    const { artist } = await artistService.createArtist(req.body);
    res.status(201).json({ success: true, artist });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error creating artist') });
  }
};

export const updateArtistByAdmin = async (req: Request, res: Response) => {
  try {
    const { artist } = await artistService.updateArtist(String(req.params.id), req.body);
    res.status(200).json({ success: true, artist });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error updating artist') });
  }
};

export const deleteArtistByAdmin = async (req: Request, res: Response) => {
  try {
    await artistService.deleteArtist(String(req.params.id));
    res.status(200).json({ success: true, message: 'Artist deleted' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error deleting artist') });
  }
};
