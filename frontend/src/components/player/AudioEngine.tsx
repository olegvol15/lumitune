import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';

const buildTrackStreamUrl = (songId: string) => `/api/songs/${songId}/stream`;
const buildEpisodeStreamUrl = (episodeId: string) => `/api/podcasts/episodes/${episodeId}/stream`;

export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousTrackIdRef = useRef<string | null>(null);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const currentEpisode = usePlayerStore((state) => state.currentEpisode);
  const queue = usePlayerStore((state) => state.queue);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const progress = usePlayerStore((state) => state.progress);
  const repeat = usePlayerStore((state) => state.repeat);
  const next = usePlayerStore((state) => state.next);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const activeId = currentTrack?.id ?? currentEpisode?.id ?? null;

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
        : buildEpisodeStreamUrl(currentEpisode!.id);
      audio.load();
      previousTrackIdRef.current = activeId;
      setProgress(0);
    }
  }, [currentTrack, currentEpisode, setProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || (!currentTrack && !currentEpisode)) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
      return;
    }
    audio.pause();
  }, [isPlaying, currentTrack, currentEpisode, setIsPlaying]);

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
  };

  const handleEnded = () => {
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
    />
  );
}
