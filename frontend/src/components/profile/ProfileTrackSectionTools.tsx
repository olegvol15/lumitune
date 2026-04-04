import { Search } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import ProfileSectionArrows from './ProfileSectionArrows';

export default function ProfileTrackSectionTools() {
  const { copy } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <Search size={14} className="text-[#7d97af]" />
      <span className="text-xs text-[#9cb0c3]">{copy.profile.addedDate}</span>
      <span className="text-[#7d97af]">≡</span>
      <ProfileSectionArrows />
    </div>
  );
}
