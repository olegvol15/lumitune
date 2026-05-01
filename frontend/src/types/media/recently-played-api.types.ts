import type { BackendAudiobook } from './audiobook-api.types';
import type { BackendEpisode, BackendPodcast } from './podcast-api.types';
import type { BackendSong } from './song-api.types';

export type RecentlyPlayedRecordPayload =
  | {
      itemType: 'song';
      itemId: string;
    }
  | {
      itemType: 'podcast_episode';
      itemId: string;
      parentId: string;
    }
  | {
      itemType: 'audiobook_chapter';
      itemId: string;
      parentId: string;
    };

export type RecentlyPlayedApiItem =
  | {
      type: 'song';
      song: BackendSong;
      playedAt: string;
    }
  | {
      type: 'podcast';
      episode: BackendEpisode;
      podcast: BackendPodcast;
      playedAt: string;
    }
  | {
      type: 'audiobook';
      audiobook: BackendAudiobook;
      chapterId: string;
      playedAt: string;
    };

export interface RecentlyPlayedResponse {
  success: boolean;
  items: RecentlyPlayedApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
