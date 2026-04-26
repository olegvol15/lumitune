import { useQuery } from '@tanstack/react-query';
import moodsApi from '../api/moodsApi';
import { moodKeys } from './api-keys';

export function useMoodsQuery() {
  return useQuery({
    queryKey: moodKeys.list(),
    queryFn: async () => {
      const { data } = await moodsApi.list();
      return data.moods.map((mood) => mood.name);
    },
  });
}
