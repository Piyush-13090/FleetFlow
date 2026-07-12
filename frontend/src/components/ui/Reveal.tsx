import { motion } from 'framer-motion';
import { EASE } from './CountUp';

/** Scroll-reveal wrapper: fade + rise, staggerable via `delay`. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}> = ({ children, delay = 0, y = 14, className }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.55, ease: EASE, delay }}
    className={className}
  >
    {children}
  </motion.div>
);
