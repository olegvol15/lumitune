import type { SettingsItemProps } from '../../types/settings/settings.types';

export default function SettingsItem({
  title,
  description,
  control,
  compact = false,
}: SettingsItemProps) {
  return (
    <div
      className={[
        'grid gap-4 border-b border-white/[0.03] py-5',
        compact ? 'md:grid-cols-[minmax(0,1fr)_170px]' : 'md:grid-cols-[minmax(0,1fr)_170px]',
      ].join(' ')}
    >
      <div className="max-w-xl">
        <h3 className="text-[15px] font-semibold text-[#eef6ff]">{title}</h3>
        {description ? (
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#7d92aa]">{description}</p>
        ) : null}
      </div>
      <div className="flex items-start justify-start md:justify-end">{control}</div>
    </div>
  );
}
