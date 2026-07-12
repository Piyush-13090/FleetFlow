import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertTriangle, 
  Wrench, 
  Fuel, 
  Clock, 
  Check 
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'maintenance' | 'license' | 'dispatch' | 'fuel';
  title: string;
  desc: string;
  time: string;
  critical: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearItem: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearItem,
  onClearAll,
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-rose-500" />;
      case 'license':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-rose-500" />;
      case 'dispatch':
        return <Clock className="w-4 h-4 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/25 backdrop-blur-sm"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="w-screen max-w-md bg-white border-l border-border-gray shadow-2xl flex flex-col h-full text-left"
            >
              {/* Header */}
              <div className="p-4 border-b border-border-gray flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-sm font-black text-text-dark tracking-tight uppercase">Operational Alerts</h3>
                  <span className="text-[10px] text-slate-500 font-medium">{notifications.length} Unread Updates</span>
                </div>
                <div className="flex items-center space-x-3">
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearAll}
                      className="text-[9.5px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg border border-border-gray hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {notifications.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 bg-white border rounded-xl shadow-sm flex items-start space-x-3 relative group transition-colors ${
                      item.critical ? 'border-l-4 border-l-rose-500 border-border-gray' : 'border-border-gray'
                    }`}
                  >
                    {/* Circle icon wrapper */}
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                      {getIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[11px] font-bold text-text-dark truncate block leading-none">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed mt-1">
                        {item.desc}
                      </p>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono block mt-1">
                        {item.time}
                      </span>
                    </div>

                    {/* Clear single item mark */}
                    <button
                      onClick={() => onClearItem(item.id)}
                      className="absolute top-3 right-3 p-1 rounded-lg border border-transparent hover:border-border-gray hover:bg-slate-50 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Mark as Read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}

                {notifications.length === 0 && (
                  <div className="py-16 text-center">
                    <Check className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                    <h4 className="text-xs font-bold text-text-dark">All Systems Clear</h4>
                    <p className="text-[10px] text-slate-500 mt-1">No unresolved dispatcher warnings found.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
