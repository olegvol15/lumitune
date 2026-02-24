import { useMemo, useState } from 'react';
import { tracks } from '../data/tracks';
import { artists } from '../data/artists';
import { albums } from '../data/albums';

export function useSearch() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { tracks: [], artists: [], albums: [] };

    return {
      tracks: tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artistName.toLowerCase().includes(q) ||
          t.albumTitle.toLowerCase().includes(q),
      ),
      artists: artists.filter(
        (a) => a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q),
      ),
      albums: albums.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.artistName.toLowerCase().includes(q) ||
          a.genre.toLowerCase().includes(q),
      ),
    };
  }, [query]);

  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0;

  return { query, setQuery, results, hasResults };
}
