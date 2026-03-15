import type { ProfileStatProps } from "../../types/profile/profile.types";

export default function ProfileStat({ value, label }: ProfileStatProps) {
  return (
    <div className="text-center">
      <div className="text-[14px] font-semibold leading-none text-white">{value}</div>
      <div className="mt-1 text-[10px] text-[#bfd2df]">{label}</div>
    </div>
  );
}
