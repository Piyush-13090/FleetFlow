import { motion } from 'framer-motion';

interface SegOption {
  id: string;
  label: React.ReactNode;
}

/** Premium segmented control / tab switcher with sliding active pill. */
export const Segmented: React.FC<{
  options: SegOption[];
  value: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md';
  layoutId?: string;
  className?: string;
}> = ({ options, value, onChange, size = 'md', layoutId = 'seg', className = '' }) => {
  const pad = size === 'sm' ? 'px-3 h-8 text-[12px]' : 'px-4 h-10 text-[13px]';
  return (
    <div className={`inline-flex p-1 bg-[#F3F4F6] border border-[#E5E7EB] rounded-[12px] ${className}`}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`cc-focus relative ${pad} rounded-[9px] font-semibold transition-colors ${
              active ? 'text-[#0A0A0A]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 bg-white rounded-[9px] cc-shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
