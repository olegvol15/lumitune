import type { Variants } from 'framer-motion';

export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.16, ease: 'easeIn' } },
};

export const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -6, scaleY: 0.97, transformOrigin: 'top right' },
  animate: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, scaleY: 0.97, transition: { duration: 0.14, ease: 'easeIn' } },
};

export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const cardHover = { scale: 1.015, transition: { duration: 0.15 } };
export const cardTap = { scale: 0.985 };

export const slideUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 40, transition: { duration: 0.2, ease: 'easeIn' } },
};
