import type { BackendSong } from '../types/media/song-api.types';
import type { AdminTrack } from '../types/admin/admin-tracks.types';

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

export const mapBackendSongToAdminTrack = (song: BackendSong, index: number): AdminTrack => {
  const albumRecord = song.albumId && typeof song.albumId !== 'string' ? song.albumId : null;

  return {
    id: song._id,
    backendId: song._id,
    title: song.title,
    artistId: song.artist,
    artistName: song.artist,
    albumId: (typeof song.albumId === 'string' && song.albumId) || '',
    albumTitle: albumRecord?.title || song.album || '',
    albumCover: toCoverUrl(albumRecord?.coverImage || song.coverImage),
    duration: song.duration,
    playCount: song.plays || 0,
    liked: false,
    genreId: song.genre || '',
    moodId: song.mood || '',
    tagsId: '',
    seqNum: index + 1,
    adult: false,
    info: '',
    coverImage: song.coverImage,
    genre: song.genre,
    mood: song.mood,
    artist: song.artist,
    album: albumRecord?.title || song.album,
    plays: song.plays,
    sourceFilePath: song.filePath,
  };
};
