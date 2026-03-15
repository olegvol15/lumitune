import type { Playlist } from '../types';

export const playlists: Playlist[] = [
  {
    id: 'p1',
    title: 'Мій плейлист #1',
    description: 'Найкращі треки для гарного настрою',
    coverUrl: 'https://picsum.photos/seed/playlist1/300/300',
    trackIds: ['t1', 't4', 't10', 't12', 't14'],
    createdBy: 'user1',
    isPublic: true,
  },
  {
    id: 'p2',
    title: 'K-Pop Hits',
    description: 'Найгарячіші хіти корейської поп-музики',
    coverUrl: 'https://picsum.photos/seed/playlist2/300/300',
    trackIds: ['t1', 't2', 't3', 't4', 't5', 't6', 't7'],
    createdBy: 'user1',
    isPublic: true,
  },
  {
    id: 'p3',
    title: 'Вечірній настрій',
    description: 'Ідеальні треки для вечірнього розслаблення',
    coverUrl: 'https://picsum.photos/seed/playlist3/300/300',
    trackIds: ['t10', 't11', 't12', 't13', 't14', 't15'],
    createdBy: 'user1',
    isPublic: false,
  },
  {
    id: 'p4',
    title: 'Ранковий бустер',
    description: 'Заряд енергії на весь день',
    coverUrl: 'https://picsum.photos/seed/playlist4/300/300',
    trackIds: ['t8', 't9', 't1', 't6'],
    createdBy: 'user1',
    isPublic: true,
  },
  {
    id: 'p5',
    title: 'Улюблені треки',
    description: 'Всі треки, які мені сподобались',
    coverUrl: 'https://picsum.photos/seed/playlist5/300/300',
    trackIds: ['t1', 't3', 't4', 't6', 't8', 't10', 't12', 't14'],
    createdBy: 'user1',
    isPublic: false,
  },
];

export const getPlaylist = (id: string) => playlists.find((p) => p.id === id);
