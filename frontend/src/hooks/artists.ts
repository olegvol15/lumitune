import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import artistsApi from '../api/artistsApi';
import songsApi from '../api/songsApi';
import type { Artist } from '../types';
import { useAlbumsQuery } from './albums';
import { artistKeys, tracksKeys } from './api-keys';
import { useCatalogTracks } from './tracks';

const getArtistImage = (artistName: string, tracks: ReturnType<typeof useCatalogTracks>['tracks']) =>
  tracks.find((track) => track.artistName === artistName)?.albumCover || '/vite.svg';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function useArtistsQuery() {
  const catalogTracks = useCatalogTracks();
  const albumsQuery = useAlbumsQuery();
  const artistProfilesQuery = useQuery({
    queryKey: artistKeys.list(),
    queryFn: artistsApi.list,
  });
  const artistStatsQuery = useQuery({
    queryKey: tracksKeys.artistListenerStats(),
    queryFn: songsApi.listArtistListenerStats,
  });

  const artists = useMemo<Artist[]>(() => {
    const bySlug = new Map<string, Artist>();
    const monthlyListenersByName = new Map(
      (artistStatsQuery.data ?? []).map((artist) => [
        artist.artistName,
        artist.monthlyListeners,
      ])
    );

    for (const artist of artistProfilesQuery.data ?? []) {
      bySlug.set(artist.id, artist);
    }

    for (const track of catalogTracks.tracks) {
      const artistId = track.artistId || slugify(track.artistName);
      const current = bySlug.get(artistId);
      const next = {
        id: current?.id || artistId,
        backendId: current?.backendId,
        name: track.artistName,
        image: current?.image || track.albumCover,
        bannerImage: current?.bannerImage,
        genre: current?.genre || '',
        monthlyListeners: monthlyListenersByName.get(track.artistName) ?? 0,
        followers: current?.followers ?? 0,
        trackCount: current?.trackCount,
        bio: current?.bio || '',
        verified: current?.verified ?? false,
        artistUserId: current?.artistUserId || track.uploadedById,
        isFollowable: Boolean(current?.artistUserId || track.uploadedById),
      };
      bySlug.set(next.id, next);
    }

    for (const album of albumsQuery.data ?? []) {
      const artistId = album.artistId || slugify(album.artistName);
      const current = bySlug.get(artistId);
      const next = {
        id: current?.id || artistId,
        backendId: current?.backendId,
        name: album.artistName,
        image: current?.image || album.coverUrl || getArtistImage(album.artistName, catalogTracks.tracks),
        bannerImage: current?.bannerImage,
        genre: current?.genre || album.genre || '',
        monthlyListeners: current?.monthlyListeners ?? monthlyListenersByName.get(album.artistName) ?? 0,
        followers: current?.followers ?? 0,
        trackCount: current?.trackCount,
        bio: current?.bio || album.description || '',
        verified: current?.verified ?? false,
        artistUserId: current?.artistUserId || album.artistUserId,
        isFollowable: Boolean(current?.artistUserId || album.artistUserId),
      };
      bySlug.set(next.id, next);
    }

    return Array.from(bySlug.values()).sort((a, b) => b.monthlyListeners - a.monthlyListeners);
  }, [albumsQuery.data, artistProfilesQuery.data, artistStatsQuery.data, catalogTracks.tracks]);

  return {
    data: artists,
    isLoading:
      catalogTracks.isLoading ||
      albumsQuery.isLoading ||
      artistProfilesQuery.isLoading ||
      artistStatsQuery.isLoading,
    error:
      catalogTracks.error ||
      (albumsQuery.error instanceof Error ? albumsQuery.error.message : null) ||
      (artistProfilesQuery.error instanceof Error ? artistProfilesQuery.error.message : null) ||
      (artistStatsQuery.error instanceof Error ? artistStatsQuery.error.message : null),
  };
}
