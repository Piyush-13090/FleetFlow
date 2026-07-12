import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  Truck,
  User,
  Map,
  Bell,
  Settings,
  Send,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccessDeniedProps {
  attemptedResource?: string;
  requiredRole?: string;
  onNavigate?: (tab: string) => void;
  onShowToast?: (msg: string) => void;
  currentRole?: string;
}

// ─── Permission Matrix Data ────────────────────────────────────────────────────

const PERMISSION_MATRIX = [
  { module: 'Dashboard', allowed: true, required: 'All Roles' },
  { module: 'Vehicle Registry', allowed: true, required: 'Fleet Manager' },
  { module: 'Driver Management', allowed: true, required: 'Fleet Manager / Safety Officer' },
  { module: 'Trip Management', allowed: true, required: 'Fleet Manager / Driver' },
  { module: 'Maintenance', allowed: true, required: 'Fleet Manager' },
  { module: 'Fuel & Expenses', allowed: true, required: 'Fleet Manager / Financial Analyst' },
  { module: 'Reports & Analytics', allowed: false, required: 'Financial Analyst / Admin' },
  { module: 'Admin Settings', allowed: false, required: 'Admin Only' },
  { module: 'Financial Reports', allowed: false, required: 'Financial Analyst / Admin' },
];

const FAQ_ITEMS = [
  {
    q: "Why don't I have access to this resource?",
    a: "Your current role (Fleet Manager) doesn't include permission to access this module. FleetFlow uses enterprise-grade RBAC — each role grants access only to the data and features required for that role's responsibilities."
  },
  {
    q: "My administrator restricted this feature for my account.",
    a: "Administrators can override default role permissions for individual users. If your access was recently changed, contact your system administrator to understand the updated scope."
  },
  {
    q: "Your session permissions may have changed.",
    a: "If your role was recently updated, your current session may not reflect the latest permissions. Try signing out and back in, or contact your administrator."
  },
  {
    q: "The resource you attempted to access may require additional approval.",
    a: "Some modules in FleetFlow require an explicit access grant even within the same role tier. Submit a permission request via the form below for administrator review."
  },
];

const ALLOWED_PAGES = [
  { label: 'Dashboard', tab: 'dashboard', icon: LayoutDashboard },
  { label: 'Vehicle Registry', tab: 'vehicles', icon: Truck },
  { label: 'Driver Management', tab: 'drivers', icon: User },
  { label: 'Trip Management', tab: 'trips', icon: Map },
  { label: 'Notifications', tab: 'notifications', icon: Bell },
  { label: 'Profile & Settings', tab: 'settings', icon: Settings },
];

// ─── Animated Shield Illustration ─────────────────────────────────────────────

const ShieldIllustration: React.FC = () => (
  <motion.div
    animate={{ y: [-6, 6, -6] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    className="relative w-36 h-36 mx-auto"
  >
    {/* Outer glow ring */}
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.12, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute inset-0 rounded-full bg-primary/10"
    />

    {/* SVG Shield */}
    <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-xl" fill="none">
      {/* Shield body */}
      <path
        d="M60 8 L104 28 L104 68 C104 96 84 118 60 128 C36 118 16 96 16 68 L16 28 Z"
        fill="#DBEAFE"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Inner shield highlight */}
      <path
        d="M60 22 L92 38 L92 70 C92 90 78 106 60 115 C42 106 28 90 28 70 L28 38 Z"
        fill="#EFF6FF"
        stroke="#3B82F6"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Lock body */}
      <rect x="45" y="68" width="30" height="22" rx="4" fill="#2563EB" />
      {/* Lock shackle */}
      <path d="M50 68 L50 60 C50 52 70 52 70 60 L70 68" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Lock keyhole */}
      <circle cx="60" cy="77" r="3.5" fill="white" />
      <rect x="58.5" y="77" width="3" height="5" rx="1" fill="white" />
      {/* Star decorations */}
      <circle cx="28" cy="32" r="2.5" fill="#3B82F6" opacity="0.5" />
      <circle cx="92" cy="40" r="2" fill="#2563EB" opacity="0.4" />
      <circle cx="20" cy="75" r="1.5" fill="#3B82F6" opacity="0.35" />
      <circle cx="100" cy="80" r="2" fill="#2563EB" opacity="0.3" />
    </svg>

    {/* Floating alert badge */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
      className="absolute -top-1 -right-1 w-9 h-9 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
    >
      <X className="w-4 h-4 text-white" strokeWidth={3} />
    </motion.div>
  </motion.div>
);

// ─── Animated Timeline ────────────────────────────────────────────────────────

const AccessTimeline: React.FC = () => {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    const steps = [0, 1, 2, 3];
    steps.forEach((_, i) => {
      setTimeout(() => setVisibleSteps(i + 1), 400 + i * 600);
    });
  }, []);

  const steps = [
    { label: 'Access Attempted', desc: 'Navigation request received', color: 'bg-primary', icon: ArrowRight },
    { label: 'Permission Checked', desc: 'RBAC policy evaluated', color: 'bg-amber-500', icon: Shield },
    { label: 'Access Denied', desc: 'Insufficient permissions', color: 'bg-rose-500', icon: Lock },
    { label: 'Security Event Logged', desc: 'Audit trail recorded', color: 'bg-slate-400', icon: CheckCircle2 },
  ];

  return (
    <div className="relative pl-6 space-y-4 border-l-2 border-primary/10">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <AnimatePresence key={i}>
            {visibleSteps > i && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="relative"
              >
                <div className={`absolute -left-[29px] top-1 w-5 h-5 ${s.color} border-2 border-white rounded-full flex items-center justify-center shadow`}>
                  <Icon className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-[11.5px] font-black text-slate-700 block leading-snug">{s.label}</span>
                <span className="text-[9.5px] font-medium text-slate-400">{s.desc}</span>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
};

// ─── Subtle Background Pattern ────────────────────────────────────────────────

const BackgroundPattern: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Faint grid */}
    <svg width="100%" height="100%" className="opacity-[0.025]">
      <defs>
        <pattern id="grid403" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563EB" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid403)" />
    </svg>

    {/* Floating particles */}
    {[
      { cx: '15%', cy: '20%', r: 3, delay: 0 },
      { cx: '80%', cy: '15%', r: 2, delay: 0.8 },
      { cx: '90%', cy: '60%', r: 2.5, delay: 1.4 },
      { cx: '10%', cy: '70%', r: 2, delay: 0.4 },
      { cx: '50%', cy: '5%', r: 1.5, delay: 1.0 },
      { cx: '70%', cy: '85%', r: 3, delay: 0.6 },
    ].map((p, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-primary/20"
        style={{ left: p.cx, top: p.cy, width: p.r * 2, height: p.r * 2 }}
        animate={{ y: [-4, 4, -4], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  attemptedResource = 'Financial Reports',
  requiredRole = 'Financial Analyst',
  onNavigate,
  onShowToast,
  currentRole
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [requestNote, setRequestNote] = useState('');

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
    onShowToast?.('Access request submitted to administrator.');
  };

  const go = (tab: string) => {
    onNavigate?.(tab);
  };

  return (
    <div className="relative min-h-[70vh] select-none">
      <BackgroundPattern />

      <div className="relative z-10 max-w-4xl mx-auto py-8 space-y-6 text-left">

        {/* ── Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-border-gray rounded-2xl shadow-sm p-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Illustration Column */}
            <div className="flex flex-col items-center space-y-4 shrink-0">
              <ShieldIllustration />
              <div className="text-center">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-50 border border-rose-200 rounded-full">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-wide">Access Denied — 403</span>
                </div>
              </div>
            </div>

            {/* Text Column */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black text-text-dark tracking-tight leading-none">Access Restricted</h1>
              <p className="text-sm text-slate-500 font-semibold mt-3 leading-relaxed">
                You don't have permission to access this page or perform this action.<br />
                Your current role doesn't include access to this resource.
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1.5">
                Please contact your administrator if you believe this is incorrect.
              </p>

              {/* Permission Summary */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: 'Current Role', val: currentRole || 'Fleet Manager', color: 'text-primary bg-blue-50 border-primary/20' },
                  { label: 'Attempted Resource', val: attemptedResource, color: 'text-rose-600 bg-rose-50 border-rose-200' },
                  { label: 'Required Role', val: requiredRole, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                  { label: 'Access Status', val: 'Denied', color: 'text-rose-600 bg-rose-50 border-rose-200' },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-slate-50 border border-border-gray/60 rounded-xl">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">{item.label}</span>
                    <span className={`text-xs font-black mt-1 px-2 py-0.5 rounded-full border inline-block ${item.color}`}>{item.val}</span>
                  </div>
                ))}
              </div>

              {/* Access Timeline */}
              <div className="mt-6 pt-5 border-t border-border-gray/50">
                <h4 className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-3">Access Attempt Timeline</h4>
                <AccessTimeline />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Current User Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-border-gray/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Current User Identity</h3>
            </div>
            <div className="p-5 flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 text-xl font-black text-primary shadow-sm">
                AT
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="text-sm font-black text-text-dark">Alex Thompson</h4>
                  <p className="text-[10.5px] text-slate-400 font-medium">alex.thompson@fleetflow.io</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-blue-50 text-primary border border-blue-100 rounded-full text-[9.5px] font-black">Fleet Manager</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[9.5px] font-bold">Fleet Operations</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9.5px] font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /><span>Active</span>
                  </span>
                </div>
                <div className="pt-1.5 border-t border-border-gray/50 grid grid-cols-2 gap-2">
                  {[
                    { l: 'Workspace', v: 'FleetFlow HQ' },
                    { l: 'Region', v: 'Midwest' },
                    { l: 'Employee ID', v: 'EMP-4821' },
                    { l: 'Permission Level', v: 'Level 2' },
                  ].map(item => (
                    <div key={item.l}>
                      <span className="text-[8.5px] uppercase font-black text-slate-400 tracking-wider">{item.l}</span>
                      <p className="text-[10.5px] font-bold text-slate-600">{item.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Request Access Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-border-gray/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Request Access</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Submit a permission request to your administrator.</p>
            </div>
            <div className="p-5">
              <AnimatePresence mode="wait">
                {requestSent ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-4 space-y-3"
                  >
                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-text-dark">Request Submitted!</h4>
                      <p className="text-[10.5px] text-slate-400 font-medium mt-1">Your administrator will review the request within 1 business day.</p>
                    </div>
                    <button onClick={() => setRequestSent(false)} className="text-[10px] font-bold text-primary hover:underline cursor-pointer">Submit another request</button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleRequest} className="space-y-3">
                    <div className="p-3 bg-blue-50/50 border border-primary/15 rounded-xl text-[10.5px] text-slate-600 font-medium leading-relaxed">
                      Requesting access to: <span className="font-black text-primary">{attemptedResource}</span>
                    </div>
                    <textarea
                      value={requestNote}
                      onChange={e => setRequestNote(e.target.value)}
                      placeholder="Explain why you need access to this resource..."
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:border-primary/40 transition-all h-20 resize-none"
                    />
                    <div className="flex space-x-2">
                      <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm flex items-center justify-center space-x-1.5">
                        <Send className="w-3.5 h-3.5" /><span>Request Permission</span>
                      </button>
                      <button type="button" onClick={() => onShowToast?.('Opening admin contact...')} className="flex-1 py-2.5 border border-border-gray bg-white text-slate-600 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50 flex items-center justify-center space-x-1.5">
                        <User className="w-3.5 h-3.5" /><span>Contact Admin</span>
                      </button>
                    </div>
                    <button type="button" onClick={() => onShowToast?.('Opening role documentation...')} className="w-full text-[10px] font-bold text-slate-400 hover:text-primary cursor-pointer flex items-center justify-center space-x-1 transition-colors">
                      <BookOpen className="w-3 h-3" /><span>View Role Permissions Guide</span>
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ── Permission Matrix ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-border-gray/50">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Permission Matrix — Fleet Manager Role</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Your current access level across all FleetFlow modules.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Your Access</th>
                  <th className="px-5 py-3">Required Role</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray/40 text-[11px] font-semibold text-slate-700">
                {PERMISSION_MATRIX.map((row, i) => (
                  <motion.tr
                    key={row.module}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className={`hover:bg-slate-50/50 transition-colors ${!row.allowed ? 'bg-rose-50/20' : ''}`}
                  >
                    <td className="px-5 py-3 font-bold text-slate-700">{row.module}</td>
                    <td className="px-5 py-3">
                      {row.allowed
                        ? <span className="flex items-center space-x-1.5 text-emerald-600 font-black"><Check className="w-3.5 h-3.5" /><span>Allowed</span></span>
                        : <span className="flex items-center space-x-1.5 text-rose-500 font-black"><X className="w-3.5 h-3.5" /><span>Restricted</span></span>
                      }
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-medium">{row.required}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${
                        row.allowed
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                      }`}>
                        {row.allowed ? 'Active' : 'Denied'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Suggested Navigation + FAQ ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Suggested Pages */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-border-gray/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Go Somewhere You Can Access</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Pages available with your current Fleet Manager role.</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {ALLOWED_PAGES.map(page => {
                const Icon = page.icon;
                return (
                  <button
                    key={page.tab}
                    onClick={() => go(page.tab)}
                    className="flex items-center space-x-2.5 p-3 border border-border-gray bg-slate-50 hover:bg-white hover:border-primary/30 hover:shadow-sm rounded-xl text-left cursor-pointer transition-all group"
                  >
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-primary transition-colors">{page.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-border-gray/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Why Am I Seeing This?</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Common reasons for access denial.</p>
            </div>
            <div className="divide-y divide-border-gray/40">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    <span className="text-[11px] font-bold text-slate-700 pr-3 leading-snug">{item.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} className="shrink-0">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-[10.5px] text-slate-500 font-medium leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Security Notice + AI Assistant ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-2 bg-blue-50/40 border border-primary/20 p-5 rounded-2xl space-y-2"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h4 className="text-xs font-black text-slate-800">Enterprise Security Notice</h4>
            </div>
            <div className="space-y-2 pl-0.5">
              {[
                'FleetFlow uses enterprise-grade Role-Based Access Control (RBAC) to protect operational and financial data.',
                'Every navigation request is validated against your role policy on both the frontend and backend.',
                'This access denial has been logged to your account\'s security audit trail for review.',
              ].map((line, i) => (
                <div key={i} className="flex items-start space-x-2 text-[10.5px] text-slate-600 font-medium leading-relaxed">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 flex items-center space-x-2 text-[9.5px] font-black text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Event logged at {new Date().toLocaleTimeString()} — {new Date().toLocaleDateString()}</span>
            </div>
          </motion.div>

          {/* AI Assistant */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.56 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm p-5 space-y-4"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-slate-800">AI Assistant</h4>
                <p className="text-[9.5px] text-slate-400 font-medium">FleetFlow Guide</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 border border-border-gray/60 rounded-xl text-[10.5px] text-slate-600 font-medium leading-relaxed">
                Need help finding the right page? I can guide you based on your <span className="font-black text-primary">Fleet Manager</span> role.
              </div>
              {[
                'Take me to my trips →',
                'Show vehicle registry →',
                'Open my profile →',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    if (suggestion.includes('trip')) go('trips');
                    else if (suggestion.includes('vehicle')) go('vehicles');
                    else go('settings');
                  }}
                  className="w-full text-left p-2 text-[10px] font-bold text-primary hover:bg-blue-50 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                >
                  <span>{suggestion}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </motion.div>

        </div>

        {/* ── Alert Triangle Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center space-x-2 text-[10px] font-semibold text-slate-400 py-2"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Error 403 — Forbidden · FleetFlow Enterprise RBAC · This event has been logged.</span>
        </motion.div>

      </div>
    </div>
  );
};
