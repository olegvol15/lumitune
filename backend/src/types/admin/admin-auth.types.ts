import { Request } from 'express';
import { IAdmin } from './admin.types';

export interface AdminTokenPayload {
  id: string;
  email: string;
}

export interface AdminAuthUser {
  id: string;
  email: string;
}

export interface AdminLoginResult {
  token: string;
  admin: AdminAuthUser;
}

export interface AdminForgotPasswordResult {
  code?: string;
}

export interface AdminCredentialsBody {
  email?: string;
  password?: string;
}

export interface AdminForgotPasswordBody {
  email?: string;
}

export interface AdminVerifyResetCodeBody {
  email?: string;
  code?: string;
}

export interface AdminResetPasswordBody {
  email?: string;
  code?: string;
  newPassword?: string;
}

export interface AdminAuthRequest extends Request {
  admin?: IAdmin;
}
