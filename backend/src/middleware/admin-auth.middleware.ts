import { Response, NextFunction } from 'express';
import { verifyAdminToken } from '../utils/admin-jwt.utils';
import { Admin } from '../models/admin.model';
import { AdminAuthRequest } from '../types/admin/admin-auth.types';

export const protectAdmin = async (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    const token = authorization.split(' ')[1];
    const decoded = verifyAdminToken(token);

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found',
      });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};
