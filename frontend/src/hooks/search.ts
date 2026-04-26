import { useState } from 'react';
import type { Album, Artist, Audiobook, Track } from '../types';

export function useSearch(
  tracks: Track[],
  audiobooks: Audiobook[] = [],
  albums: Album[] = [],
  artists: Artist[] = []
) {
  const [query, setQuery] = useState('');

  const q = query.toLowerCase().trim();
  const results = q
    ? {
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
      }
    : { tracks: [], artists: [], albums: [], audiobooks: [] };

  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.audiobooks.length > 0;

  return { query, setQuery, results, hasResults };
}
