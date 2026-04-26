import { tracks as seedTracks } from '../data/tracks';
import type { AdminTrack } from '../types/admin/admin-tracks.types';

export const ADMIN_TRACKS_STORAGE_KEY = 'admin_tracks';

const seedAdminTracks = (): AdminTrack[] => {
  return seedTracks.map((t, i) => ({
    ...t,
    genreId: 'pop',
    moodId: '',
    tagsId: 'top-100',
    seqNum: i + 1,
    adult: false,
    info: '',
  }));
};

export const loadAdminTracks = (): AdminTrack[] => {
  try {
    const saved = localStorage.getItem(ADMIN_TRACKS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    return seedAdminTracks();
  }

  return seedAdminTracks();
};

export const saveAdminTracks = (tracks: AdminTrack[]) => {
  localStorage.setItem(ADMIN_TRACKS_STORAGE_KEY, JSON.stringify(tracks));
};
