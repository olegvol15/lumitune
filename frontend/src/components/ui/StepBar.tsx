import type { StepBarProps } from '../../types/props/component-props.types';

export default function StepBar({ currentStep, totalSteps }: StepBarProps) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`flex-1 h-0.5 rounded-full transition-colors ${
            i < currentStep ? 'bg-[#1CA2EA]' : 'bg-[#2A4A6A]'
          }`}
        />
      ))}
    </div>
  );
}
