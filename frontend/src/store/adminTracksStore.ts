import { create } from 'zustand';
import { tracks as seedTracks } from '../data/tracks';

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

function seedAdminTracks(): AdminTrack[] {
  return seedTracks.map((t, i) => ({
    ...t,
    genreId: 'pop',
    tagsId: 'top-100',
    seqNum: i + 1,
    adult: false,
    info: '',
  }));
}

const STORAGE_KEY = 'admin_tracks';

function loadTracks(): AdminTrack[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return seedAdminTracks();
}

function saveTracks(tracks: AdminTrack[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

interface ModalState {
  open: boolean;
  mode: 'new' | 'edit';
  track: AdminTrack | null;
}

interface AdminTracksStore {
  tracks: AdminTrack[];
  selected: Set<string>;
  search: string;
  page: number;
  pageSize: number;
  modal: ModalState;
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

export const useAdminTracksStore = create<AdminTracksStore>((set, get) => ({
  tracks: loadTracks(),
  selected: new Set(),
  search: '',
  page: 1,
  pageSize: 10,
  modal: { open: false, mode: 'new', track: null },

  setSearch: (q) => set({ search: q, page: 1 }),
  setPage: (p) => set({ page: p }),

  toggleSelect: (id) => {
    const selected = new Set(get().selected);
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    set({ selected });
  },

  selectAll: (ids) => set({ selected: new Set(ids) }),
  clearSelection: () => set({ selected: new Set() }),

  openNew: () =>
    set({
      modal: {
        open: true,
        mode: 'new',
        track: {
          id: `t${Date.now()}`,
          title: '',
          artistId: '',
          artistName: '',
          albumId: '',
          albumTitle: '',
          albumCover: '',
          duration: 0,
          playCount: 0,
          liked: false,
          genreId: '',
          tagsId: '',
          seqNum: get().tracks.length + 1,
          adult: false,
          info: '',
        },
      },
    }),

  openEdit: (track) => set({ modal: { open: true, mode: 'edit', track } }),
  closeModal: () => set({ modal: { open: false, mode: 'new', track: null } }),

  saveTrack: (track) => {
    const tracks = get().tracks;
    const idx = tracks.findIndex((t) => t.id === track.id);
    const updated =
      idx === -1
        ? [track, ...tracks]
        : tracks.map((t) => (t.id === track.id ? track : t));
    saveTracks(updated);
    set({ tracks: updated, modal: { open: false, mode: 'new', track: null } });
  },

  deleteTrack: (id) => {
    const updated = get().tracks.filter((t) => t.id !== id);
    saveTracks(updated);
    const selected = new Set(get().selected);
    selected.delete(id);
    set({ tracks: updated, selected });
  },

  deleteSelected: () => {
    const selected = get().selected;
    const updated = get().tracks.filter((t) => !selected.has(t.id));
    saveTracks(updated);
    set({ tracks: updated, selected: new Set() });
  },
}));
