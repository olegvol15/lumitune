interface PasswordRequirementProps {
  met: boolean;
  label: string;
}

export default function PasswordRequirement({
  met,
  label,
}: PasswordRequirementProps) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex-shrink-0 transition-colors ${
          met ? "border-[#1CA2EA] bg-[#1CA2EA]" : "border-[#4A6F9A]"
        }`}
      />
      <span className="text-[#A8C4E0] text-[13px] leading-snug">{label}</span>
    </div>
  );
}
