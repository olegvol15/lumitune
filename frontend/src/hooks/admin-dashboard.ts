import { useQuery } from '@tanstack/react-query';
import adminDashboardApi from '../api/adminDashboardApi';
import { adminDashboardKeys } from './api-keys';

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: adminDashboardKeys.summary(),
    queryFn: async () => {
      const { data } = await adminDashboardApi.get();
      return data;
    },
  });
}
