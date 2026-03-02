import { MoreHorizontal, X, Upload, PlusCircle } from "lucide-react";
import { artists } from "../../data/artists";
import Button from "../ui/Button";

export default function RightPanel() {
  const artist = artists[4]; // Taylor Swift — stand-in for Lana Del Rey

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-72 bg-[#060d19] border-l border-[#1a3050] overflow-y-auto flex-shrink-0">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm font-semibold">
            Lana Del Rey Radio
          </span>
          <div className="flex items-center gap-0.5">
            <button className="text-white/40 hover:text-white p-1.5 transition-colors">
              <MoreHorizontal size={18} />
            </button>
            <button className="text-white/40 hover:text-white p-1.5 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Large grayscale image */}
        <img
          src={artist.image}
          alt={artist.name}
          className="w-full aspect-square object-cover rounded-xl grayscale mb-4"
        />

        {/* Track info */}
        <div className="flex items-start justify-between mb-5">
          <div className="min-w-0">
            <p className="text-white text-lg font-bold leading-tight">
              Kill This Love
            </p>
            <p className="text-white text-xs font-bold uppercase tracking-wider mt-0.5">
              Black Pink
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
            <button className="text-white/50 hover:text-white transition-colors">
              <Upload size={18} />
            </button>
            <button className="text-white/50 hover:text-white transition-colors">
              <PlusCircle size={18} />
            </button>
          </div>
        </div>

        {/* Second image — full width square, grayscale, blue border */}
        <div className="rounded-xl overflow-hidden border-2 border-[#1CA2EA] mb-4">
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full aspect-square object-cover grayscale"
          />
        </div>

        {/* Artist name */}
        <p className="text-white text-xl font-bold mb-1">Lana Del Rey</p>

        {/* Listeners + subscribe button — same line */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-white/50 text-xs shrink-0">
            72 780 975 слухачів на місяць
          </p>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            Відписатися
          </Button>
        </div>

        {/* Bio */}
        <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
          {artist.bio}
        </p>
      </div>
    </aside>
  );
}
