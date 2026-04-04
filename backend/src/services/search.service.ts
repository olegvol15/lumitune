import { Song } from '../models/song.model';
import { Playlist } from '../models/playlist.model';
import { Audiobook } from '../models/audiobook.model';
import { ServiceError } from '../types/error/service-error';

export interface SearchResult {
  songs: unknown[];
  playlists: unknown[];
  audiobooks: unknown[];
  pagination: {
    page: number;
    limit: number;
    totalSongs: number;
    totalPlaylists: number;
    totalAudiobooks: number;
  };
}

export const searchService = {
  async search(query: string, page = 1, limit = 20): Promise<SearchResult> {
    if (!query || !query.trim()) {
      throw new ServiceError(400, 'Search query is required');
    }

    const q = query.trim();
    const skip = (page - 1) * limit;

    // Songs: use text index if query is more than one word, otherwise regex for partial match
    const songFilter = q.includes(' ')
      ? { $text: { $search: q } }
      : {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { artist: { $regex: q, $options: 'i' } },
            { album: { $regex: q, $options: 'i' } },
            { genre: { $regex: q, $options: 'i' } },
          ],
        };

    // Public playlists by name
    const playlistFilter = {
      isPublic: true,
      name: { $regex: q, $options: 'i' },
    };

    const audiobookFilter = q.includes(' ')
      ? { $text: { $search: q } }
      : {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { authorName: { $regex: q, $options: 'i' } },
            { genre: { $regex: q, $options: 'i' } },
          ],
        };

    const [songs, totalSongs, playlists, totalPlaylists, audiobooks, totalAudiobooks] =
      await Promise.all([
      Song.find(songFilter)
        .populate('uploadedBy', 'username')
        .skip(skip)
        .limit(limit)
        .sort({ plays: -1 }),
      Song.countDocuments(songFilter),
      Playlist.find(playlistFilter)
        .populate('owner', 'username')
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 }),
      Playlist.countDocuments(playlistFilter),
      Audiobook.find(audiobookFilter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Audiobook.countDocuments(audiobookFilter),
    ]);

    return {
      songs,
      playlists,
      audiobooks,
      pagination: { page, limit, totalSongs, totalPlaylists, totalAudiobooks },
    };
  },
};
