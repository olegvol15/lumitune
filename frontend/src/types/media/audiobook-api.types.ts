export interface BackendAudiobook {
  _id: string;
  title: string;
  authorName: string;
  description: string;
  coverImage?: string;
  genre?: string;
  publishedAt: string;
  totalDuration: number;
  chapterCount: number;
  createdAt: string;
}

export interface BackendAudiobookChapter {
  _id: string;
  audiobook: string | BackendAudiobook;
  title: string;
  description?: string;
  filePath: string;
  coverImage?: string;
  duration: number;
  chapterNumber: number;
  plays: number;
  publishedAt: string;
}

export interface BackendAudiobookProgress {
  _id: string;
  audiobookId: string;
  currentChapterId: string;
  progressSeconds: number;
  progressPct: number;
  lastPlayedAt: string;
}

export interface AudiobooksResponse {
  success: boolean;
  audiobooks: BackendAudiobook[];
  savedIds?: string[];
  progressByAudiobookId?: Record<
    string,
    {
      currentChapterId: string;
      progressSeconds: number;
      progressPct: number;
    }
  >;
}

export interface AudiobookResponse {
  success: boolean;
  audiobook: BackendAudiobook;
  chapters: BackendAudiobookChapter[];
  saved?: boolean;
  progress?: BackendAudiobookProgress | null;
}

export interface AudiobookChapterResponse {
  success: boolean;
  chapter: BackendAudiobookChapter;
}

export interface SavedAudiobooksResponse {
  success: boolean;
  audiobooks: BackendAudiobook[];
}

export interface SaveAudiobookResponse {
  success: boolean;
  saved: boolean;
}

export interface AudiobookProgressResponse {
  success: boolean;
  progress: BackendAudiobookProgress | null;
}
