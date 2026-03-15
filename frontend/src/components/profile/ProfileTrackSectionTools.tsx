import { Search } from "lucide-react";
import ProfileSectionArrows from "./ProfileSectionArrows";

export default function ProfileTrackSectionTools() {
  return (
    <div className="flex items-center gap-2">
      <Search size={14} className="text-[#7d97af]" />
      <span className="text-xs text-[#9cb0c3]">Дата додавання</span>
      <span className="text-[#7d97af]">≡</span>
      <ProfileSectionArrows />
    </div>
  );
}
