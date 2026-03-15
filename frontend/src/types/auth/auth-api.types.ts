export interface RegisterPayload {
  email: string;
  password: string;
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
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverImage?: string;
}
