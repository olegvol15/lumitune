import { albums } from '../data/albums';
import type { BackendPlaylist } from '../types/media/playlist-api.types';
import type { BackendSong } from '../types/media/song-api.types';
import type { CreatorAlbum, CreatorTrack } from '../types/profile/profile.types';

export const RELEASE_DATES = ['12.11.2012', '24.06.2023', '10.10.2005'];
export const PROFILE_GENRES = ['Поп', 'R&B', 'K-Pop', 'Rock', 'Alternative'];
export const PROFILE_MOODS = ['Спокійний', 'Натхненний', 'Енергійний', 'Мрійливий'];

export function readJsonFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function buildSeedTracks(userName: string): CreatorTrack[] {
  return albums.slice(0, 5).map((album, index) => ({
    id: `creator-track-${index + 1}`,
    title: album.title,
    artistName: userName,
    albumCover: album.coverUrl,
    duration: 182,
    genre: PROFILE_GENRES[index % PROFILE_GENRES.length],
    mood: PROFILE_MOODS[index % PROFILE_MOODS.length],
    releaseDate: RELEASE_DATES[index % RELEASE_DATES.length],
    likes: 235 * (index + 1),
  }));
}

export function buildSeedAlbums(): CreatorAlbum[] {
  return albums.slice(0, 3).map((album, index) => ({
    id: `creator-album-${index + 1}`,
    title: album.title,
    coverImage: album.coverUrl,
    trackIds: [],
  }));
}

const toCoverUrl = (coverImage?: string): string => {
  if (!coverImage || coverImage === 'default-album-cover.jpg') {
    return '/vite.svg';
  }

  if (
    coverImage.startsWith('http://') ||
    coverImage.startsWith('https://') ||
    coverImage.startsWith('data:')
  ) {
    return coverImage;
  }

  if (coverImage.startsWith('/uploads/')) {
    return coverImage;
  }

  if (coverImage.startsWith('uploads/')) {
    return `/${coverImage}`;
  }

  return coverImage;
};

export function mapBackendSongToCreatorTrack(song: BackendSong): CreatorTrack {
  return {
    id: song._id,
    title: song.title,
    artistName: song.artist || 'Unknown Artist',
    albumCover: toCoverUrl(song.coverImage),
    duration: song.duration || 0,
    genre: song.genre || '',
    mood: '',
    audioFileName: song.filePath.split('/').pop(),
    releaseDate: new Date().toLocaleDateString('uk-UA'),
    likes: song.plays || 0,
  };
}

export function mapBackendPlaylistToCreatorAlbum(playlist: BackendPlaylist): CreatorAlbum {
  return {
    id: playlist._id,
    backendId: playlist._id,
    title: playlist.name,
    coverImage: toCoverUrl(playlist.coverImage),
    trackIds: playlist.songs.map((song) => song._id),
  };
}
