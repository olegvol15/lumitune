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
  backendId?: string;
  coverImage?: string;
  genre?: string;
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
  tracks: AdminTrack[];
  isLoading: boolean;
  error: string | null;
  selected: Set<string>;
  search: string;
  page: number;
  pageSize: number;
  modal: AdminTrackModalState;
  setSearch: (q: string) => void;
  setPage: (p: number) => void;
  fetchTracks: () => Promise<void>;
  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  openNew: () => void;
  openEdit: (track: AdminTrack) => void;
  closeModal: () => void;
  saveTrack: (track: AdminTrack, audioFile?: File | null) => Promise<{ ok: boolean; error?: string }>;
  deleteTrack: (id: string) => Promise<{ ok: boolean; error?: string }>;
  deleteSelected: () => Promise<{ ok: boolean; error?: string }>;
}
