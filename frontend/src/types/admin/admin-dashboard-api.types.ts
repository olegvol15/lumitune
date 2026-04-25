import type { AdminDashboardMonthlyPoint, AdminDashboardTotals } from './admin-dashboard.types';

export interface AdminDashboardResponse {
  success: boolean;
  totals: AdminDashboardTotals;
  monthlyContent: AdminDashboardMonthlyPoint[];
}
