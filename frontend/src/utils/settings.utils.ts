import type { SettingsSelectOption } from '../types/settings/settings.types';

export const LANGUAGE_OPTIONS: SettingsSelectOption[] = [
  { value: 'uk-UA', label: 'Українська(UA)' },
  { value: 'en-US', label: 'English(US)' },
  { value: 'pl-PL', label: 'Polski(PL)' },
];

export const THEME_OPTIONS: SettingsSelectOption[] = [
  { value: 'base', label: 'Основна' },
  { value: 'night', label: 'Нічна' },
  { value: 'ice', label: 'Холодна' },
];
