import type { InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export default function AdminCheckbox({ className = '', checked, disabled, ...props }: Props) {
  const isChecked = checked === true;

  return (
    <label className={`relative inline-flex h-5 w-5 items-center justify-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <span className={`flex h-5 w-5 items-center justify-center rounded-md border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#3dc9b0]/30 ${
        isChecked
          ? 'border-[#3dc9b0] bg-[#3dc9b0]'
          : 'border-[#3c4d68] bg-[#182234]'
      }`}>
        <svg
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 transition-all ${isChecked ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
          fill="none"
          stroke="#1a2030"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4.5 10.5 8 14l7.5-8" />
        </svg>
      </span>
    </label>
  );
}
