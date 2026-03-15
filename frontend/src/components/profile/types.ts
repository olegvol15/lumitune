export type CreatorTrack = {
  id: string;
  title: string;
  artistName: string;
  albumCover: string;
  duration: number;
  genre: string;
  mood: string;
  audioFileName?: string;
  releaseDate: string;
  likes: number;
};

export type CreatorAlbum = {
  id: string;
  title: string;
  coverImage: string;
  trackIds: string[];
};

export type TrackModalMode = "create" | "edit";

export type TrackModalState =
  | { open: false; trackId?: undefined }
  | { open: true; mode: TrackModalMode; trackId?: string };
