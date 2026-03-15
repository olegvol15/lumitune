export interface BackendPlaylistSong {
  _id: string;
}

export interface BackendPlaylist {
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  songs: BackendPlaylistSong[];
}

export interface PlaylistResponse {
  success: boolean;
  playlist: BackendPlaylist;
}

export interface PlaylistsResponse {
  success: boolean;
  playlists: BackendPlaylist[];
}
