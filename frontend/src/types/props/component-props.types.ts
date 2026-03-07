import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Artist, Track, Album } from '../index';

export interface PlayerControlsProps {
  size?: 'sm' | 'lg';
}

export interface ProgressBarProps {
  progress: number;
  onSeek?: (progress: number) => void;
  duration?: number;
  className?: string;
}

export interface AuthLogoProps {
  heading: string;
  brand?: boolean;
}

export interface StepBarProps {
  currentStep: number;
  totalSteps: number;
}

export interface LogoIconProps {
  className?: string;
}

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'auth-outline';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'pill' | 'rect';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
}

export interface MediaCardProps {
  image: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

export interface PasswordRequirementProps {
  met: boolean;
  label: string;
}

export interface TrackRowProps {
  track: Track;
  index?: number;
  queue?: Track[];
  showIndex?: boolean;
  showPlayCount?: boolean;
}

export interface MoodPillProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface SectionHeaderProps {
  title: string;
  showAll?: string;
  onShowAll?: () => void;
}

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
}

export interface ArtistSectionProps {
  title: string;
  accentWord: string;
  artists: Artist[];
  onArtistClick?: (artist: Artist) => void;
}

export type HorizontalSectionItem = Album | Track;

export interface HorizontalSectionProps {
  title: string;
  accentWord: string;
  items: HorizontalSectionItem[];
  onItemClick?: (item: HorizontalSectionItem) => void;
}
