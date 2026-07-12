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
  User 
} from 'lucide-react';

interface TopNavProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenQuickAdd: () => void;
  onToggleNotifications: () => void;
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white/80 backdrop-blur-md border-b border-border-gray px-6 flex items-center justify-between select-none">
      {/* Search & Workspace Switcher */}
      <div className="flex items-center space-x-6 flex-1 max-w-xl">
        {/* Workspace Switcher */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            className="flex items-center space-x-2 bg-slate-50 border border-border-gray hover:border-primary/45 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100/50 transition-all duration-200 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="truncate max-w-[100px]">{currentWorkspace.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <AnimatePresence>
            {showWorkspaceDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowWorkspaceDropdown(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 mt-2 w-52 bg-white border border-border-gray rounded-xl shadow-xl z-40 overflow-hidden"
                >
                  <div className="p-2 border-b border-border-gray/50 bg-slate-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2">Switch Workspace</span>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setCurrentWorkspace(ws);
                          setShowWorkspaceDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          ws.id === currentWorkspace.id 
                            ? 'bg-primary/5 text-primary' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold">{ws.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center mt-0.5">
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

        {/* Global Search Bar */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicles, routes, drivers, cargos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-slate-50/70 border border-border-gray rounded-xl text-xs text-text-dark placeholder-slate-400 focus:bg-white focus:outline-none input-glow transition-all duration-200"
          />
        </div>
      </div>

      {/* Widgets & Action Buttons */}
      <div className="flex items-center space-x-5">
        {/* Time Widget */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-50 border border-border-gray/60 px-3 py-1.5 rounded-xl text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-semibold font-mono tracking-tight text-slate-600">
            {formatTime(time)}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1.5 border-l border-slate-200">
            {formatDate(time)}
          </span>
        </div>

        {/* Weather Widget */}
        <div className="hidden xl:flex items-center space-x-1.5 bg-slate-50 border border-border-gray/60 px-3 py-1.5 rounded-xl text-slate-600">
          <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span className="text-[11px] font-semibold text-slate-600">Sunny, 74°F</span>
        </div>

        {/* Quick Add Button (+) */}
        <button
          onClick={onOpenQuickAdd}
          className="p-2 bg-primary hover:bg-primary/95 text-white rounded-xl shadow-sm hover:shadow hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center"
          title="Quick Action dispatch tools"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
        </button>

        {/* Notification Bell */}
        <button
          onClick={onToggleNotifications}
          className="p-2 border border-border-gray bg-white hover:bg-slate-50 rounded-xl relative transition-all duration-200 cursor-pointer text-slate-600 hover:text-slate-800"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-red text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white animate-pulse">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* User Profile Avatar / Role Badge */}
        <div className="flex items-center space-x-3 pl-2 border-l border-border-gray">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-text-dark leading-none">
              {userProfile?.name || 'Piyush Sharma'}
            </div>
            <span className="inline-block mt-1 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">
              {userProfile?.role || 'Fleet Manager'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold overflow-hidden shadow-inner">
            <User className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>
    </header>
  );
};
