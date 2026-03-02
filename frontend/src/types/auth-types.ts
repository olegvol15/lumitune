export interface AuthUser {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface MeResponse {
  success: boolean;
  user: AuthUser;
}
