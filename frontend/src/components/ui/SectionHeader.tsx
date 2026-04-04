import { Link } from '@tanstack/react-router';
import Button from './Button';
import type { SectionHeaderProps } from '../../types/props/component-props.types';
import { useI18n } from '../../lib/i18n';

export default function SectionHeader({ title, showAll, onShowAll }: SectionHeaderProps) {
  const { copy } = useI18n();
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-white font-bold text-lg">{title}</h2>
      {showAll && (
        <Link to={showAll} className="text-muted text-sm hover:text-brand transition-colors">
          {copy.common.showAll}
        </Link>
      )}
      {onShowAll && !showAll && (
        <Button variant="ghost" size="sm" onClick={onShowAll} className="text-sm hover:text-brand">
          {copy.common.showAll}
        </Button>
      )}
    </div>
  );
}
