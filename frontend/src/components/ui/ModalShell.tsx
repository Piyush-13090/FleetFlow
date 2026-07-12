import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/** Premium centered modal shell with soft backdrop. */
export const ModalShell: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, subtitle, children, footer, maxWidth = 'max-w-lg' }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] bg-[#0A0F1E]/40 backdrop-blur-[2px]"
        />
        <div className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className={`cc-body pointer-events-auto w-full ${maxWidth} max-h-[88vh] flex flex-col bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-lg overflow-hidden`}
            role="dialog"
          >
            {(title || subtitle) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-[#EEF1F4]">
                <div className="min-w-0">
                  {title && <h3 className="cc-display text-[18px] font-semibold text-[#0A0A0A]">{title}</h3>}
                  {subtitle && <p className="text-[12px] text-[#6B7280] mt-0.5">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="cc-focus w-9 h-9 rounded-[10px] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="px-6 py-4 border-t border-[#EEF1F4] flex items-center justify-end gap-3">{footer}</div>}
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);
