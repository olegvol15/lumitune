import apiClient from '../lib/apiClient';
import type { AdminUsersResponse } from '../types/admin/admin-users-api.types';

const adminUsersApi = {
  list: () => apiClient.get<AdminUsersResponse>('/admin/users'),
};

export default adminUsersApi;
