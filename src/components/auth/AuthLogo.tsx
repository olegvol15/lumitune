import lumituneMark from '../../assets/lumitune-mark.svg';

interface AuthLogoProps {
  heading: string;
  brand?: boolean;
}

export default function AuthLogo({ heading, brand = false }: AuthLogoProps) {
  return (
    <div className="flex flex-col items-center mb-5">
      <div className="relative mb-3">
        <div className="absolute inset-0 rounded-full bg-[#004A98]/20 blur-[26px]" />
        <img
          src={lumituneMark}
          alt="LumiTune logo"
          className="relative w-[124px] h-[96px] object-contain"
        />
      </div>
      {brand && (
        <h1 className="text-[#E8EEF8] text-[48px] sm:text-[56px] leading-none font-semibold tracking-tight">
          LumiTune
        </h1>
      )}
      <h2
        className={`text-[#E8EEF8] font-semibold tracking-tight text-center ${
          brand ? 'text-[22px] mt-2' : 'text-[22px]'
        }`}
      >
        {heading}
      </h2>
    </div>
  );
}
