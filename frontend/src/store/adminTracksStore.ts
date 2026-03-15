import { create } from 'zustand';
import type { AdminTrack, AdminTracksStore } from '../types/admin/admin-tracks.types';

const createEmptyTrackDraft = (seqNum: number): AdminTrack => ({
  id: `draft-${Date.now()}`,
  title: '',
  artistId: '',
  artistName: '',
  albumId: '',
  albumTitle: '',
  albumCover: '/vite.svg',
  duration: 0,
  playCount: 0,
  liked: false,
  genreId: '',
  tagsId: '',
  seqNum,
  adult: false,
  info: '',
  coverImage: '',
  genre: '',
  artist: '',
  album: '',
  plays: 0,
});

export const useAdminTracksStore = create<AdminTracksStore>((set, get) => ({
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

  openNew: (seqNum) =>
    set({
      modal: {
        open: true,
        mode: 'new',
        track: createEmptyTrackDraft(seqNum),
      },
    }),

  openEdit: (track) => set({ modal: { open: true, mode: 'edit', track: { ...track } } }),
  closeModal: () => set({ modal: { open: false, mode: 'new', track: null } }),
}));
