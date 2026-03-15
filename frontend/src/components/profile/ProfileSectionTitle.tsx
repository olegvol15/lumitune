import type { ProfileSectionTitleProps } from "../../types/profile/profile.types";

export default function ProfileSectionTitle({
  title,
  right,
}: ProfileSectionTitleProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#f5fbff]">
        {title}
      </h2>
      {right}
    </div>
  );
}
