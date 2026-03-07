import { useEffect } from 'react';
import { useSongsCatalogStore } from '../store/songsCatalogStore';

export const useCatalogTracks = () => {
  const tracks = useSongsCatalogStore((state) => state.tracks);
  const isLoading = useSongsCatalogStore((state) => state.isLoading);
  const hasLoaded = useSongsCatalogStore((state) => state.hasLoaded);
  const error = useSongsCatalogStore((state) => state.error);
  const fetchTracks = useSongsCatalogStore((state) => state.fetchTracks);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      fetchTracks();
    }
  }, [hasLoaded, isLoading, fetchTracks]);

  return { tracks, isLoading, hasLoaded, error, refresh: fetchTracks };
};
