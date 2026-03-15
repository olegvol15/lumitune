import { ChevronDown } from "lucide-react";
import type { ProfileSelectFieldProps } from "../../types/profile/profile.types";

export default function ProfileSelectField({
  value,
  options,
  placeholder,
  onChange,
}: ProfileSelectFieldProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-[8px] border border-[#587c98] bg-[#497086] px-3 pr-8 text-[12px] text-[#e7f3fa] outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a8c1d4]"
      />
    </div>
  );
}
