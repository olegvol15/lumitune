import apiClient from '../lib/apiClient';
import type { AdminDashboardResponse } from '../types/admin/admin-dashboard-api.types';

const adminDashboardApi = {
  get: () => apiClient.get<AdminDashboardResponse>('/admin/dashboard'),
};

export default adminDashboardApi;
