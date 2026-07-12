import { AlertCircle } from 'lucide-react';

const inputBase =
  'cc-focus w-full px-3.5 h-11 bg-[#F9FAFB] border rounded-[12px] text-[14px] text-[#0A0A0A] placeholder-[#9CA3AF] focus:bg-white transition-colors';

/** Labeled text input with inline validation + hint. */
export const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  readOnly?: boolean;
  required?: boolean;
  right?: React.ReactNode;
  textarea?: boolean;
  className?: string;
  step?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, error, hint, readOnly, required, right, textarea, className = '', step }) => (
  <div className={className}>
    <label className="block text-[12px] font-semibold text-[#4B5563] mb-1.5">
      {label} {required && <span className="text-[#DC2626]">*</span>}
    </label>
    <div className="relative">
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`${inputBase} ${error ? 'border-[#DC2626]' : 'border-[#E5E7EB]'} ${readOnly ? 'opacity-70 cursor-not-allowed' : ''} h-20 py-2.5 resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          step={step}
          className={`${inputBase} ${error ? 'border-[#DC2626]' : 'border-[#E5E7EB]'} ${readOnly ? 'opacity-70 cursor-not-allowed' : ''} ${right ? 'pr-10' : ''}`}
        />
      )}
      {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
    {error ? (
      <p className="mt-1.5 text-[11px] text-[#DC2626] flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    ) : hint ? (
      <p className="mt-1.5 text-[11px] text-[#9CA3AF]">{hint}</p>
    ) : null}
  </div>
);

/** Labeled select. */
export const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}> = ({ label, value, onChange, options, required }) => (
  <div>
    <label className="block text-[12px] font-semibold text-[#4B5563] mb-1.5">
      {label} {required && <span className="text-[#DC2626]">*</span>}
    </label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputBase} border-[#E5E7EB] cursor-pointer`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);
