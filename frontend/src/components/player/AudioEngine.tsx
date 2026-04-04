import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import audiobooksApi from '../../api/audiobooksApi';
import { useAuthStore } from '../../store/authStore';

const buildTrackStreamUrl = (songId: string) => `/api/songs/${songId}/stream`;
const buildEpisodeStreamUrl = (episodeId: string) => `/api/podcasts/episodes/${episodeId}/stream`;
const buildAudiobookChapterStreamUrl = (chapterId: string) =>
  audiobooksApi.chapterStreamUrl(chapterId);

export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousTrackIdRef = useRef<string | null>(null);
  const lastProgressSaveRef = useRef<{ chapterId: string; progressSeconds: number } | null>(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const currentEpisode = usePlayerStore((state) => state.currentEpisode);
  const currentAudiobook = usePlayerStore((state) => state.currentAudiobook);
  const currentAudiobookChapter = usePlayerStore((state) => state.currentAudiobookChapter);
  const queue = usePlayerStore((state) => state.queue);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const progress = usePlayerStore((state) => state.progress);
  const repeat = usePlayerStore((state) => state.repeat);
  const next = usePlayerStore((state) => state.next);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const activeId = currentTrack?.id ?? currentEpisode?.id ?? currentAudiobookChapter?.id ?? null;

    if (!activeId) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      previousTrackIdRef.current = null;
      return;
    }

    if (previousTrackIdRef.current !== activeId) {
      audio.src = currentTrack
        ? buildTrackStreamUrl(currentTrack.id)
        : currentEpisode
        ? buildEpisodeStreamUrl(currentEpisode.id)
        : buildAudiobookChapterStreamUrl(currentAudiobookChapter!.id);
      audio.load();
      previousTrackIdRef.current = activeId;
      if (
        currentAudiobook &&
        currentAudiobookChapter &&
        currentAudiobook.progress?.currentChapterId === currentAudiobookChapter.id
      ) {
        setProgress(currentAudiobook.progress.progressPct);
      } else {
        setProgress(0);
      }
    }
  }, [currentTrack, currentEpisode, currentAudiobook, currentAudiobookChapter, setProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || (!currentTrack && !currentEpisode && !currentAudiobookChapter)) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
      return;
    }
    audio.pause();
  }, [isPlaying, currentTrack, currentEpisode, currentAudiobookChapter, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const desiredTime = progress * audio.duration;
    if (Math.abs(audio.currentTime - desiredTime) > 0.75) {
      audio.currentTime = desiredTime;
    }
  }, [progress]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }
    setProgress(audio.currentTime / audio.duration);

    if (
      isAuthenticated &&
      currentAudiobook &&
      currentAudiobookChapter &&
      audio.currentTime - (lastProgressSaveRef.current?.progressSeconds ?? 0) >= 15
    ) {
      const progressSeconds = Math.floor(audio.currentTime);
      lastProgressSaveRef.current = { chapterId: currentAudiobookChapter.id, progressSeconds };
      void audiobooksApi.updateProgress(currentAudiobook.id, {
        chapterId: currentAudiobookChapter.id,
        progressSeconds,
        progressPct: audio.currentTime / audio.duration,
      });
    }
  };

  const handleEnded = () => {
    if (currentAudiobookChapter) {
      next();
      return;
    }

    // Episode ended — just stop; no queue for episodes
    if (currentEpisode) {
      setIsPlaying(false);
      setProgress(1);
      return;
    }

    if (!currentTrack || queue.length === 0) {
      setIsPlaying(false);
      return;
    }

    const currentIndex = queue.findIndex((track) => track.id === currentTrack.id);
    const isLastTrack = currentIndex >= 0 && currentIndex === queue.length - 1;

    if (repeat === 'off' && isLastTrack) {
      setIsPlaying(false);
      setProgress(1);
      return;
    }

    next();
  };

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      onPause={() => {
        const audio = audioRef.current;
        if (
          !audio ||
          !isAuthenticated ||
          !currentAudiobook ||
          !currentAudiobookChapter ||
          !Number.isFinite(audio.duration) ||
          audio.duration <= 0
        ) {
          return;
        }

        const progressSeconds = Math.floor(audio.currentTime);
        lastProgressSaveRef.current = { chapterId: currentAudiobookChapter.id, progressSeconds };
        void audiobooksApi.updateProgress(currentAudiobook.id, {
          chapterId: currentAudiobookChapter.id,
          progressSeconds,
          progressPct: audio.currentTime / audio.duration,
        });
      }}
    />
  );
}
