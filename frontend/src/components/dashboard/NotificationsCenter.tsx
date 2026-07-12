import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Sparkles,
  Info,
  User,
  X,
  Settings,
  Clock,
  TrendingUp,
  Fuel,
  DollarSign,
  Shield,
  FileText,
  Wrench,
  Archive,
  Trash2,
  Eye,
  BellOff,
  Check
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifCategory = 'trips' | 'vehicles' | 'drivers' | 'maintenance' | 'fuel' | 'expenses' | 'compliance' | 'reports' | 'system';
type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
type NotifStatus = 'unread' | 'read' | 'archived';

interface Notification {
  id: string;
  title: string;
  description: string;
  category: NotifCategory;
  priority: Priority;
  status: NotifStatus;
  timestamp: string;
  relatedVehicle?: string;
  relatedDriver?: string;
  relatedTrip?: string;
  icon: React.ElementType;
  actionLabel?: string;
}

interface NotificationsCenterProps {
  onShowToast: (msg: string) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const w = 64; const h = 20;
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - min) / range) * (h - 6)}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible select-none">
      <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const getPriorityBadge = (priority: Priority) => {
  const map: Record<Priority, string> = {
    Critical: 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse',
    High: 'bg-amber-50 text-amber-600 border-amber-200',
    Medium: 'bg-blue-50 text-blue-600 border-blue-100',
    Low: 'bg-slate-100 text-slate-500 border-slate-200'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${map[priority]}`}>
      {priority}
    </span>
  );
};


// ─── Main Component ───────────────────────────────────────────────────────────

const CATEGORIES = ['all', 'trips', 'vehicles', 'drivers', 'maintenance', 'fuel', 'expenses', 'compliance', 'reports', 'system'] as const;
type CategoryTab = typeof CATEGORIES[number];

const PREF_TOGGLES = [
  { id: 'email', label: 'Email Notifications', checked: true },
  { id: 'push', label: 'Push Notifications', checked: true },
  { id: 'maintenance', label: 'Maintenance Alerts', checked: true },
  { id: 'trips', label: 'Trip Updates', checked: true },
  { id: 'safety', label: 'Safety Alerts', checked: true },
  { id: 'expenses', label: 'Expense Alerts', checked: false },
  { id: 'weekly', label: 'Weekly Summary', checked: true },
  { id: 'daily', label: 'Daily Digest', checked: false },
];

const notificationIcon = (category: NotifCategory): React.ElementType => {
  if (category === 'maintenance') return Wrench;
  if (category === 'fuel') return Fuel;
  if (category === 'expenses') return DollarSign;
  if (category === 'compliance') return Shield;
  if (category === 'vehicles') return Truck;
  if (category === 'trips') return CheckCircle2;
  return Info;
};

const toNotification = (notification: Record<string, any>): Notification => ({
  id: notification.id,
  title: notification.title,
  description: notification.description || notification.desc || '',
  category: notification.category || 'system',
  priority: notification.priority || (notification.critical ? 'Critical' : 'Medium'),
  status: notification.status || 'unread',
  timestamp: notification.timestamp || notification.time || 'Just now',
  relatedVehicle: notification.relatedVehicle,
  relatedDriver: notification.relatedDriver,
  relatedTrip: notification.relatedTrip,
  icon: notificationIcon(notification.category || 'system'),
  actionLabel: notification.actionLabel
});

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({ onShowToast }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All Priorities');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState(PREF_TOGGLES);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/fleet/notifications?all=true');
      if (!response.ok) throw new Error('Unable to load notifications.');
      const data = await response.json();
      setNotifications(data.map(toNotification));
    } catch {
      onShowToast('Unable to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const criticalCount = notifications.filter(n => n.priority === 'Critical').length;
  const maintCount = notifications.filter(n => n.category === 'maintenance').length;
  const tripCount = notifications.filter(n => n.category === 'trips').length;
  const complianceCount = notifications.filter(n => n.category === 'compliance').length;

  const markAllRead = async () => {
    const response = await apiFetch('/api/fleet/notifications/read-all', { method: 'PUT' });
    if (!response.ok) return onShowToast('Unable to update notifications.');
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as NotifStatus })));
    onShowToast('All notifications marked as read.');
  };

  const markRead = async (id: string) => {
    const response = await apiFetch(`/api/fleet/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'read' })
    });
    if (!response.ok) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' as NotifStatus } : n));
  };

  const archiveNotif = async (id: string) => {
    const response = await apiFetch(`/api/fleet/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'archived' })
    });
    if (!response.ok) return onShowToast('Unable to archive notification.');
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'archived' as NotifStatus } : n));
    if (selectedNotif?.id === id) setSelectedNotif(null);
    onShowToast('Notification archived.');
  };

  const deleteNotif = async (id: string) => {
    const response = await apiFetch(`/api/fleet/notifications/${id}`, { method: 'DELETE' });
    if (!response.ok) return onShowToast('Unable to remove notification.');
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotif?.id === id) setSelectedNotif(null);
    onShowToast('Notification removed.');
  };

  const togglePref = (id: string) => {
    setPrefs(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p));
  };

  const filtered = notifications.filter(n => {
    if (n.status === 'archived') return false;
    if (activeCategory !== 'all' && n.category !== activeCategory) return false;
    if (filterPriority !== 'All Priorities' && n.priority !== filterPriority) return false;
    if (filterStatus === 'Unread' && n.status !== 'unread') return false;
    if (filterStatus === 'Read' && n.status !== 'read') return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const kpis = [
    { label: 'Total', value: notifications.filter(n => n.status !== 'archived').length, color: '#2563EB', spark: [8, 10, 9, 12, 11, 12] },
    { label: 'Unread', value: unreadCount, color: '#3B82F6', spark: [4, 5, 6, 7, 6, unreadCount] },
    { label: 'Critical', value: criticalCount, color: '#EF4444', spark: [1, 2, 1, 2, 2, criticalCount] },
    { label: 'Maintenance', value: maintCount, color: '#F59E0B', spark: [1, 2, 2, 3, 2, maintCount] },
    { label: 'Trip Updates', value: tripCount, color: '#22C55E', spark: [3, 4, 3, 5, 4, tripCount] },
    { label: 'Compliance', value: complianceCount, color: '#2563EB', spark: [0, 1, 0, 1, 1, complianceCount] },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-80 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none relative pb-16 text-left">

      {/* ── Sticky Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-gray/50 bg-white/80 backdrop-blur sticky top-16 z-20">
        <div>
          <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500 font-medium mt-1.5 leading-none">
            Stay informed with real-time operational updates, maintenance reminders, compliance alerts, and fleet activities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-1.5">
              <Check className="w-3.5 h-3.5" /><span>Mark All Read</span>
            </button>
          )}
          <button onClick={() => setShowPrefs(p => !p)} className="px-3 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5">
            <Settings className="w-3.5 h-3.5" /><span>Preferences</span>
          </button>
          <button onClick={() => onShowToast('Exporting activity log...')} className="px-3 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5">
            <Download className="w-3.5 h-3.5" /><span>Export</span>
          </button>
          <button onClick={loadNotifications} className="p-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-4 bg-white border border-border-gray rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group text-left"
          >
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">{k.label}</span>
            <h3 className="text-2xl font-black tracking-tight mt-1.5" style={{ color: k.color }}>{k.value}</h3>
            <div className="mt-3 flex justify-between items-end">
              <span className="text-[9px] font-bold text-slate-400">alerts</span>
              <div className="w-10 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                <Sparkline data={k.spark} color={k.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Notification Preferences Panel ── */}
      <AnimatePresence>
        {showPrefs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-border-gray/50 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Notification Preferences</h3>
              <button onClick={() => setShowPrefs(false)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              {prefs.map(pref => (
                <div key={pref.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-border-gray/60">
                  <span className="text-[11px] font-semibold text-slate-700">{pref.label}</span>
                  <button
                    onClick={() => togglePref(pref.id)}
                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ml-2 ${pref.checked ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <motion.div
                      animate={{ x: pref.checked ? 16 : 2 }}
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Bar ── */}
      <div className="sticky top-[80px] z-10 bg-white border border-border-gray p-4 rounded-2xl flex flex-wrap items-center gap-3 shadow-sm">
        <div className="flex items-center space-x-2 border-r border-border-gray pr-3 shrink-0">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-slate-800">Filters</span>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search notifications..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border-gray rounded-xl text-xs focus:bg-white focus:outline-none transition-all"
          />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
          <option>All Priorities</option>
          <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
          <option value="All">All Status</option>
          <option value="Unread">Unread Only</option>
          <option value="Read">Read</option>
        </select>
        {(search || filterPriority !== 'All Priorities' || filterStatus !== 'All') && (
          <button onClick={() => { setSearch(''); setFilterPriority('All Priorities'); setFilterStatus('All'); }} className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">Reset</button>
        )}
        <div className="ml-auto">
          <span className="text-[10px] font-bold text-slate-400">{filtered.length} notifications</span>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div className="flex space-x-1 border-b border-border-gray/50 pb-px overflow-x-auto">
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat;
          const count = cat === 'all'
            ? notifications.filter(n => n.status !== 'archived').length
            : notifications.filter(n => n.category === cat && n.status !== 'archived').length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 border-b-2 text-[11px] font-bold transition-all cursor-pointer focus:outline-none whitespace-nowrap flex items-center space-x-1.5 ${active ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <span className="capitalize">{cat === 'all' ? 'All' : cat}</span>
              {count > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Content: Feed + Detail Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Notification Feed */}
        <div className={`space-y-3 ${selectedNotif ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {filtered.length === 0 ? (
            <div className="bg-white border border-border-gray rounded-2xl p-16 text-center shadow-sm space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                <BellOff className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="text-base font-black text-slate-700">You're All Caught Up</h3>
              <p className="text-xs text-slate-400 font-medium">No new notifications at the moment. Check back later.</p>
            </div>
          ) : filtered.map((notif, idx) => {
            const Icon = notif.icon;
            const isUnread = notif.status === 'unread';
            const isSelected = selectedNotif?.id === notif.id;

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => { setSelectedNotif(notif); void markRead(notif.id); }}
                className={`group bg-white border rounded-2xl p-4 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  isSelected ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border-gray'
                } ${isUnread ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-start space-x-3.5">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.priority === 'Critical' ? 'bg-rose-50 text-rose-500' :
                    notif.priority === 'High' ? 'bg-amber-50 text-amber-500' :
                    'bg-blue-50 text-primary'
                  }`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h4 className={`text-[12px] leading-tight ${isUnread ? 'font-black text-text-dark' : 'font-bold text-slate-600'}`}>
                          {notif.title}
                        </h4>
                        {getPriorityBadge(notif.priority)}
                        {isUnread && <span className="w-2 h-2 bg-primary rounded-full shrink-0 animate-pulse" />}
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-400 shrink-0 whitespace-nowrap">{notif.timestamp}</span>
                    </div>

                    <p className="text-[10.5px] text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
                      {notif.description}
                    </p>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center space-x-3 text-[9.5px] font-semibold text-slate-400">
                        {notif.relatedVehicle && (
                          <span className="flex items-center space-x-1">
                            <Truck className="w-3 h-3" /><span>{notif.relatedVehicle}</span>
                          </span>
                        )}
                        {notif.relatedDriver && (
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" /><span>{notif.relatedDriver}</span>
                          </span>
                        )}
                        {notif.relatedTrip && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" /><span>{notif.relatedTrip}</span>
                          </span>
                        )}
                      </div>

                      {/* Row action buttons */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUnread && (
                          <button
                            onClick={e => { e.stopPropagation(); void markRead(notif.id); onShowToast('Marked as read.'); }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary cursor-pointer transition-colors"
                            title="Mark read"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); void archiveNotif(notif.id); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); void deleteNotif(notif.id); }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedNotif && (
            <motion.div
              key={selectedNotif.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden flex flex-col text-left lg:col-span-1"
            >
              {/* Detail header */}
              <div className="p-4 border-b border-border-gray/50 flex items-center justify-between">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Notification Detail</span>
                <button onClick={() => setSelectedNotif(null)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                {/* Priority & category */}
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(selectedNotif.priority)}
                  <span className="text-[10px] font-bold text-slate-400 capitalize">{selectedNotif.category}</span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-black text-text-dark leading-snug">{selectedNotif.title}</h3>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">{selectedNotif.timestamp}</span>
                </div>

                {/* Description */}
                <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed border-l-2 border-primary/30 pl-3 py-1 bg-blue-50/30 rounded-r-lg">
                  {selectedNotif.description}
                </p>

                {/* Related records */}
                {(selectedNotif.relatedVehicle || selectedNotif.relatedDriver || selectedNotif.relatedTrip) && (
                  <div className="border border-border-gray rounded-xl p-4 space-y-2.5">
                    <h4 className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Related Records</h4>
                    {selectedNotif.relatedVehicle && (
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center space-x-2 text-slate-500">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Vehicle</span>
                        </div>
                        <span className="font-bold text-primary font-mono">{selectedNotif.relatedVehicle}</span>
                      </div>
                    )}
                    {selectedNotif.relatedDriver && (
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center space-x-2 text-slate-500">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Driver</span>
                        </div>
                        <span className="font-bold text-slate-700">{selectedNotif.relatedDriver}</span>
                      </div>
                    )}
                    {selectedNotif.relatedTrip && (
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center space-x-2 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Trip</span>
                        </div>
                        <span className="font-bold text-slate-700 font-mono">{selectedNotif.relatedTrip}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Timeline */}
                <div>
                  <h4 className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-3">Notification History</h4>
                  <div className="relative pl-4 space-y-3 border-l-2 border-primary/10">
                    {[
                      { time: selectedNotif.timestamp, event: 'Alert generated by system' },
                      { time: 'Now', event: 'Viewed by Fleet Manager' }
                    ].map((ev, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2 h-2 bg-primary border-2 border-white rounded-full" />
                        <span className="text-[10.5px] font-bold text-slate-700 block">{ev.event}</span>
                        <span className="text-[9px] font-bold text-slate-400 font-mono">{ev.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-4 border-t border-border-gray/50 space-y-2">
                {selectedNotif.actionLabel && (
                  <button
                    onClick={() => onShowToast(`Opening: ${selectedNotif.actionLabel}...`)}
                    className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
                  >
                    {selectedNotif.actionLabel}
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { void archiveNotif(selectedNotif.id); }}
                    className="py-1.5 border border-border-gray bg-white text-slate-600 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50 flex items-center justify-center space-x-1"
                  >
                    <Archive className="w-3.5 h-3.5" /><span>Archive</span>
                  </button>
                  <button
                    onClick={() => { void deleteNotif(selectedNotif.id); }}
                    className="py-1.5 border border-rose-100 bg-rose-50 text-rose-500 text-xs font-bold rounded-xl cursor-pointer hover:bg-rose-100/50 flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Smart Alert Center ── */}
      <div className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border-gray/50">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Smart Alert Center</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Actionable operational alerts requiring immediate attention.</p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'CDL License Expiring', desc: 'James Carter — 18 days remaining', severity: 'Critical', action: 'Remind Driver', color: 'rose' },
            { title: 'Vehicle In Shop', desc: 'TRK-201 at Midwest Fleet Garage', severity: 'High', action: 'View Maintenance', color: 'amber' },
            { title: 'Fuel Usage Spike', desc: 'Fleet cost 8% above monthly cap', severity: 'High', action: 'View Analytics', color: 'amber' },
            { title: 'Incident Logged', desc: 'Robert Blake — minor collision reported', severity: 'Critical', action: 'View Report', color: 'rose' },
            { title: 'Expense Approval Pending', desc: '$780 brake repair — 24h deadline', severity: 'Medium', action: 'Review Expense', color: 'blue' },
            { title: 'Trip Delayed', desc: 'TR-498 — +45 min weather delay', severity: 'High', action: 'View Trip', color: 'amber' },
          ].map((alert, i) => (
            <div key={i} className={`p-4 border rounded-xl space-y-2.5 ${
              alert.color === 'rose' ? 'bg-rose-50/60 border-rose-200' :
              alert.color === 'amber' ? 'bg-amber-50/60 border-amber-200' :
              'bg-blue-50/40 border-primary/20'
            }`}>
              <div className="flex items-start justify-between">
                <h4 className="text-[11px] font-black text-slate-800 leading-snug">{alert.title}</h4>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  alert.color === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                  alert.color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-blue-50 text-blue-600 border-blue-100'
                }`}>{alert.severity}</span>
              </div>
              <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">{alert.desc}</p>
              <button
                onClick={() => onShowToast(`${alert.action} — navigating...`)}
                className="text-[10px] font-black text-primary hover:underline cursor-pointer"
              >
                {alert.action} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Notification Insights ── */}
      <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase border-b border-slate-100 pb-2 flex items-center">
          <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Notification Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { type: 'warn', text: '5 drivers require CDL license renewal this month. Scheduling renewal reminders is recommended.' },
            { type: 'warn', text: 'Maintenance costs increased by 12% this quarter. Three vehicles may require replacement planning.' },
            { type: 'info', text: 'Vehicle TRK-201 has generated 4 alerts this week — the highest in the fleet. Review operational health.' },
            { type: 'info', text: 'Two delayed trips (TR-498, TR-490) require immediate dispatch rescheduling to maintain SLA compliance.' },
            { type: 'positive', text: 'Fleet utilization reached 74% — the highest this quarter. Operations are running at peak efficiency.' },
            { type: 'warn', text: 'Operational costs exceeded weekly average by 9%. Fuel and repair expenses are the primary contributors.' },
          ].map((ins, i) => (
            <div key={i} className={`p-3 border rounded-xl flex items-start space-x-2 text-[10.5px] font-semibold leading-relaxed ${
              ins.type === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-700' :
              ins.type === 'positive' ? 'bg-emerald-50/60 border-emerald-100 text-emerald-700' :
              'bg-blue-50/50 border-primary/20 text-slate-600'
            }`}>
              {ins.type === 'warn'
                ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                : ins.type === 'positive'
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                : <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              }
              <span>{ins.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity Timeline ── */}
      <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase border-b border-slate-100 pb-2">Fleet Activity Timeline</h3>
        <div className="relative pl-5 space-y-5 border-l-2 border-primary/10 max-w-2xl">
          {[
            { time: '5m ago', event: 'Maintenance order created for TRK-201', type: 'maintenance', user: 'Fleet Manager' },
            { time: '12m ago', event: 'License renewal alert sent to James Carter', type: 'compliance', user: 'System' },
            { time: '28m ago', event: 'Trip TR-501 completed — Chicago → Atlanta', type: 'trip', user: 'James Carter' },
            { time: '1h ago', event: 'Fuel cost threshold exceeded — $18,400 logged', type: 'fuel', user: 'System' },
            { time: '2h ago', event: 'TRK-109 returned to Available after oil change', type: 'maintenance', user: 'Fleet Manager' },
            { time: '5h ago', event: 'Incident report filed — Robert Blake, I-90', type: 'safety', user: 'Safety Officer' },
            { time: '6h ago', event: 'Weekly performance report generated and emailed', type: 'report', user: 'System' },
          ].map((ev, i) => {
            const dotColor = ev.type === 'maintenance' ? 'bg-amber-500' : ev.type === 'safety' ? 'bg-rose-500' : ev.type === 'trip' ? 'bg-emerald-500' : 'bg-primary';
            return (
              <div key={i} className="relative">
                <div className={`absolute -left-[25px] top-1 w-2.5 h-2.5 ${dotColor} border-2 border-white rounded-full`} />
                <span className="text-[11.5px] font-bold text-slate-700 block leading-snug">{ev.event}</span>
                <div className="flex items-center space-x-2 text-[9.5px] font-semibold text-slate-400 mt-0.5">
                  <span className="font-mono">{ev.time}</span>
                  <span>·</span>
                  <span>{ev.user}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
