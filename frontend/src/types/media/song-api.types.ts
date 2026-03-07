export interface BackendSong {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  duration: number;
  filePath: string;
  coverImage?: string;
  plays: number;
}

export interface SongsResponse {
  success: boolean;
  songs: BackendSong[];
}
