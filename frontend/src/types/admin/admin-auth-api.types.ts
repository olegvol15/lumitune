export interface AdminAuthUser {
  id: string;
  email: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  admin: AdminAuthUser;
}

export interface AdminAuthResponse {
  success: boolean;
  admin: AdminAuthUser;
}

export interface AdminResetCodeResponse {
  success: boolean;
  message: string;
  code?: string;
}

export interface BasicAdminResponse {
  success: boolean;
  message: string;
}
