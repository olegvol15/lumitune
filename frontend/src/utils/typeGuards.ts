import type { Album } from "../types";
import type { MediaItem } from "../types/media.types";

/** Returns true if the item is an Album (has a coverUrl field) */
export function isAlbum(item: MediaItem): item is Album {
  return "coverUrl" in item;
}
