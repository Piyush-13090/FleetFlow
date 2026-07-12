import { ArrowLeft } from 'lucide-react';

/** Standard premium page header: eyebrow + display title + subtitle + actions slot. */
export const SectionHeader: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onBack?: () => void;
}> = ({ eyebrow, title, subtitle, actions, onBack }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
    <div className="flex items-start gap-3.5 text-left min-w-0">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[#0A0A0A] rounded-[12px] transition-all cursor-pointer cc-shadow-sm mt-1"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <div className="min-w-0">
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">{eyebrow}</span>
        )}
        <h1 className="cc-display text-[28px] font-bold text-[#0A0A0A] tracking-tight mt-1">{title}</h1>
        {subtitle && <p className="text-[13px] text-[#6B7280] mt-1.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">{actions}</div>}
  </div>
);
