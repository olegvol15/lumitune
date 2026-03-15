import LogoIcon from '../ui/LogoIcon';
import type { AuthLogoProps } from '../../types/props/component-props.types';

export default function AuthLogo({ heading, brand = false }: AuthLogoProps) {
  return (
    <div className="flex flex-col items-center mb-5">
      <LogoIcon className="relative w-[108px] h-auto mb-3" />
      {brand && (
        <h1 className="text-[#E8EEF8] text-[48px] sm:text-[56px] leading-none font-semibold tracking-tight">
          LumiTune
        </h1>
      )}
      {heading && (
        <h2
          className={`text-[#E8EEF8] font-bold tracking-tight text-center whitespace-pre-line ${
            brand ? 'text-[22px] mt-2' : 'text-[28px] leading-tight'
          }`}
        >
          {heading}
        </h2>
      )}
    </div>
  );
}
