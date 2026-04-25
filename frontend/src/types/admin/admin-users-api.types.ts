import type { AdminUser } from './admin-users.types';

export interface AdminUsersResponse {
  success: boolean;
  users: AdminUser[];
}
