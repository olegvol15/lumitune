import type { Audiobook } from '../types';

export const audiobooks: Audiobook[] = [
  {
    id: 'ab1',
    title: 'Тінь минулого',
    author: 'Олена Коваль',
    coverUrl: 'https://picsum.photos/seed/audiobook1/300/300',
    genre: 'Трилер',
    description:
      'Захоплюючий психологічний трилер про темні таємниці маленького містечка та детектива, який намагається їх розкрити.',
    publishedAt: '10 лист 2023',
    duration: 28800,
  },
  {
    id: 'ab2',
    title: 'Остання надія',
    author: 'Максим Лисенко',
    coverUrl: 'https://picsum.photos/seed/audiobook2/300/300',
    genre: 'Фантастика',
    description:
      'Постапокаліптична фантастика про виживання людства після кліматичної катастрофи та пошук нового дому серед зірок.',
    publishedAt: '5 січ 2024',
    duration: 36000,
  },
  {
    id: 'ab3',
    title: 'Голоси снів',
    author: 'Анна Мельник',
    coverUrl: 'https://picsum.photos/seed/audiobook3/300/300',
    genre: 'Магічний реалізм',
    description:
      'Містична розповідь про молоду жінку, яка починає чути голоси людей зі своїх снів і поступово відкриває їхні таємниці.',
    publishedAt: '20 лют 2024',
    duration: 21600,
  },
];
