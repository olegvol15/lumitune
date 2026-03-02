import type { Album, Track } from "../types";

export type MediaItem = Album | Track;

/** Returns true if the item is an Album (has a coverUrl field) */
export function isAlbum(item: MediaItem): item is Album {
  return "coverUrl" in item;
}
