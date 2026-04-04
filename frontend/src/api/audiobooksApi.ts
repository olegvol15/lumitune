import apiClient from '../lib/apiClient';
import type {
  AudiobookChapterResponse,
  AudiobookProgressResponse,
  AudiobookResponse,
  AudiobooksResponse,
  BackendAudiobook,
  BackendAudiobookChapter,
  BackendAudiobookProgress,
  SavedAudiobooksResponse,
  SaveAudiobookResponse,
} from '../types/media/audiobook-api.types';
import type { Audiobook, AudiobookChapter, AudiobookProgress } from '../types';

function coverUrl(path?: string): string {
  if (!path || path === 'default-podcast-cover.jpg') return '/default-cover.jpg';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

function mapProgress(progress?: BackendAudiobookProgress | null): AudiobookProgress | null {
  if (!progress) return null;
  return {
    audiobookId: progress.audiobookId,
    currentChapterId: progress.currentChapterId,
    progressSeconds: progress.progressSeconds,
    progressPct: progress.progressPct,
    lastPlayedAt: progress.lastPlayedAt,
  };
}

export function mapBackendAudiobook(
  audiobook: BackendAudiobook,
  options?: {
    saved?: boolean;
    progress?: BackendAudiobookProgress | null;
  }
): Audiobook {
  return {
    id: audiobook._id,
    title: audiobook.title,
    author: audiobook.authorName,
    coverUrl: coverUrl(audiobook.coverImage),
    genre: audiobook.genre ?? '',
    description: audiobook.description,
    publishedAt: audiobook.publishedAt,
    duration: audiobook.totalDuration ?? 0,
    chapterCount: audiobook.chapterCount ?? 0,
    saved: options?.saved,
    progress: mapProgress(options?.progress),
  };
}

export function mapBackendAudiobookChapter(
  chapter: BackendAudiobookChapter,
  audiobook?: BackendAudiobook
): AudiobookChapter {
  const book =
    typeof chapter.audiobook === 'string' ? audiobook : (chapter.audiobook as BackendAudiobook);
  return {
    id: chapter._id,
    audiobookId: book?._id ?? (typeof chapter.audiobook === 'string' ? chapter.audiobook : ''),
    audiobookTitle: book?.title ?? '',
    audiobookCover: coverUrl(chapter.coverImage ?? book?.coverImage),
    author: book?.authorName ?? '',
    title: chapter.title,
    description: chapter.description ?? '',
    duration: chapter.duration,
    chapterNumber: chapter.chapterNumber,
    publishedAt: chapter.publishedAt,
    plays: chapter.plays,
  };
}

const audiobooksApi = {
  list: async (): Promise<Audiobook[]> => {
    const { data } = await apiClient.get<AudiobooksResponse>('/audiobooks');
    return data.audiobooks.map((audiobook) =>
      mapBackendAudiobook(audiobook, {
        saved: data.savedIds?.includes(audiobook._id),
        progress: data.progressByAudiobookId?.[audiobook._id]
          ? {
              _id: audiobook._id,
              audiobookId: audiobook._id,
              currentChapterId: data.progressByAudiobookId[audiobook._id].currentChapterId,
              progressSeconds: data.progressByAudiobookId[audiobook._id].progressSeconds,
              progressPct: data.progressByAudiobookId[audiobook._id].progressPct,
              lastPlayedAt: '',
            }
          : null,
      })
    );
  },

  getById: async (
    id: string
  ): Promise<{ audiobook: Audiobook; chapters: AudiobookChapter[]; saved: boolean; progress: AudiobookProgress | null }> => {
    const { data } = await apiClient.get<AudiobookResponse>(`/audiobooks/${id}`);
    return {
      audiobook: mapBackendAudiobook(data.audiobook, {
        saved: data.saved,
        progress: data.progress ?? null,
      }),
      chapters: data.chapters.map((chapter) => mapBackendAudiobookChapter(chapter, data.audiobook)),
      saved: Boolean(data.saved),
      progress: mapProgress(data.progress),
    };
  },

  getChapterById: async (chapterId: string): Promise<AudiobookChapter> => {
    const { data } = await apiClient.get<AudiobookChapterResponse>(`/audiobooks/chapters/${chapterId}`);
    const audiobook =
      typeof data.chapter.audiobook === 'string' ? undefined : (data.chapter.audiobook as BackendAudiobook);
    return mapBackendAudiobookChapter(data.chapter, audiobook);
  },

  listSaved: async (): Promise<Audiobook[]> => {
    const { data } = await apiClient.get<SavedAudiobooksResponse>('/audiobooks/saved');
    return data.audiobooks.map((audiobook) => mapBackendAudiobook(audiobook, { saved: true }));
  },

  save: async (audiobookId: string): Promise<boolean> => {
    const { data } = await apiClient.post<SaveAudiobookResponse>(`/audiobooks/saved/${audiobookId}`);
    return data.saved;
  },

  unsave: async (audiobookId: string): Promise<boolean> => {
    const { data } = await apiClient.delete<SaveAudiobookResponse>(`/audiobooks/saved/${audiobookId}`);
    return data.saved;
  },

  getProgress: async (audiobookId: string): Promise<AudiobookProgress | null> => {
    const { data } = await apiClient.get<AudiobookProgressResponse>(`/audiobooks/progress/${audiobookId}`);
    return mapProgress(data.progress);
  },

  updateProgress: async (audiobookId: string, payload: {
    chapterId: string;
    progressSeconds: number;
    progressPct: number;
  }) => {
    const { data } = await apiClient.put<AudiobookProgressResponse>(
      `/audiobooks/progress/${audiobookId}`,
      payload
    );
    return mapProgress(data.progress);
  },

  create: (formData: FormData) =>
    apiClient.post('/admin/audiobooks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    apiClient.put(`/admin/audiobooks/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  remove: (id: string) => apiClient.delete(`/admin/audiobooks/${id}`),

  uploadChapter: (audiobookId: string, formData: FormData) =>
    apiClient.post(`/admin/audiobooks/${audiobookId}/chapters`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateChapter: (chapterId: string, formData: FormData) =>
    apiClient.put(`/admin/audiobooks/chapters/${chapterId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  removeChapter: (chapterId: string) => apiClient.delete(`/admin/audiobooks/chapters/${chapterId}`),

  chapterStreamUrl: (chapterId: string) => `/api/audiobooks/chapters/${chapterId}/stream`,
};

export default audiobooksApi;
