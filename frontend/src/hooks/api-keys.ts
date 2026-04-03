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

export const tracksKeys = {
  all: ['tracks'] as const,
  catalog: () => [...tracksKeys.all, 'catalog'] as const,
  adminList: () => [...tracksKeys.all, 'adminList'] as const,
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

export const QUERY_KEYS = {
  auth: authKeys,
  adminAuth: adminAuthKeys,
  tracks: tracksKeys,
  playlists: playlistKeys,
  podcasts: podcastKeys,
} as const;
