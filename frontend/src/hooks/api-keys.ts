export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

export const adminAuthKeys = {
  all: ['adminAuth'] as const,
  currentAdmin: () => [...adminAuthKeys.all, 'currentAdmin'] as const,
  session: () => [...adminAuthKeys.all, 'session'] as const,
};

export const adminUsersKeys = {
  all: ['adminUsers'] as const,
  list: () => [...adminUsersKeys.all, 'list'] as const,
};

export const tracksKeys = {
  all: ['tracks'] as const,
  catalog: () => [...tracksKeys.all, 'catalog'] as const,
  adminList: () => [...tracksKeys.all, 'adminList'] as const,
  mine: () => [...tracksKeys.all, 'mine'] as const,
};

export const albumKeys = {
  all: ['albums'] as const,
  list: () => [...albumKeys.all, 'list'] as const,
  detail: (id: string) => [...albumKeys.all, 'detail', id] as const,
  saved: () => [...albumKeys.all, 'saved'] as const,
  mine: () => [...albumKeys.all, 'mine'] as const,
};

export const playlistKeys = {
  all: ['playlists'] as const,
};

export const podcastKeys = {
  all: ['podcasts'] as const,
  list: () => [...podcastKeys.all, 'list'] as const,
  detail: (id: string) => [...podcastKeys.all, 'detail', id] as const,
  episode: (id: string) => [...podcastKeys.all, 'episode', id] as const,
};

export const audiobookKeys = {
  all: ['audiobooks'] as const,
  list: () => [...audiobookKeys.all, 'list'] as const,
  detail: (id: string) => [...audiobookKeys.all, 'detail', id] as const,
  chapter: (id: string) => [...audiobookKeys.all, 'chapter', id] as const,
  saved: () => [...audiobookKeys.all, 'saved'] as const,
  progress: (id: string) => [...audiobookKeys.all, 'progress', id] as const,
};

export const QUERY_KEYS = {
  auth: authKeys,
  adminAuth: adminAuthKeys,
  adminUsers: adminUsersKeys,
  tracks: tracksKeys,
  albums: albumKeys,
  playlists: playlistKeys,
  podcasts: podcastKeys,
  audiobooks: audiobookKeys,
} as const;
