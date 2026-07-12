/** Standard premium surface card. */
export const Card: React.FC<{ children: React.ReactNode; className?: string; padded?: boolean }> = ({
  children,
  className = '',
  padded = true,
}) => (
  <div className={`bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm ${padded ? 'p-5' : ''} ${className}`}>
    {children}
  </div>
);

/** Small caps section title used inside cards. */
export const CardLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF] ${className}`}>{children}</div>
);
