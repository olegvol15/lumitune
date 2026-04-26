export interface AdminGenreUsage {
  tracks: number;
  albums: number;
  audiobooks: number;
  total: number;
}

export interface AdminGenre {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  usage: AdminGenreUsage;
}

export interface BackendGenre {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendGenreWithUsage {
  genre: BackendGenre;
  usage: AdminGenreUsage;
}

export interface AdminGenresResponse {
  success: boolean;
  genres: BackendGenreWithUsage[];
}

export interface AdminGenreResponse {
  success: boolean;
  genre: BackendGenre;
}
