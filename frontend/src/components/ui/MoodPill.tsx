import type { MoodPillProps } from '../../types/props/component-props.types';

export default function MoodPill({ icon, label, active, onClick }: MoodPillProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl flex-shrink-0 transition-colors ${
        active
          ? 'bg-brand text-white'
          : 'bg-surface-alt text-muted hover:bg-brand/20 hover:text-white'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium whitespace-nowrap">{label}</span>
    </button>
  );
}
