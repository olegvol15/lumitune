import type { AppLanguage } from '../store/languageStore';

const PODCAST_CATEGORY_PAIRS = [
  ['Technology', 'Технології'],
  ['Science', 'Наука'],
  ['Business', 'Бізнес'],
  ['Health', "Здоров'я"],
  ['Education', 'Освіта'],
  ['Society', 'Суспільство'],
  ['Crime', 'Злочин'],
  ['Arts', 'Мистецтво'],
  ['Sports', 'Спорт'],
  ['Entertainment', 'Розваги'],
] as const;

export function localizePodcastCategory(category: string | undefined, language: AppLanguage) {
  if (!category) return '';
  const normalized = category.trim().toLowerCase();
  const match = PODCAST_CATEGORY_PAIRS.find(([en, uk]) =>
    en.toLowerCase() === normalized || uk.toLowerCase() === normalized
  );

  if (!match) return category;
  return language === 'uk' ? match[1] : match[0];
}
