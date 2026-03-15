import type { ReactNode } from 'react';

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

export type TrackModalMode = 'create' | 'edit';

export type TrackModalState =
  | { open: false; trackId?: undefined }
  | { open: true; mode: TrackModalMode; trackId?: string };

export type ProfileStatProps = {
  value: string;
  label: string;
};

export type ProfileSectionTitleProps = {
  title: string;
  right?: ReactNode;
};

export type ProfileHeroActionsProps = {
  onEditProfile: () => void;
  onOpenSettings: () => void;
};

export type ProfileTrackCardProps = {
  track: CreatorTrack;
  onPlay: () => void;
  onEdit: () => void;
};

export type ProfileAlbumCardProps = {
  album: CreatorAlbum;
  onClick: () => void;
};

export type ProfileFollowingCardProps = {
  name: string;
  image: string;
  listeners: string;
  onClick: () => void;
};

export type ProfileTopTrackRowProps = {
  track: CreatorTrack;
  index: number;
  onPlay: () => void;
};

export type ProfileSelectFieldProps = {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
};

export type ProfileUploadZoneProps = {
  label: string;
  sublabel: string;
  onSelect: (file: File) => void;
  compact?: boolean;
};

export type ProfileCreatorModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export type ProfileTrackEditorModalProps = {
  open: boolean;
  mode: TrackModalMode;
  initialTrack?: CreatorTrack;
  fallbackCover: string;
  genres: string[];
  moods: string[];
  onClose: () => void;
  onSave: (track: CreatorTrack) => void;
};

export type ProfileAlbumUploadModalProps = {
  open: boolean;
  tracks: CreatorTrack[];
  fallbackCover: string;
  onClose: () => void;
  onSave: (album: CreatorAlbum) => void;
};

export type ProfileEditModalProps = {
  open: boolean;
  fallbackAvatar: string;
  fallbackCover: string;
  onClose: () => void;
};
