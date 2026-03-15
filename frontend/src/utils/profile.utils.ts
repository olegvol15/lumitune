import { albums } from "../data/albums";
import type { CreatorAlbum, CreatorTrack } from "../types/profile/profile.types";

export const RELEASE_DATES = ["12.11.2012", "24.06.2023", "10.10.2005"];
export const PROFILE_GENRES = ["Поп", "R&B", "K-Pop", "Rock", "Alternative"];
export const PROFILE_MOODS = ["Спокійний", "Натхненний", "Енергійний", "Мрійливий"];

export function readJsonFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function buildSeedTracks(userName: string): CreatorTrack[] {
  return albums.slice(0, 5).map((album, index) => ({
    id: `creator-track-${index + 1}`,
    title: album.title,
    artistName: userName,
    albumCover: album.coverUrl,
    duration: 182,
    genre: PROFILE_GENRES[index % PROFILE_GENRES.length],
    mood: PROFILE_MOODS[index % PROFILE_MOODS.length],
    releaseDate: RELEASE_DATES[index % RELEASE_DATES.length],
    likes: 235 * (index + 1),
  }));
}

export function buildSeedAlbums(): CreatorAlbum[] {
  return albums.slice(0, 3).map((album, index) => ({
    id: `creator-album-${index + 1}`,
    title: album.title,
    coverImage: album.coverUrl,
    trackIds: [],
  }));
}
