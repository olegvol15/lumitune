import { useQuery } from '@tanstack/react-query';
import adminUsersApi from '../api/adminUsersApi';
import { adminUsersKeys } from './api-keys';

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: adminUsersKeys.list(),
    queryFn: async () => {
      const { data } = await adminUsersApi.list();
      return data.users;
    },
  });
}
