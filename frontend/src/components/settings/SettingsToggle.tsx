import type { SettingsToggleProps } from '../../types/settings/settings.types';

export default function SettingsToggle({ value, onChange }: SettingsToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={[
        'relative inline-flex h-7 w-11 items-center rounded-lg border transition-all duration-200',
        value ? 'border-[#76d0ff]/55 bg-[#213a54]' : 'border-white/5 bg-[#1a2430]',
      ].join(' ')}
    >
      <span
        className={[
          'absolute h-[18px] w-[18px] rounded-[6px] transition-all duration-200',
          value
            ? 'left-[23px] bg-[#7bd3ff] shadow-[0_0_14px_rgba(123,211,255,0.4)]'
            : 'left-1.5 bg-[#4f7c99]',
        ].join(' ')}
      />
    </button>
  );
}
