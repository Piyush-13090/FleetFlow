import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Truck,
  User,
  Map,
  Wrench,
  Fuel,
  BarChart2,
  Bell,
  Settings,
  ArrowLeft,
  Home,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Activity,
  ChevronRight,
  Clock,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Slash,
  Keyboard
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotFound404Props {
  onNavigate?: (tab: string) => void;
  onShowToast?: (msg: string) => void;
}

// ─── Background Decoration ────────────────────────────────────────────────────

const BackgroundDecoration: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
    {/* Subtle blueprint grid */}
    <svg width="100%" height="100%" className="opacity-[0.028]">
      <defs>
        <pattern id="blueprint404" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#2563EB" strokeWidth="0.7" />
        </pattern>
        <pattern id="blueprint404_cross" width="192" height="192" patternUnits="userSpaceOnUse">
          <rect width="192" height="192" fill="url(#blueprint404)" />
          <path d="M 96 0 L 96 192 M 0 96 L 192 96" fill="none" stroke="#2563EB" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#blueprint404_cross)" />
    </svg>

    {/* Floating particles */}
    {[
      { x: '8%', y: '12%', s: 4, delay: 0 },
      { x: '88%', y: '8%', s: 3, delay: 0.7 },
      { x: '92%', y: '55%', s: 2.5, delay: 1.3 },
      { x: '5%', y: '72%', s: 3.5, delay: 0.3 },
      { x: '55%', y: '4%', s: 2, delay: 1.0 },
      { x: '75%', y: '88%', s: 4, delay: 0.5 },
      { x: '22%', y: '90%', s: 2.5, delay: 1.6 },
      { x: '45%', y: '93%', s: 2, delay: 0.9 },
    ].map((p, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-primary/15"
        style={{ left: p.x, top: p.y, width: p.s * 2, height: p.s * 2 }}
        animate={{ y: [-5, 5, -5], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 4 + i * 0.6, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ─── Truck Illustration ───────────────────────────────────────────────────────

const TruckIllustration: React.FC = () => (
  <motion.div
    animate={{ y: [-5, 5, -5] }}
    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    className="relative w-44 h-28 mx-auto"
  >
    <svg viewBox="0 0 200 110" fill="none" className="w-full h-full drop-shadow-lg">
      {/* Road */}
      <rect x="0" y="88" width="200" height="6" rx="2" fill="#E2E8F0" />
      {/* Road dashes */}
      {[20, 60, 100, 140].map((x, i) => (
        <rect key={i} x={x} y="90" width="18" height="2" rx="1" fill="#CBD5E1" />
      ))}

      {/* Truck body */}
      <rect x="22" y="44" width="108" height="44" rx="6" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
      {/* Cab */}
      <path d="M 130 50 L 130 88 L 180 88 L 180 62 L 165 50 Z" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
      {/* Window */}
      <path d="M 140 56 L 140 72 L 172 72 L 172 62 L 158 56 Z" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Wheels */}
      <circle cx="60" cy="90" r="10" fill="#1E3A5F" stroke="#2563EB" strokeWidth="2" />
      <circle cx="60" cy="90" r="5" fill="#DBEAFE" />
      <circle cx="115" cy="90" r="10" fill="#1E3A5F" stroke="#2563EB" strokeWidth="2" />
      <circle cx="115" cy="90" r="5" fill="#DBEAFE" />
      <circle cx="162" cy="90" r="10" fill="#1E3A5F" stroke="#2563EB" strokeWidth="2" />
      <circle cx="162" cy="90" r="5" fill="#DBEAFE" />

      {/* TransitOps logo on side */}
      <rect x="32" y="58" width="86" height="22" rx="4" fill="#2563EB" opacity="0.12" />
      <text x="75" y="74" textAnchor="middle" fill="#2563EB" fontSize="8" fontWeight="800" fontFamily="system-ui">TRANSIT OPS</text>

      {/* Question mark sign */}
      <rect x="84" y="10" width="32" height="32" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <text x="100" y="32" textAnchor="middle" fill="#D97706" fontSize="20" fontWeight="900" fontFamily="system-ui">?</text>
      {/* Sign pole */}
      <rect x="98" y="42" width="4" height="14" rx="1" fill="#94A3B8" />

      {/* Headlights */}
      <ellipse cx="182" cy="72" rx="5" ry="3.5" fill="#FEF9C3" stroke="#FBBF24" strokeWidth="1" />
    </svg>

    {/* Floating badge */}
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 400 }}
      className="absolute -top-4 -right-3 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-md"
    >
      ROUTE NOT FOUND
    </motion.div>
  </motion.div>
);

// ─── Quick Nav Cards ──────────────────────────────────────────────────────────

const QUICK_NAV = [
  { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Fleet overview' },
  { tab: 'vehicles', label: 'Vehicle Registry', icon: Truck, desc: 'Manage fleet' },
  { tab: 'drivers', label: 'Driver Management', icon: User, desc: 'All drivers' },
  { tab: 'trips', label: 'Trip Management', icon: Map, desc: 'Active routes' },
  { tab: 'maintenance', label: 'Maintenance', icon: Wrench, desc: 'Service center' },
  { tab: 'fuel', label: 'Fuel & Expenses', icon: Fuel, desc: 'Financial logs' },
  { tab: 'reports', label: 'Reports', icon: BarChart2, desc: 'Analytics hub' },
  { tab: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts center' },
];

const RECENT_ACTIVITY = [
  { event: 'Trip TR-501 Completed', time: '8m ago', icon: TrendingUp, color: 'text-emerald-500' },
  { event: 'Vehicle TRK-201 Maintenance', time: '32m ago', icon: Wrench, color: 'text-amber-500' },
  { event: 'Fuel Log FL-003 Added', time: '1h ago', icon: Fuel, color: 'text-blue-500' },
  { event: 'Report Generated — July', time: '2h ago', icon: BarChart2, color: 'text-primary' },
  { event: 'Driver License Alert Sent', time: '3h ago', icon: Bell, color: 'text-rose-500' },
];

const SYSTEM_STATUS = [
  { label: 'API Gateway', ok: true },
  { label: 'Database', ok: true },
  { label: 'Authentication', ok: true },
  { label: 'Notifications', ok: true },
  { label: 'File Storage', ok: true },
];

const KEYBOARD_SHORTCUTS = [
  { key: '/', label: 'Open Search' },
  { key: 'D', label: 'Go to Dashboard' },
  { key: 'T', label: 'Trip Management' },
  { key: 'V', label: 'Vehicle Registry' },
  { key: '?', label: 'Help Center' },
];

// ─── Search Component ─────────────────────────────────────────────────────────

const SearchCard: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const SUGGESTIONS = [
    { label: 'Vehicle Registry', tab: 'vehicles', icon: Truck },
    { label: 'Trip Management', tab: 'trips', icon: Map },
    { label: 'Driver Management', tab: 'drivers', icon: User },
    { label: 'Reports & Analytics', tab: 'reports', icon: BarChart2 },
    { label: 'Maintenance Center', tab: 'maintenance', icon: Wrench },
    { label: 'Fuel & Expenses', tab: 'fuel', icon: DollarSign },
    { label: 'Notifications', tab: 'notifications', icon: Bell },
    { label: 'Profile & Settings', tab: 'settings', icon: Settings },
  ];

  const filtered = query.length > 0
    ? SUGGESTIONS.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))
    : SUGGESTIONS.slice(0, 4);

  return (
    <div className="relative">
      <div className={`flex items-center bg-white border-2 rounded-2xl overflow-hidden transition-all shadow-sm ${focused ? 'border-primary/40 shadow-md ring-4 ring-primary/8' : 'border-border-gray'}`}>
        <div className="pl-4 pr-2">
          <Search className={`w-4.5 h-4.5 transition-colors ${focused ? 'text-primary' : 'text-slate-400'}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search vehicles, drivers, trips, reports..."
          className="flex-1 py-3.5 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none bg-transparent"
        />
        {query && (
          <button onClick={() => setQuery('')} className="pr-3 text-slate-400 hover:text-slate-600 cursor-pointer">
            <Slash className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="pr-3">
          <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-400">/</kbd>
        </div>
      </div>

      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-2 left-0 right-0 bg-white border border-border-gray rounded-2xl shadow-xl z-30 overflow-hidden"
          >
            <div className="p-2">
              <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider px-3 py-2">
                {query ? 'Search Results' : 'Quick Navigation'}
              </div>
              {filtered.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onMouseDown={() => { onNavigate?.(item.tab); setQuery(''); }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer text-left group"
                  >
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[11.5px] font-bold text-slate-700 group-hover:text-primary transition-colors">{item.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-primary transition-colors" />
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-4 text-[10.5px] text-slate-400 font-medium">No results for "{query}"</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const NotFound404: React.FC<NotFound404Props> = ({ onNavigate, onShowToast }) => {
  const [timelineStep, setTimelineStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimelineStep(prev => (prev < RECENT_ACTIVITY.length ? prev + 1 : prev));
    }, 350);
    return () => clearInterval(interval);
  }, []);

  const go = (tab: string) => onNavigate?.(tab);

  return (
    <div className="relative min-h-[75vh] select-none">
      <BackgroundDecoration />

      <div className="relative z-10 max-w-5xl mx-auto py-8 space-y-6 text-left">

        {/* ── Hero Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-border-gray rounded-2xl shadow-sm p-8 text-center"
        >
          {/* Big 404 */}
          <div className="relative inline-block mb-4">
            <span className="absolute inset-0 flex items-center justify-center text-[110px] font-black text-primary/6 leading-none select-none" aria-hidden>
              404
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative text-[80px] font-black text-text-dark tracking-tighter leading-none z-10"
            >
              <span className="text-primary">4</span>
              <span className="text-slate-200">0</span>
              <span className="text-primary">4</span>
            </motion.h1>
          </div>

          {/* Illustration */}
          <TruckIllustration />

          {/* Text */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 space-y-2">
            <h2 className="text-xl font-black text-text-dark tracking-tight">Oops! We Couldn't Find That Page</h2>
            <p className="text-sm text-slate-500 font-semibold max-w-lg mx-auto leading-relaxed">
              The page you're looking for doesn't exist, may have been moved, or the URL is incorrect.
            </p>
            <p className="text-xs text-slate-400 font-medium">Don't worry — your fleet operations are still running smoothly.</p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <button
              onClick={() => go('dashboard')}
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center space-x-2 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" /><span>Return to Dashboard</span>
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2.5 border border-border-gray bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /><span>Go Back</span>
            </button>
            <button
              onClick={() => onShowToast?.('Opening Help Center...')}
              className="px-4 py-2.5 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-2 transition-all"
            >
              <HelpCircle className="w-4 h-4" /><span>Help Center</span>
            </button>
          </motion.div>
        </motion.div>

        {/* ── Search ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="max-w-2xl mx-auto">
          <SearchCard onNavigate={go} />
        </motion.div>

        {/* ── Quick Navigation Grid ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
          <h3 className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-3 px-1">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_NAV.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.04 }}
                  onClick={() => go(item.tab)}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="bg-white border border-border-gray p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer text-left transition-all group hover:border-primary/25"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-4.5 h-4.5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-[11.5px] font-black text-slate-700 group-hover:text-primary transition-colors leading-tight">{item.label}</h4>
                  <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Three Column: Activity + System + Shortcuts ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border-gray/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Recent Activity</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Latest fleet events</p>
            </div>
            <div className="p-4 relative pl-7 space-y-4 border-l-2 border-primary/10 ml-5">
              {RECENT_ACTIVITY.map((item, i) => {
                const Icon = item.icon;
                return (
                  <AnimatePresence key={i}>
                    {timelineStep > i && (
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative cursor-pointer group"
                        onClick={() => go('dashboard')}
                      >
                        <div className="absolute -left-[27px] top-1 w-4 h-4 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center">
                          <Icon className={`w-2 h-2 ${item.color}`} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 group-hover:text-primary transition-colors block leading-snug">{item.event}</span>
                        <span className="text-[9px] font-mono text-slate-400">{item.time}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border-gray/50 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">System Status</h3>
              <span className="text-[9.5px] font-black text-emerald-600 flex items-center space-x-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span>All Operational</span>
              </span>
            </div>
            <div className="p-4 space-y-3">
              {SYSTEM_STATUS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 + i * 0.07 }}
                  className="flex items-center justify-between text-[11px] font-semibold text-slate-600"
                >
                  <span>{s.label}</span>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[9.5px] font-bold text-emerald-600">Operational</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button onClick={() => onShowToast?.('Opening status page...')}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer flex items-center space-x-1">
                <Activity className="w-3 h-3" /><span>View full status page</span>
              </button>
            </div>
          </motion.div>

          {/* Keyboard Shortcuts */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border-gray/50 flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Keyboard Shortcuts</h3>
            </div>
            <div className="p-4 space-y-3">
              {KEYBOARD_SHORTCUTS.map((shortcut, i) => (
                <motion.div
                  key={shortcut.key}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.07 }}
                  className="flex items-center justify-between text-[11px] font-semibold text-slate-600"
                >
                  <span>{shortcut.label}</span>
                  <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 min-w-[24px] text-center font-mono shadow-sm">
                    {shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Helpful Suggestions + AI Assistant ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Helpful Suggestions */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border-gray/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">What Would You Like to Do?</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Helpful suggestions to get you back on track.</p>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: 'Return to Fleet Dashboard', icon: Home, action: () => go('dashboard'), color: 'text-primary' },
                { label: 'Check the URL & Try Again', icon: Search, action: () => {}, color: 'text-slate-600' },
                { label: 'View Your Notifications', icon: Bell, action: () => go('notifications'), color: 'text-amber-500' },
                { label: 'Open Help Documentation', icon: HelpCircle, action: () => onShowToast?.('Opening docs...'), color: 'text-slate-600' },
                { label: 'Contact Your Administrator', icon: User, action: () => onShowToast?.('Opening admin contact...'), color: 'text-slate-600' },
                { label: 'View Recent Fleet Activity', icon: Clock, action: () => go('trips'), color: 'text-emerald-600' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    onClick={s.action}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl text-left cursor-pointer group transition-colors"
                  >
                    <div className="w-7 h-7 bg-slate-50 border border-border-gray/60 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                      <Icon className={`w-3.5 h-3.5 ${s.color} group-hover:text-primary transition-colors`} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-primary transition-colors flex-1">{s.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* AI Assistant */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border-gray/50 flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-800">AI Navigation Assistant</h3>
                <p className="text-[9.5px] text-slate-400 font-medium">Powered by TransitOps Intelligence</p>
              </div>
            </div>
            <div className="p-5 flex-1 space-y-4">
              <div className="p-3.5 bg-blue-50/50 border border-primary/15 rounded-xl text-[11px] font-semibold text-slate-600 leading-relaxed">
                Can't find what you're looking for? I can guide you based on your <span className="font-black text-primary">Fleet Manager</span> role and recent activity.
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Based on Your Recent Usage</p>
                {[
                  { suggestion: 'You recently viewed Trip TR-501 — continue there →', tab: 'trips' },
                  { suggestion: 'TRK-201 is in maintenance — check its status →', tab: 'maintenance' },
                  { suggestion: 'Your weekly report is ready to download →', tab: 'reports' },
                ].map((s, i) => (
                  <button key={i} onClick={() => go(s.tab)}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-border-gray/60 hover:border-primary/20 rounded-xl text-[10.5px] font-semibold text-slate-600 hover:text-primary transition-all cursor-pointer flex items-center justify-between group">
                    <span>{s.suggestion}</span>
                    <ArrowRight className="w-3 h-3 shrink-0 text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-2">Popular Modules</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { tab: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { tab: 'vehicles', icon: Truck, label: 'Vehicles' },
                    { tab: 'trips', icon: Map, label: 'Trips' },
                    { tab: 'reports', icon: BarChart2, label: 'Reports' },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button key={item.tab} onClick={() => go(item.tab)}
                        className="flex flex-col items-center space-y-1.5 p-2.5 bg-slate-50 hover:bg-blue-50 border border-border-gray/60 hover:border-primary/20 rounded-xl cursor-pointer group transition-all">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-[8.5px] font-bold text-slate-400 group-hover:text-primary transition-colors text-center leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── Footer Bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 border-t border-border-gray/40"
        >
          <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400">
            <Truck className="w-3.5 h-3.5 text-primary/40" />
            <span>TransitOps · Error 404 · Page Not Found · Your fleet operations continue uninterrupted.</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => go('dashboard')} className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-xl cursor-pointer hover:bg-primary/95 transition-all flex items-center space-x-1.5">
              <Home className="w-3 h-3" /><span>Return Home</span>
            </button>
            <button onClick={() => onShowToast?.('Opening support channel...')} className="px-3 py-1.5 border border-border-gray bg-white text-slate-600 text-[10px] font-bold rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
              Contact Support
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
