import { useMemo } from 'react';
import type { Artist } from '../types';
import { useAlbumsQuery } from './albums';
import { useCatalogTracks } from './tracks';

const getArtistImage = (artistName: string, tracks: ReturnType<typeof useCatalogTracks>['tracks']) =>
  tracks.find((track) => track.artistName === artistName)?.albumCover || '/vite.svg';

export function useArtistsQuery() {
  const catalogTracks = useCatalogTracks();
  const albumsQuery = useAlbumsQuery();

  const artists = useMemo<Artist[]>(() => {
    const byName = new Map<string, Artist>();

    for (const track of catalogTracks.tracks) {
      const current = byName.get(track.artistName);
      byName.set(track.artistName, {
        id: track.artistId,
        name: track.artistName,
        image: current?.image || track.albumCover,
        genre: current?.genre || '',
        monthlyListeners: (current?.monthlyListeners ?? 0) + track.playCount,
        followers: current?.followers ?? 0,
        bio: current?.bio || '',
        verified: current?.verified ?? false,
      });
    }

    for (const album of albumsQuery.data ?? []) {
      const current = byName.get(album.artistName);
      byName.set(album.artistName, {
        id: current?.id || album.artistId,
        name: album.artistName,
        image: current?.image || album.coverUrl || getArtistImage(album.artistName, catalogTracks.tracks),
        genre: current?.genre || album.genre || '',
        monthlyListeners: current?.monthlyListeners ?? 0,
        followers: current?.followers ?? 0,
        bio: current?.bio || album.description || '',
        verified: current?.verified ?? false,
      });
    }

    return Array.from(byName.values()).sort((a, b) => b.monthlyListeners - a.monthlyListeners);
  }, [albumsQuery.data, catalogTracks.tracks]);

  return {
    data: artists,
    isLoading: catalogTracks.isLoading || albumsQuery.isLoading,
    error: catalogTracks.error || (albumsQuery.error instanceof Error ? albumsQuery.error.message : null),
  };
}
