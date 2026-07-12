import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Clock,
  Sun,
  MapPin,
  Globe,
  User,
  Truck,
} from 'lucide-react';

interface TopNavProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenQuickAdd: () => void;
  onToggleNotifications: () => void;
  onOpenProfile: () => void;
  unreadNotifications: number;
  userProfile?: { name: string; role: string } | null;
}

const workspaces = [
  { id: 'ne-hub', name: 'NE Fleet Hub', location: 'Boston, MA' },
  { id: 'mw-hub', name: 'Midwest Logistics', location: 'Chicago, IL' },
  { id: 'wc-hub', name: 'Pacific Dispatch', location: 'Oakland, CA' },
];

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenQuickAdd,
  onToggleNotifications,
  onOpenProfile,
  unreadNotifications,
  userProfile,
}) => {
  const [time, setTime] = useState(new Date());
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (date: Date) =>
    date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="cc-body sticky top-0 z-40 w-full h-16 cc-glass border-b border-[#E5E7EB] px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Left: brand + workspace + search */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Brand mark (mobile only — sidebar shows it on desktop) */}
        <div className="flex md:hidden items-center gap-2.5 shrink-0">
          <span className="w-8 h-8 rounded-[10px] bg-[#0A0A0A] flex items-center justify-center">
            <Truck className="w-[18px] h-[18px] text-white" strokeWidth={2} />
          </span>
          <span className="cc-display text-[17px] font-bold text-[#0A0A0A] hidden sm:block">FleetFlow</span>
        </div>

        <div className="md:hidden w-px h-6 bg-[#E5E7EB]" />

        {/* Workspace switcher */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            className="cc-focus flex items-center gap-2 bg-white border border-[#E5E7EB] hover:border-[#C7D2FE] px-3 py-2 rounded-[12px] text-[12px] font-semibold text-[#4B5563] hover:bg-[#F9FAFB] transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="truncate max-w-[110px]">{currentWorkspace.name}</span>
            <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
          </button>

          <AnimatePresence>
            {showWorkspaceDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowWorkspaceDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-lg z-50 overflow-hidden"
                >
                  <div className="px-3 py-2.5 border-b border-[#EEF1F4]">
                    <span className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-[0.12em]">Switch Workspace</span>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setCurrentWorkspace(ws);
                          setShowWorkspaceDropdown(false);
                        }}
                        className={`cc-focus w-full text-left px-3 py-2 rounded-[10px] text-[12px] font-medium transition-colors ${
                          ws.id === currentWorkspace.id ? 'bg-[#EFF4FF] text-[#2563EB]' : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                        }`}
                      >
                        <div className="font-semibold">{ws.name}</div>
                        <div className="text-[10px] text-[#9CA3AF] flex items-center mt-0.5">
                          <MapPin className="w-2.5 h-2.5 mr-1" />
                          {ws.location}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Global search */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search vehicles, routes, drivers, cargos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cc-focus w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder-[#9CA3AF] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right: widgets + actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Time */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-3 py-2 rounded-[12px]">
          <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <span className="text-[11px] font-semibold tabular-nums text-[#4B5563]">{formatTime(time)}</span>
          <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider pl-1.5 border-l border-[#E5E7EB]">
            {formatDate(time)}
          </span>
        </div>

        {/* Weather */}
        <div className="hidden xl:flex items-center gap-1.5 bg-white border border-[#E5E7EB] px-3 py-2 rounded-[12px]">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-semibold text-[#4B5563]">Sunny, 74°F</span>
        </div>

        {/* Quick add */}
        <button
          onClick={onOpenQuickAdd}
          className="cc-focus w-9 h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[12px] cc-shadow-sm hover:scale-[1.03] transition-[transform,background] flex items-center justify-center"
          title="Quick action tools"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
        </button>

        {/* Notifications */}
        <button
          onClick={onToggleNotifications}
          className="cc-focus w-9 h-9 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] rounded-[12px] relative transition-colors text-[#4B5563] flex items-center justify-center"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#DC2626] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Profile → opens nav drawer */}
        <button
          onClick={onOpenProfile}
          className="cc-focus flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#E5E7EB] group"
          title="Open menu"
        >
          <div className="text-right hidden md:block">
<<<<<<< HEAD
            <div className="text-xs font-bold text-text-dark leading-none">
              {userProfile?.name || 'Piyush Sharma'}
            </div>
            <span className="inline-block mt-1 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">
              {userProfile?.role || 'Fleet Manager'}
=======
            <div className="text-[12px] font-bold text-[#0A0A0A] leading-none">Piyush Sharma</div>
            <span className="inline-block mt-1 text-[9px] font-bold bg-[#EFF4FF] text-[#2563EB] border border-[#DBE6FF] px-1.5 py-0.5 rounded">
              Fleet Manager
>>>>>>> fc83281 (Resolve merge conflicts after pull)
            </span>
          </div>
          <div className="w-9 h-9 rounded-[12px] bg-[#EFF4FF] border border-[#DBE6FF] flex items-center justify-center text-[#2563EB] group-hover:scale-[1.03] transition-transform">
            <User className="w-4.5 h-4.5" />
          </div>
        </button>
      </div>
    </header>
  );
};
