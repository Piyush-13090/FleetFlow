import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Bell,
  Settings,
  FileQuestion,
  LogOut,
  User,
  X,
  ChevronRight,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

/** Shared with the (retired) sidebar — the full app navigation. */
export const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicle Registry', icon: Truck },
  { id: 'drivers', label: 'Driver Management', icon: Users },
  { id: 'trips', label: 'Trip Management', icon: Route },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'fuel', label: 'Fuel & Expenses', icon: Fuel },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'notfound', label: '404 Demo', icon: FileQuestion },
];

interface ProfileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userName?: string;
  userRole?: string;
}

export const ProfileNavDrawer: React.FC<ProfileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onLogout,
  userName = 'Piyush Sharma',
  userRole = 'Fleet Manager',
}) => {
  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const go = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-[#0A0F1E]/40 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 z-[61] h-full w-[320px] max-w-[86vw] bg-white border-l border-[#E5E7EB] cc-shadow-lg flex flex-col cc-body"
            role="dialog"
            aria-label="Navigation menu"
          >
            {/* Identity header */}
            <div className="p-5 border-b border-[#EEF1F4]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[14px] bg-[#EFF4FF] border border-[#DBE6FF] flex items-center justify-center text-[#2563EB]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="cc-display text-[15px] font-semibold text-[#0A0A0A] leading-tight">{userName}</div>
                    <span className="inline-block mt-1 text-[10px] font-bold bg-[#EFF4FF] text-[#2563EB] border border-[#DBE6FF] px-2 py-0.5 rounded-full">
                      {userRole}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="cc-focus w-9 h-9 rounded-[10px] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                Navigate
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => go(item.id)}
                      className={`cc-focus group w-full min-h-[44px] flex items-center gap-3 px-3 rounded-[12px] text-[14px] font-medium transition-colors ${
                        active
                          ? 'bg-[#EFF4FF] text-[#2563EB]'
                          : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#0A0A0A]'
                      }`}
                    >
                      <Icon className={`w-[18px] h-[18px] ${active ? 'text-[#2563EB]' : 'text-[#9CA3AF] group-hover:text-[#0A0A0A]'}`} strokeWidth={1.9} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                      {!active && <ChevronRight className="w-4 h-4 text-[#D1D5DB] opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer / Sign out */}
            <div className="p-3 border-t border-[#EEF1F4]">
              <button
                onClick={onLogout}
                className="cc-focus group w-full min-h-[44px] flex items-center gap-3 px-3 rounded-[12px] text-[14px] font-medium text-[#4B5563] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
              >
                <LogOut className="w-[18px] h-[18px] text-[#9CA3AF] group-hover:text-[#DC2626]" strokeWidth={1.9} />
                <span className="flex-1 text-left">Sign Out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
