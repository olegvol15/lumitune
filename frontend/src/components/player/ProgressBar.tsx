import { useRef } from 'react';
import { formatDuration } from '../../utils/format';
import type { ProgressBarProps } from '../../types/props/component-props.types';

export default function ProgressBar({
  progress,
  onSeek,
  duration,
  className = '',
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || !barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pct);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={barRef}
        onClick={handleClick}
        className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group"
      >
        <div
          className="absolute inset-y-0 left-0 bg-brand rounded-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress * 100}% - 7px)` }}
        />
      </div>
      {duration !== undefined && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted">{formatDuration(progress * duration)}</span>
          <span className="text-xs text-muted">{formatDuration(duration)}</span>
        </div>
      )}
    </div>
  );
}
