import { Upload } from "lucide-react";
import { useRef } from "react";
import type { ProfileUploadZoneProps } from "../../types/profile/profile.types";

export default function ProfileUploadZone({
  label,
  sublabel,
  onSelect,
  compact = false,
}: ProfileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={[
          "flex w-full flex-col items-center justify-center rounded-[10px] border border-dashed border-[#4f7592] text-[#6b8ca8] transition hover:bg-[#294455]",
          compact ? "h-[78px]" : "h-[98px]",
        ].join(" ")}
      >
        <Upload size={compact ? 18 : 22} />
        <span className="mt-1.5 text-[12px]">{label}</span>
        <span className="mt-1 text-[9px] opacity-70">{sublabel}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={compact ? "image/*" : "audio/*,image/*"}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
    </>
  );
}
