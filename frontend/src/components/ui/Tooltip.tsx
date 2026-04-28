import type { TooltipProps } from '../../types/props/component-props.types';

export default function Tooltip({
  content,
  children,
  className = '',
  position = 'top',
  disabled = false,
}: TooltipProps) {
  const positionClasses =
    position === 'bottom'
      ? 'top-[calc(100%+8px)]'
      : 'bottom-[calc(100%+8px)]';

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <span className={`group/tooltip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className={[
          'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md',
          'bg-[#0a1929] px-2.5 py-1.5 text-xs font-semibold text-[#dbe7f8]',
          'border border-[#2f73bf]/70 shadow-[0_10px_24px_rgba(0,0,0,0.3)]',
          'opacity-0 translate-y-1 transition-all duration-150',
          'group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0',
          'group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:translate-y-0',
          positionClasses,
        ].join(' ')}
      >
        {content}
      </span>
    </span>
  );
}
