import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { authService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { token, user } = await authService.register(req.body);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error registering user'),
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { token, user } = await authService.login(req.body);

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error logging in'),
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = await authService.getMe(req.user?._id ? String(req.user._id) : undefined);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error getting user info'),
    });
  }
};
