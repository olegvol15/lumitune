import { ChevronDown } from 'lucide-react';
import type { SettingsSelectProps } from '../../types/settings/settings.types';

export default function SettingsSelect({ value, options, onChange }: SettingsSelectProps) {
  return (
    <div className="relative w-full max-w-[170px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-lg border border-[#274a69] bg-[#101c2a]/85 px-3 pr-9 text-xs text-[#91a9c2] outline-none transition focus:border-[#59bfff]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6e88a6]"
      />
    </div>
  );
}
