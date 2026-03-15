import type { ReactNode } from 'react';

export type SettingsToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export type SettingsSelectOption = {
  value: string;
  label: string;
};

export type SettingsSelectProps = {
  value: string;
  options: SettingsSelectOption[];
  onChange: (value: string) => void;
};

export type SettingsItemProps = {
  title: string;
  description?: string;
  control: ReactNode;
  compact?: boolean;
};
