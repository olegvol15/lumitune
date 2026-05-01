import { useQuery } from '@tanstack/react-query';
import recentlyPlayedApi from '../api/recentlyPlayedApi';
import { useAuthStore } from '../store/authStore';
import { mapBackendAudiobook } from '../api/audiobooksApi';
import { mapBackendEpisode } from '../api/podcastsApi';
import { mapBackendSongToTrack } from '../utils/song-catalog.utils';
import { recentlyPlayedKeys } from './api-keys';
import type { Audiobook, Episode, Track } from '../types';

const RECENTLY_PLAYED_STORAGE_KEY = 'lumitune_recently_played';
const RECENTLY_PLAYED_LIMIT = 6;

export type RecentlyPlayedItem =
  | {
      type: 'song';
      track: Track;
      playedAt: string;
    }
  | {
      type: 'podcast';
      episode: Episode;
      playedAt: string;
    }
  | {
      type: 'audiobook';
      audiobook: Audiobook;
      chapterId: string;
      playedAt: string;
    };

const getRecentlyPlayedItemKey = (item: RecentlyPlayedItem) => {
  if (item.type === 'song') return `${item.type}-${item.track.id}`;
  if (item.type === 'podcast') return `${item.type}-${item.episode.id}`;
  return `${item.type}-${item.chapterId}`;
};

export function readRecentlyPlayedStorage(): RecentlyPlayedItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(RECENTLY_PLAYED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, RECENTLY_PLAYED_LIMIT) : [];
  } catch {
    return [];
  }
}

export function writeRecentlyPlayedStorage(items: RecentlyPlayedItem[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      RECENTLY_PLAYED_STORAGE_KEY,
      JSON.stringify(items.slice(0, RECENTLY_PLAYED_LIMIT))
    );
  } catch {
    // Ignore storage failures; server history still works.
  }
}

export function mergeRecentlyPlayedItems(
  primary: RecentlyPlayedItem[],
  secondary: RecentlyPlayedItem[]
) {
  const seen = new Set<string>();
  return [...primary, ...secondary]
    .filter((item) => {
      const key = getRecentlyPlayedItemKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => Date.parse(b.playedAt) - Date.parse(a.playedAt))
    .slice(0, RECENTLY_PLAYED_LIMIT);
}

export function useRecentlyPlayedQuery(limit = 6) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: [...recentlyPlayedKeys.list(), limit],
    queryFn: async () => {
      const items = await recentlyPlayedApi.list(limit);
      const serverItems = items.map((item): RecentlyPlayedItem => {
        if (item.type === 'song') {
          return {
            type: 'song' as const,
            track: mapBackendSongToTrack(item.song),
            playedAt: item.playedAt,
          };
        }

        if (item.type === 'podcast') {
          return {
            type: 'podcast' as const,
            episode: mapBackendEpisode(item.episode, item.podcast),
            playedAt: item.playedAt,
          };
        }

        return {
          type: 'audiobook' as const,
          audiobook: mapBackendAudiobook(item.audiobook),
          chapterId: item.chapterId,
          playedAt: item.playedAt,
        };
      });
      return mergeRecentlyPlayedItems(readRecentlyPlayedStorage(), serverItems).slice(0, limit);
    },
    initialData: () => readRecentlyPlayedStorage().slice(0, limit),
    enabled: isAuthenticated,
  });
}
