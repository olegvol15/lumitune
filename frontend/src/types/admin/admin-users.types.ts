export interface AdminUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'user' | 'creator';
  country: string;
  city: string;
  profilePicture: string;
  createdAt: string;
}
