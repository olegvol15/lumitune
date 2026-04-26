import { Request, Response } from 'express';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { moodService } from '../services/mood.service';

export const listMoods = async (_req: Request, res: Response) => {
  try {
    const result = await moodService.listMoods();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching moods') });
  }
};

export const listMoodsByAdmin = async (_req: Request, res: Response) => {
  try {
    const result = await moodService.listMoodsWithUsage();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error fetching moods') });
  }
};

export const createMoodByAdmin = async (req: Request, res: Response) => {
  try {
    const { mood } = await moodService.createMood({ name: req.body.name });
    res.status(201).json({ success: true, mood });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error creating mood') });
  }
};

export const updateMoodByAdmin = async (req: Request, res: Response) => {
  try {
    const { mood } = await moodService.updateMood(String(req.params.id), { name: req.body.name });
    res.status(200).json({ success: true, mood });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error updating mood') });
  }
};

export const deleteMoodByAdmin = async (req: Request, res: Response) => {
  try {
    await moodService.deleteMood(String(req.params.id));
    res.status(200).json({ success: true, message: 'Mood deleted' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error deleting mood') });
  }
};
