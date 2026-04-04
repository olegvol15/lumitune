import type { BackendPlaylist } from '../types/media/playlist-api.types';
import type { BackendAlbum } from '../types/media/album-api.types';
import type { BackendSong } from '../types/media/song-api.types';
import type { CreatorAlbum, CreatorTrack } from '../types/profile/profile.types';

export const RELEASE_DATES = ['12.11.2012', '24.06.2023', '10.10.2005'];
export const PROFILE_GENRES = ['Поп', 'R&B', 'K-Pop', 'Rock', 'Alternative'];
export const PROFILE_MOODS = ['Спокійний', 'Натхненний', 'Енергійний', 'Мрійливий'];

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
  const albumRecord = song.albumId && typeof song.albumId !== 'string' ? song.albumId : null;
  return {
    id: song._id,
    title: song.title,
    artistName: song.artist || 'Unknown Artist',
    albumCover: toCoverUrl(albumRecord?.coverImage || song.coverImage),
    duration: song.duration || 0,
    genre: song.genre || '',
    mood: '',
    audioFileName: song.filePath.split('/').pop(),
    releaseDate: song.createdAt ? new Date(song.createdAt).toLocaleDateString('uk-UA') : new Date().toLocaleDateString('uk-UA'),
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

export function mapBackendAlbumToCreatorAlbum(album: BackendAlbum): CreatorAlbum {
  return {
    id: album._id,
    backendId: album._id,
    title: album.title,
    coverImage: toCoverUrl(album.coverImage),
    trackIds: album.trackIds ?? [],
    artistName: album.artistName,
    year: album.releaseDate
      ? new Date(album.releaseDate).getFullYear()
      : new Date(album.publishedAt).getFullYear(),
  };
}
