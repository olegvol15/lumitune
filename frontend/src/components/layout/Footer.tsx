import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaTwitter, FaPinterest, FaRss } from 'react-icons/fa';
import LogoIcon from '../ui/LogoIcon';

export default function Footer() {
  return (
    <footer className="bg-[#060d19] border-t border-[#1a3050]">
      {/* Main footer content — inset to clear fixed sidebars */}
      <div className="px-12 py-10 flex items-start justify-between gap-10 flex-wrap">
        {/* Logo */}
        <div className="flex flex-col items-start">
          <LogoIcon className="w-24 h-auto" />
        </div>

        {/* Contact grid */}
        <div className="flex flex-col gap-3 text-sm text-white/50">
          {/* Address */}
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-white/60 flex-shrink-0" />
            <span>вул. Музична 42, Київ, Україна</span>
          </div>

          {/* Phone + Email on same row */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-white/60 flex-shrink-0" />
              <span>+380 44 123 4567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-white/60 flex-shrink-0" />
              <span>hello@lumitune.ua</span>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4 mt-1">
            <button className="text-white/50 hover:text-white transition-colors">
              <FaFacebook size={16} />
            </button>
            <button className="text-white/50 hover:text-white transition-colors">
              <FaTwitter size={16} />
            </button>
            <button className="text-white/50 hover:text-white transition-colors">
              <FaPinterest size={16} />
            </button>
            <button className="text-white/50 hover:text-white transition-colors">
              <FaRss size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar — full width divider + centered links */}
      <div className="px-12 py-4 border-t border-[#1a3050] flex items-center justify-center gap-8 text-xs text-white/30">
        <button className="hover:text-white transition-colors">About us</button>
        <button className="hover:text-white transition-colors">Contact us</button>
        <button className="hover:text-white transition-colors">Help</button>
        <button className="hover:text-white transition-colors">Privacy Policy</button>
        <button className="hover:text-white transition-colors">Disclaimer</button>
      </div>
    </footer>
  );
}
