import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth/auth.types';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import { authService } from '../services/auth.service';
import {
  USER_REFRESH_COOKIE_NAME,
  clearUserRefreshCookie,
  getCookieValue,
  setUserRefreshCookie,
} from '../utils/cookie.utils';

export const register = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } = await authService.register(req.body);
    setUserRefreshCookie(res, refreshToken);
    res.status(201).json({ success: true, accessToken, user });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error registering user') });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    setUserRefreshCookie(res, refreshToken);
    res.status(200).json({ success: true, accessToken, user });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error logging in') });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const oldToken = getCookieValue(req, USER_REFRESH_COOKIE_NAME);
    if (!oldToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    const { accessToken, refreshToken, user } = await authService.refresh(oldToken);
    setUserRefreshCookie(res, refreshToken);
    res.status(200).json({ success: true, accessToken, user });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error refreshing token') });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = getCookieValue(req, USER_REFRESH_COOKIE_NAME);
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearUserRefreshCookie(res);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error logging out') });
  }
};

export const logoutAll = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    await authService.logoutAll(String(req.user._id));
    clearUserRefreshCookie(res);
    res.status(200).json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    res.status(500).json({ success: false, message: getErrorMessage(error, 'Error logging out') });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = await authService.getMe(req.user?._id ? String(req.user._id) : undefined);
    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error getting user info') });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = await authService.updateProfile(
      req.user?._id ? String(req.user._id) : undefined,
      req.body
    );
    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error updating profile') });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    const result = await authService.forgotPassword(email);
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset code has been sent',
      ...(process.env.NODE_ENV !== 'production' ? result : {}),
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error sending reset code') });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };
    await authService.verifyResetCode(email, code);
    res.status(200).json({ success: true, message: 'Reset code is valid' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error verifying reset code') });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body as {
      email?: string;
      code?: string;
      newPassword?: string;
    };
    await authService.resetPassword(email, code, newPassword);
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res
      .status(500)
      .json({ success: false, message: getErrorMessage(error, 'Error resetting password') });
  }
};
