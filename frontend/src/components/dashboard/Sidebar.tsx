import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicle Registry', icon: Truck },
  { id: 'drivers', label: 'Driver Management', icon: Users },
  { id: 'trips', label: 'Trip Management', icon: Route },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'fuel', label: 'Fuel & Expenses', icon: Fuel },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // If collapsed but hovered, we expand it visually
  const isExpanded = !isCollapsed || isHovered;

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ 
        width: isExpanded ? 260 : 76,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="hidden md:flex flex-col h-screen sticky top-0 left-0 bg-white border-r border-border-gray z-30 select-none shadow-sm"
    >
      {/* Sidebar Header / Logo */}
      <div className="p-5 flex items-center justify-between border-b border-border-gray/70 h-16 min-h-16">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-.554-8.243-1.582" />
            </svg>
          </div>
          
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-extrabold text-text-dark tracking-tight whitespace-nowrap"
              >
                Fleet<span className="text-primary font-medium">Flow</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {isExpanded && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-border-gray hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer hidden lg:block transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse Toggle Trigger when collapsed */}
      {!isExpanded && (
        <div className="flex justify-center py-4 border-b border-border-gray/30">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded-lg border border-border-gray hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Menu List */}
      <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full relative flex items-center p-3 rounded-xl transition-colors duration-200 group cursor-pointer focus:outline-none ${
                isActive ? 'text-primary font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              {/* Active Highlight Background Pill */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarPill"
                  className="absolute inset-0 bg-light-blue/50 border-l-[3px] border-primary rounded-xl z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 shrink-0">
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                  isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'
                }`} strokeWidth={isActive ? 2 : 1.75} />
              </div>

              {/* Label */}
              <div className="relative z-10 overflow-hidden flex-1 text-left ml-4">
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm tracking-tight whitespace-nowrap block"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Collapsed Tooltip */}
              {!isExpanded && (
                <div className="absolute left-16 bg-text-dark text-white text-xs font-medium px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-md whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border-gray/70">
        <button
          onClick={onLogout}
          className="w-full flex items-center p-3 rounded-xl text-slate-500 hover:text-danger-red hover:bg-red-50/30 transition-colors duration-200 group cursor-pointer"
        >
          <div className="shrink-0">
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-danger-red transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.75} />
          </div>
          
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium tracking-tight whitespace-nowrap ml-4 block"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>

          {!isExpanded && (
            <div className="absolute left-16 bg-text-dark text-white text-xs font-medium px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-md whitespace-nowrap z-50">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
};
