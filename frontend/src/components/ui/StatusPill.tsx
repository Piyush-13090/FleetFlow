/** Soft tint + dot status pill used across all pages. */
type Tone = 'accent' | 'success' | 'warning' | 'critical' | 'neutral' | 'indigo';

const toneClasses: Record<Tone, string> = {
  accent: 'bg-[#EFF4FF] text-[#2563EB] border-[#DBE6FF]',
  success: 'bg-[#ECFDF5] text-[#059669] border-[#C7F0DC]',
  warning: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE8B0]',
  critical: 'bg-[#FEF2F2] text-[#DC2626] border-[#FBD5D5]',
  neutral: 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]',
  indigo: 'bg-[#EEF2FF] text-[#4F46E5] border-[#DDE2FE]',
};

const dotColor: Record<Tone, string> = {
  accent: '#2563EB',
  success: '#16A34A',
  warning: '#D97706',
  critical: '#DC2626',
  neutral: '#94A3B8',
  indigo: '#4F46E5',
};

/** Maps every status string used in the app to a tone. */
export const statusTone = (status: string): Tone => {
  const s = status.toLowerCase();
  if (['available', 'completed', 'approved', 'valid', 'compliant', 'cleared', 'operational'].some((k) => s.includes(k))) return 'success';
  if (['on trip', 'dispatched', 'scheduled', 'active', 'info'].some((k) => s.includes(k))) return 'accent';
  if (['delayed', 'in progress', 'pending', 'expiring', 'medium', 'high', 'warning'].some((k) => s.includes(k))) return 'warning';
  if (['in shop', 'suspended', 'cancelled', 'overdue', 'expired', 'rejected', 'critical', 'denied'].some((k) => s.includes(k))) return 'critical';
  if (['parking'].some((k) => s.includes(k))) return 'indigo';
  return 'neutral';
};

export const StatusPill: React.FC<{ status: string; tone?: Tone; pulse?: boolean; className?: string }> = ({
  status,
  tone,
  pulse = false,
  className = '',
}) => {
  const t = tone ?? statusTone(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${toneClasses[t]} ${className}`}
    >
      <span className="relative flex w-1.5 h-1.5">
        {pulse && <span className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping" style={{ backgroundColor: dotColor[t] }} />}
        <span className="relative inline-flex w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor[t] }} />
      </span>
      {status}
    </span>
  );
};
