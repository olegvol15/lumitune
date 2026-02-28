interface MediaCardProps {
  image: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
}

const sizes = {
  sm: "w-28",
  md: "w-36",
  lg: "w-44",
};

export default function MediaCard({
  image,
  title,
  subtitle,
  onClick,
  size = "md",
  rounded = false,
}: MediaCardProps) {
  return (
    <button
      onClick={onClick}
      className={`${sizes[size]} flex-shrink-0 text-left group`}
    >
      <img
        src={image}
        alt={title}
        className={`w-full aspect-square object-cover mb-2 ${
          rounded ? "rounded-full" : "rounded-xl"
        } group-hover:opacity-80 transition-opacity`}
      />
      <p className="text-white text-sm font-semibold truncate">{title}</p>
      {subtitle && (
        <p className="text-muted text-xs truncate mt-0.5">{subtitle}</p>
      )}
    </button>
  );
}
