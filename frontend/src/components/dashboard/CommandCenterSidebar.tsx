import { useState } from 'react';
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
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Operations',
    items: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'trips', label: 'Trips', icon: Route },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { id: 'vehicles', label: 'Vehicles', icon: Truck },
      { id: 'drivers', label: 'Drivers', icon: Users },
      { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'fuel', label: 'Fuel & Expenses', icon: Fuel },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'notfound', label: '404 Demo', icon: FileQuestion },
    ],
  },
];

interface CommandCenterSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenPalette: () => void;
  unread?: number;
}

export const CommandCenterSidebar: React.FC<CommandCenterSidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  onOpenPalette,
  unread = 0,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const expanded = !collapsed;

  return (
    <motion.aside
      animate={{ width: expanded ? 244 : 76 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      className="cc-body hidden md:flex flex-col h-screen sticky top-0 left-0 shrink-0 bg-white border-r border-[#E5E7EB] z-40 select-none"
    >
      {/* Brand + collapse */}
      <div className="h-16 px-4 flex items-center gap-2.5 border-b border-[#EEF1F4]">
        <span className="w-8 h-8 rounded-[10px] bg-[#0A0A0A] flex items-center justify-center shrink-0">
          <Truck className="w-[18px] h-[18px] text-white" strokeWidth={2} />
        </span>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="cc-display text-[17px] font-bold text-[#0A0A0A] whitespace-nowrap overflow-hidden"
            >
              FleetFlow
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="cc-focus ml-auto w-8 h-8 rounded-[8px] flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#0A0A0A] transition-colors shrink-0"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>
      </div>

      {/* ⌘K search trigger */}
      <div className="px-3 pt-3">
        <button
          onClick={onOpenPalette}
          className={`cc-focus w-full min-h-[40px] flex items-center gap-2.5 rounded-[12px] border border-[#E5E7EB] bg-[#FBFCFD] hover:bg-[#F3F4F6] text-[#6B7280] transition-colors ${expanded ? 'px-3' : 'justify-center px-0'}`}
          title="Search (⌘K)"
        >
          <Search className="w-4 h-4 shrink-0" />
          {expanded && (
            <>
              <span className="text-[13px]">Search…</span>
              <kbd className="ml-auto text-[10px] font-semibold text-[#9CA3AF] bg-white border border-[#E5E7EB] rounded-md px-1.5 py-0.5">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {expanded && (
              <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={!expanded ? item.label : undefined}
                    className={`cc-focus group relative w-full min-h-[40px] flex items-center rounded-[12px] transition-colors ${
                      expanded ? 'px-3 gap-3' : 'justify-center'
                    } ${active ? 'bg-[#EFF4FF] text-[#2563EB]' : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#0A0A0A]'}`}
                  >
                    {active && (
                      <motion.span
                        layoutId="cc-active-bar"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#2563EB]"
                      />
                    )}
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-[#2563EB]' : 'text-[#9CA3AF] group-hover:text-[#0A0A0A]'}`} strokeWidth={1.9} />
                    {expanded && <span className="text-[14px] font-medium truncate">{item.label}</span>}
                    {item.id === 'notifications' && unread > 0 && (
                      <span className={`${expanded ? 'ml-auto' : 'absolute top-1.5 right-1.5'} min-w-[18px] h-[18px] px-1 bg-[#DC2626] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums`}>
                        {unread}
                      </span>
                    )}
                    {/* Collapsed tooltip */}
                    {!expanded && (
                      <span className="absolute left-[68px] px-2.5 py-1.5 rounded-md bg-[#0A0F1E] text-white text-[12px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 cc-shadow-md">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Account footer */}
      <div className="p-3 border-t border-[#EEF1F4]">
        <div className={`flex items-center gap-3 rounded-[12px] p-2 ${expanded ? '' : 'justify-center'}`}>
          <div className="w-9 h-9 rounded-[10px] bg-[#EFF4FF] border border-[#DBE6FF] flex items-center justify-center text-[#2563EB] shrink-0">
            <User className="w-4.5 h-4.5" />
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-[#0A0A0A] leading-tight truncate">Piyush Sharma</div>
              <div className="text-[11px] text-[#9CA3AF]">Fleet Manager</div>
            </div>
          )}
          {expanded && (
            <button
              onClick={onLogout}
              className="cc-focus w-8 h-8 rounded-[8px] flex items-center justify-center text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {!expanded && (
          <button
            onClick={onLogout}
            className="cc-focus mt-1 w-full h-9 rounded-[10px] flex items-center justify-center text-[#9CA3AF] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.aside>
  );
};
