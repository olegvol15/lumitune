import { Link } from "@tanstack/react-router";
import Button from "./Button";

interface SectionHeaderProps {
  title: string;
  showAll?: string; // route path
  onShowAll?: () => void;
}

export default function SectionHeader({
  title,
  showAll,
  onShowAll,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-white font-bold text-lg">{title}</h2>
      {showAll && (
        <Link
          to={showAll}
          className="text-muted text-sm hover:text-brand transition-colors"
        >
          Показати все →
        </Link>
      )}
      {onShowAll && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowAll}
          className="text-sm hover:text-brand"
        >
          Показати все →
        </Button>
      )}
    </div>
  );
}
