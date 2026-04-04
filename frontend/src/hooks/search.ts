import { useMemo, useState } from 'react';
import { artists } from '../data/artists';
import type { Album, Audiobook, Track } from '../types';

export function useSearch(tracks: Track[], audiobooks: Audiobook[] = [], albums: Album[] = []) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { tracks: [], artists: [], albums: [], audiobooks: [] };

    return {
      tracks: tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artistName.toLowerCase().includes(q) ||
          t.albumTitle.toLowerCase().includes(q)
      ),
      artists: artists.filter(
        (a) => a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)
      ),
      albums: albums.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.artistName.toLowerCase().includes(q) ||
          a.genre.toLowerCase().includes(q)
      ),
      audiobooks: audiobooks.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.genre.toLowerCase().includes(q)
      ),
    };
  }, [albums, audiobooks, query, tracks]);

  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.audiobooks.length > 0;

  return { query, setQuery, results, hasResults };
}
