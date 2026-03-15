import type { ProfileFollowingCardProps } from "../../types/profile/profile.types";

export default function ProfileFollowingCard({
  name,
  image,
  listeners,
  onClick,
}: ProfileFollowingCardProps) {
  return (
    <button type="button" onClick={onClick} className="text-center">
      <img
        src={image}
        alt={name}
        className="mx-auto h-28 w-28 rounded-full object-cover grayscale transition hover:grayscale-0"
      />
      <div className="mt-4 text-sm font-medium text-white">{name}</div>
      <div className="mt-1 text-[11px] text-[#7288a0]">{listeners}</div>
    </button>
  );
}
