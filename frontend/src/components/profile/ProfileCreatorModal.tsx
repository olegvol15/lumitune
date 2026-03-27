import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ProfileCreatorModalProps } from '../../types/profile/profile.types';
import Button from '../ui/Button';
import { backdropVariants, modalVariants } from '../../lib/motion';

export default function ProfileCreatorModal({
  open,
  title,
  children,
  onClose,
}: ProfileCreatorModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[84] bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
          <motion.div
            className="fixed inset-0 z-[85] flex items-center justify-center p-4"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="w-full max-w-[272px] rounded-[18px] bg-[#233b47] px-6 py-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:max-w-[300px]">
              <div className="mb-5 flex items-start justify-between">
                <h3 className="text-[14px] font-semibold text-[#eaf6ff]">{title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  shape="pill"
                  onClick={onClose}
                  className="!h-6 !w-6 !rounded-full !p-0 !text-[#9fc4df] hover:!bg-white/5"
                >
                  <X size={14} />
                </Button>
              </div>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
