import type { BackendSong } from '../api/adminSongsApi';
import type { AdminTrack } from '../types/admin/admin-tracks.types';

export const mapBackendSongToAdminTrack = (song: BackendSong, index: number): AdminTrack => ({
  id: song._id,
  backendId: song._id,
  title: song.title,
  artistId: song.artist,
  artistName: song.artist,
  albumId: song.album || '',
  albumTitle: song.album || '',
  albumCover: song.coverImage && song.coverImage !== 'default-album-cover.jpg' ? song.coverImage : '/vite.svg',
  duration: song.duration,
  playCount: song.plays || 0,
  liked: false,
  genreId: song.genre || '',
  tagsId: '',
  seqNum: index + 1,
  adult: false,
  info: '',
  coverImage: song.coverImage,
  genre: song.genre,
  artist: song.artist,
  album: song.album,
  plays: song.plays,
  sourceFilePath: song.filePath,
});
