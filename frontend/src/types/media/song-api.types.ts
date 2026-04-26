interface BackendSongAlbum {
  _id: string;
  title: string;
  artistName: string;
  coverImage?: string;
}

export interface BackendSong {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  albumId?: string | BackendSongAlbum;
  genre?: string;
  mood?: string;
  duration: number;
  filePath: string;
  coverImage?: string;
  plays: number;
  createdAt?: string;
  uploadedBy?: {
    _id: string;
    username: string;
  };
}

export interface SongsResponse {
  success: boolean;
  songs: BackendSong[];
}

export interface SongResponse {
  success: boolean;
  song: BackendSong;
}
