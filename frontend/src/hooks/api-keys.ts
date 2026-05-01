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

export const adminDashboardKeys = {
  all: ['adminDashboard'] as const,
  summary: () => [...adminDashboardKeys.all, 'summary'] as const,
};

export const adminGenresKeys = {
  all: ['adminGenres'] as const,
  list: () => [...adminGenresKeys.all, 'list'] as const,
};

export const adminMoodsKeys = {
  all: ['adminMoods'] as const,
  list: () => [...adminMoodsKeys.all, 'list'] as const,
};

export const moodKeys = {
  all: ['moods'] as const,
  list: () => [...moodKeys.all, 'list'] as const,
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

export const followKeys = {
  all: ['follows'] as const,
  followingIds: () => [...followKeys.all, 'followingIds'] as const,
  userProfile: (id: string) => [...followKeys.all, 'userProfile', id] as const,
  followers: (id: string) => [...followKeys.all, 'followers', id] as const,
  following: (id: string) => [...followKeys.all, 'following', id] as const,
  followedArtists: () => [...followKeys.all, 'followedArtists'] as const,
  artistStatus: (id: string) => [...followKeys.all, 'artistStatus', id] as const,
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
  adminDashboard: adminDashboardKeys,
  adminGenres: adminGenresKeys,
  adminMoods: adminMoodsKeys,
  adminUsers: adminUsersKeys,
  moods: moodKeys,
  tracks: tracksKeys,
  albums: albumKeys,
  playlists: playlistKeys,
  follows: followKeys,
  podcasts: podcastKeys,
  audiobooks: audiobookKeys,
} as const;
