import { create } from 'zustand';
import type { AdminTracksStore } from '../types/admin/admin-tracks.types';
import { loadAdminTracks, saveAdminTracks } from '../utils/admin-tracks.utils';

export const useAdminTracksStore = create<AdminTracksStore>((set, get) => ({
  tracks: loadAdminTracks(),
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
    saveAdminTracks(updated);
    set({ tracks: updated, modal: { open: false, mode: 'new', track: null } });
  },

  deleteTrack: (id) => {
    const updated = get().tracks.filter((t) => t.id !== id);
    saveAdminTracks(updated);
    const selected = new Set(get().selected);
    selected.delete(id);
    set({ tracks: updated, selected });
  },

  deleteSelected: () => {
    const selected = get().selected;
    const updated = get().tracks.filter((t) => !selected.has(t.id));
    saveAdminTracks(updated);
    set({ tracks: updated, selected: new Set() });
  },
}));
