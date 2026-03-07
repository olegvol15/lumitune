import type { Track } from '../types';
import type { BackendSong } from '../types/media/song-api.types';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toCoverUrl = (coverImage?: string): string => {
  if (!coverImage || coverImage === 'default-album-cover.jpg') {
    return '/vite.svg';
  }

  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
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

export const mapBackendSongToTrack = (song: BackendSong): Track => {
  const artistName = song.artist?.trim() || 'Unknown Artist';
  const albumTitle = song.album?.trim() || 'Singles';
  const artistSlug = slugify(artistName) || 'unknown-artist';
  const albumSlug = slugify(albumTitle) || 'single';

  return {
    id: song._id,
    title: song.title,
    artistId: artistSlug,
    artistName,
    albumId: `${artistSlug}-${albumSlug}`,
    albumTitle,
    albumCover: toCoverUrl(song.coverImage),
    duration: song.duration || 0,
    playCount: song.plays || 0,
    liked: false,
  };
};
