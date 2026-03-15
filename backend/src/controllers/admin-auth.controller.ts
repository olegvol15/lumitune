import { Request, Response } from 'express';
import {
  AdminAuthRequest,
  AdminCredentialsBody,
  AdminForgotPasswordBody,
  AdminResetPasswordBody,
  AdminVerifyResetCodeBody,
} from '../types/admin/admin-auth.types';
import { adminAuthService } from '../services/admin-auth.service';
import { ServiceError } from '../types/error/service-error';
import { getErrorMessage } from '../utils/error.utils';
import {
  ADMIN_REFRESH_COOKIE_NAME,
  clearAdminRefreshCookie,
  getCookieValue,
  setAdminRefreshCookie,
} from '../utils/cookie.utils';

export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as AdminCredentialsBody;
    const admin = await adminAuthService.signup(email, password);

    return res.status(201).json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error creating admin account'),
    });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as AdminCredentialsBody;
    const { accessToken, refreshToken, admin } = await adminAuthService.login(email, password);
    setAdminRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error logging in'),
    });
  }
};

export const adminMe = async (req: AdminAuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        id: String(req.admin._id),
        email: req.admin.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error getting admin info'),
    });
  }
};

export const adminRefresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = getCookieValue(req, ADMIN_REFRESH_COOKIE_NAME);
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const { accessToken, refreshToken: nextRefreshToken, admin } = await adminAuthService.refresh(refreshToken);
    setAdminRefreshCookie(res, nextRefreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
      admin,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error refreshing session'),
    });
  }
};

export const adminLogout = async (req: Request, res: Response) => {
  try {
    const refreshToken = getCookieValue(req, ADMIN_REFRESH_COOKIE_NAME);
    if (refreshToken) {
      await adminAuthService.logout(refreshToken);
    }

    clearAdminRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error logging out'),
    });
  }
};

export const adminLogoutAll = async (req: AdminAuthRequest, res: Response) => {
  try {
    if (!req.admin?._id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    await adminAuthService.logoutAll(String(req.admin._id));
    clearAdminRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out from all devices',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error logging out from all devices'),
    });
  }
};

export const adminForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as AdminForgotPasswordBody;
    const { code } = await adminAuthService.forgotPassword(email);

    return res.status(200).json({
      success: true,
      message: 'Reset code sent',
      ...(process.env.NODE_ENV !== 'production' ? { code } : {}),
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error sending reset code'),
    });
  }
};

export const adminVerifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body as AdminVerifyResetCodeBody;
    await adminAuthService.verifyResetCode(email, code);

    return res.status(200).json({
      success: true,
      message: 'Reset code is valid',
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error verifying reset code'),
    });
  }
};

export const adminResetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body as AdminResetPasswordBody;
    await adminAuthService.resetPassword(email, code, newPassword);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: getErrorMessage(error, 'Error resetting password'),
    });
  }
};
