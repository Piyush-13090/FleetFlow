import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

export const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Animated count-up with tabular numerals; triggers when scrolled into view. */
export const CountUp: React.FC<{
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}> = ({ to, decimals = 0, prefix = '', suffix = '', duration = 1.2 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [inView, to, reduce, duration]);

  const text = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-US');
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {text}
      {suffix}
    </span>
  );
};
