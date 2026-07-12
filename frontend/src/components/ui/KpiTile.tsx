import { motion, useReducedMotion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';

interface KpiTileProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  value: number | string;
  label: string;
  sublabel?: string;
  /** e.g. "+8%" */
  delta?: string;
  deltaUp?: boolean;
  /** icon tile tint + color */
  tint?: string;
  color?: string;
  spark?: number[];
  suffix?: string;
  decimals?: number;
}

/** Premium KPI card — icon tile, soft delta chip, count-up value, sparkline. */
export const KpiTile: React.FC<KpiTileProps> = ({
  icon: Icon,
  value,
  label,
  sublabel,
  delta,
  deltaUp = true,
  tint = '#EFF4FF',
  color = '#2563EB',
  spark,
  suffix = '',
  decimals = 0,
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className="p-5 bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm hover:cc-shadow-md transition-shadow flex flex-col justify-between"
    >
      <div className="flex justify-between items-start">
        <span className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: tint, color }}>
          <Icon className="w-5 h-5" strokeWidth={1.9} />
        </span>
        {delta && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              deltaUp ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#DC2626]'
            }`}
          >
            {deltaUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </span>
        )}
      </div>
      <div className="mt-4 flex justify-between items-end">
        <div className="min-w-0">
          <div className="cc-display text-[26px] font-bold text-[#0A0A0A] tracking-tight leading-none tabular-nums">
            {typeof value === 'number' ? <CountUp to={value} decimals={decimals} suffix={suffix} /> : value}
          </div>
          <div className="text-[10px] uppercase font-bold text-[#9CA3AF] mt-1.5 tracking-[0.12em]">{label}</div>
          {sublabel && <div className="text-[11px] text-[#6B7280] mt-0.5">{sublabel}</div>}
        </div>
        {spark && (
          <div className="shrink-0 opacity-90">
            <Sparkline data={spark} color={color} width={72} height={26} area />
          </div>
        )}
      </div>
    </motion.div>
  );
};
