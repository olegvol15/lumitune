interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
}

export default function Avatar({
  src,
  alt = "",
  size = 40,
  className = "",
}: AvatarProps) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={style}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }
  const initials = alt
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      style={style}
      className={`rounded-full bg-brand flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
