import { Pencil, Settings } from 'lucide-react';
import type { ProfileHeroActionsProps } from '../../types/profile/profile.types';
import Button from '../ui/Button';

export default function ProfileHeroActions({
  onEditProfile,
  onOpenSettings,
}: ProfileHeroActionsProps) {
  return (
    <div className="flex items-start justify-end gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        shape="pill"
        onClick={onEditProfile}
        className="!h-7 !w-7 !rounded-full !p-0 !text-white hover:!bg-white/10"
      >
        <Pencil size={14} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        shape="pill"
        onClick={onOpenSettings}
        className="!h-7 !w-7 !rounded-full !p-0 !text-white hover:!bg-white/10"
      >
        <Settings size={14} />
      </Button>
    </div>
  );
}
