import type { SettingsSelectOption } from '../types/settings/settings.types';

export const LANGUAGE_OPTIONS: SettingsSelectOption[] = [
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'English' },
];

export const THEME_OPTIONS: SettingsSelectOption[] = [
  { value: 'base', label: 'Основна' },
  { value: 'night', label: 'Нічна' },
  { value: 'ice', label: 'Холодна' },
  { value: 'violet', label: 'Фіол' },
];
