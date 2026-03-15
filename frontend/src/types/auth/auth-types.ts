export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  dateOfBirth: {
    day: number;
    month: number;
    year: number;
  };
  country: string;
  city: string;
  role: 'user' | 'creator';
  bio?: string;
  coverImage?: string;
  profilePicture?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: AuthUser;
}

export interface MeResponse {
  success: boolean;
  user: AuthUser;
}
