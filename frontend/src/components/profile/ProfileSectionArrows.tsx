import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

export default function ProfileSectionArrows() {
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        shape="pill"
        className="!h-8 !w-8 !rounded-full !p-0 !text-[#8ca4bf] hover:!bg-white/5 hover:!text-white"
      >
        <ChevronLeft size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        shape="pill"
        className="!h-8 !w-8 !rounded-full !p-0 !text-[#8ca4bf] hover:!bg-white/5 hover:!text-white"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
