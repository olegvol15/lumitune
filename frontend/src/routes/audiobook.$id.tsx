import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ChevronLeft, Pause, Play, BookOpen, Clock, Bookmark } from 'lucide-react';
import { formatDuration, formatLongDuration } from '../utils/format';
import { useAudiobookQuery, useSaveAudiobookMutation } from '../hooks/audiobooks';
import { usePlayerStore } from '../store/playerStore';
import type { AudiobookChapter } from '../types';

export const Route = createFileRoute('/audiobook/$id')({
  component: AudiobookPage,
});

function AudiobookPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { data, isLoading } = useAudiobookQuery(id);
  const saveMutation = useSaveAudiobookMutation();
  const currentAudiobookChapter = usePlayerStore((s) => s.currentAudiobookChapter);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playAudiobookChapter = usePlayerStore((s) => s.playAudiobookChapter);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-white/50">Завантаження...</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-[60vh] text-white/50">Аудіокнигу не знайдено</div>;
  }

  const { audiobook, chapters, saved } = data;
  const progressChapter = audiobook.progress
    ? chapters.find((chapter) => chapter.id === audiobook.progress?.currentChapterId)
    : null;

  const handlePlay = (chapter: AudiobookChapter) => {
    if (currentAudiobookChapter?.id === chapter.id) {
      togglePlay();
      return;
    }
    playAudiobookChapter(chapter, audiobook, chapters);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={audiobook.coverUrl}
            alt={audiobook.title}
            className="w-full h-full object-cover blur-[80px] opacity-25 scale-110"
          />
        </div>
        <div className="relative z-10 px-6 pt-6 pb-10">
          <button
            onClick={() => router.history.back()}
            className="flex items-center gap-1.5 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Назад</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={audiobook.coverUrl}
              alt={audiobook.title}
              className="w-40 max-w-full rounded-xl object-contain flex-shrink-0 shadow-2xl bg-black/10"
            />
            <div className="min-w-0">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Аудіокнига</p>
              <h1 className="text-white text-3xl font-bold leading-tight mb-2">{audiobook.title}</h1>
              <p className="text-white/70 text-sm mb-2">{audiobook.author}</p>
              <div className="flex flex-wrap gap-2 text-xs text-white/60 mb-4">
                <span className="px-2 py-1 rounded-full bg-white/10">{audiobook.genre || 'Без жанру'}</span>
                <span className="px-2 py-1 rounded-full bg-white/10">{audiobook.chapterCount} розділів</span>
                <span className="px-2 py-1 rounded-full bg-white/10">{formatLongDuration(audiobook.duration)}</span>
              </div>
              <p className="text-white/55 text-sm max-w-2xl leading-relaxed">{audiobook.description}</p>

              <div className="flex flex-wrap gap-3 mt-5">
                {progressChapter && (
                  <button
                    onClick={() => playAudiobookChapter(progressChapter, audiobook, chapters)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand text-white font-medium"
                  >
                    <Play size={16} fill="currentColor" />
                    Продовжити
                  </button>
                )}
                <button
                  onClick={() => saveMutation.mutate({ audiobookId: audiobook.id, saved: Boolean(saved) })}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/80 hover:text-white"
                >
                  <Bookmark size={16} className={saved ? 'fill-current' : ''} />
                  {saved ? 'Збережено' : 'Зберегти'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-20">
        <h2 className="text-white font-bold text-xl mb-4">
          Розділи <span className="text-white/30 font-normal text-base">({chapters.length})</span>
        </h2>

        <div className="flex flex-col gap-2">
          {chapters.map((chapter) => {
            const isActive = currentAudiobookChapter?.id === chapter.id;
            const isContinueTarget = audiobook.progress?.currentChapterId === chapter.id;
            return (
              <div
                key={chapter.id}
                className={`group flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer ${
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
                onClick={() => handlePlay(chapter)}
              >
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {isActive && isPlaying ? (
                    <Pause size={20} className="text-brand" />
                  ) : (
                    <>
                      <span className="text-white/40 text-sm group-hover:hidden">{chapter.chapterNumber}</span>
                      <Play size={18} className="text-white hidden group-hover:block" fill="currentColor" />
                    </>
                  )}
                </div>

                <img
                  src={chapter.audiobookCover}
                  alt={chapter.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-brand' : 'text-white'}`}>
                      {chapter.title}
                    </p>
                    {isContinueTarget && (
                      <span className="text-[10px] uppercase tracking-wide text-brand">resume</span>
                    )}
                  </div>
                  {chapter.description && (
                    <p className="text-white/40 text-xs truncate mt-0.5">{chapter.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-white/40 text-xs flex-shrink-0">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {formatDuration(chapter.duration)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BookOpen size={12} />
                    {chapter.chapterNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
