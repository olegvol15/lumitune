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
  tagsId: string;
  seqNum: number;
  adult: boolean;
  info: string;
}

export interface AdminTrackModalState {
  open: boolean;
  mode: 'new' | 'edit';
  track: AdminTrack | null;
}

export interface AdminTracksStore {
  tracks: AdminTrack[];
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
  openNew: () => void;
  openEdit: (track: AdminTrack) => void;
  closeModal: () => void;
  saveTrack: (track: AdminTrack) => void;
  deleteTrack: (id: string) => void;
  deleteSelected: () => void;
}
