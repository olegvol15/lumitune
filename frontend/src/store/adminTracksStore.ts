import { create } from 'zustand';
import adminSongsApi from '../api/adminSongsApi';
import type { AdminTrack, AdminTracksStore } from '../types/admin/admin-tracks.types';
import { getApiErrorMessage } from '../utils/api-error.utils';
import { mapBackendSongToAdminTrack } from '../utils/admin-song-mapper.utils';

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
  tracks: [],
  isLoading: false,
  error: null,
  selected: new Set(),
  search: '',
  page: 1,
  pageSize: 10,
  modal: { open: false, mode: 'new', track: null },

  setSearch: (q) => set({ search: q, page: 1 }),
  setPage: (p) => set({ page: p }),

  fetchTracks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await adminSongsApi.list();
      const tracks = data.songs.map((song, index) => mapBackendSongToAdminTrack(song, index));
      set({ tracks, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Failed to load songs'),
      });
    }
  },

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
        track: createEmptyTrackDraft(get().tracks.length + 1),
      },
    }),

  openEdit: (track) => set({ modal: { open: true, mode: 'edit', track: { ...track } } }),
  closeModal: () => set({ modal: { open: false, mode: 'new', track: null } }),

  saveTrack: async (track, audioFile, coverFile) => {
    try {
      set({ error: null });

      if (get().modal.mode === 'new') {
        if (!audioFile) {
          return { ok: false, error: 'Audio file is required for new songs' };
        }

        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('title', track.title);
        formData.append('artist', track.artistName || track.artistId || track.artist || '');
        if (track.albumTitle || track.albumId || track.album) {
          formData.append('album', track.albumTitle || track.albumId || track.album || '');
        }
        if (track.genreId || track.genre) {
          formData.append('genre', track.genreId || track.genre || '');
        }
        if (coverFile) {
          formData.append('cover', coverFile);
        }

        await adminSongsApi.create(formData);
      } else {
        const songId = track.backendId || track.id;
        const formData = new FormData();
        formData.append('title', track.title);
        formData.append('artist', track.artistName || track.artistId || track.artist || '');
        formData.append('album', track.albumTitle || track.albumId || track.album || '');
        formData.append('genre', track.genreId || track.genre || '');
        if (coverFile) {
          formData.append('cover', coverFile);
        }
        await adminSongsApi.update(songId, formData);
      }

      await get().fetchTracks();
      set({ modal: { open: false, mode: 'new', track: null } });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, 'Failed to save song') };
    }
  },

  deleteTrack: async (id) => {
    try {
      const target = get().tracks.find((t) => t.id === id);
      if (!target) {
        return { ok: false, error: 'Track not found' };
      }

      await adminSongsApi.remove(target.backendId || target.id);
      await get().fetchTracks();
      const selected = new Set(get().selected);
      selected.delete(id);
      set({ selected });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, 'Failed to delete song') };
    }
  },

  deleteSelected: async () => {
    const selected = Array.from(get().selected);
    if (selected.length === 0) {
      return { ok: true };
    }

    try {
      const tracksById = new Map(get().tracks.map((track) => [track.id, track]));
      await Promise.all(
        selected.map((id) => {
          const track = tracksById.get(id);
          if (!track) return Promise.resolve();
          return adminSongsApi.remove(track.backendId || track.id);
        })
      );

      await get().fetchTracks();
      set({ selected: new Set() });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: getApiErrorMessage(error, 'Failed to delete selected songs') };
    }
  },
}));
