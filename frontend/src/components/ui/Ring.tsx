import { motion } from 'framer-motion';

/** Circular progress ring with centered label (health / safety / readiness). */
export const Ring: React.FC<{
  value: number; // 0-100
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: React.ReactNode;
  animate?: boolean;
}> = ({ value, size = 56, stroke = 5, color = '#2563EB', track = '#EEF1F4', label, animate = true }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  const center = size / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: animate ? c : offset }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center cc-display font-bold text-[#0A0A0A] tabular-nums" style={{ fontSize: size * 0.24 }}>
        {label ?? `${Math.round(value)}%`}
      </div>
    </div>
  );
};
