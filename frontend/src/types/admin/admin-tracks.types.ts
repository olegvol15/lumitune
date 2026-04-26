export interface AdminTrack {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumTitle: string;
  albumCover: string;
  duration: number;
  playCount: number;
  liked: boolean;
  genreId: string;
  moodId: string;
  tagsId: string;
  seqNum: number;
  adult: boolean;
  info: string;
  backendId?: string;
  coverImage?: string;
  genre?: string;
  mood?: string;
  artist?: string;
  album?: string;
  plays?: number;
  sourceFilePath?: string;
}

export interface AdminTrackModalState {
  open: boolean;
  mode: 'new' | 'edit';
  track: AdminTrack | null;
}

export interface AdminTracksStore {
  selected: Set<string>;
  search: string;
  page: number;
  pageSize: number;
  modal: AdminTrackModalState;
  setSearch: (q: string) => void;
  setPage: (p: number) => void;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  openNew: (seqNum: number) => void;
  openEdit: (track: AdminTrack) => void;
  closeModal: () => void;
}
