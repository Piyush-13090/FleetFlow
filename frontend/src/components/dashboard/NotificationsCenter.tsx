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
  Fuel,
  DollarSign,
  Shield,
  Wrench,
  Archive,
  Trash2,
  Eye,
  BellOff,
  Check,
  Activity
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { SectionHeader } from '../ui/SectionHeader';
import { KpiTile } from '../ui/KpiTile';
import { Reveal } from '../ui/Reveal';
import { Segmented } from '../ui/Segmented';

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

const getPriorityBadge = (priority: Priority) => {
  const map: Record<Priority, string> = {
    Critical: 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2] animate-pulse',
    High: 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]',
    Medium: 'bg-[#EFF4FF] text-primary border-[#DBE6FF]',
    Low: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]'
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
    { label: 'Total', value: notifications.filter(n => n.status !== 'archived').length, color: '#2563EB', spark: [8, 10, 9, 12, 11, 12], icon: Activity },
    { label: 'Unread', value: unreadCount, color: '#2563EB', spark: [4, 5, 6, 7, 6, unreadCount], icon: BellOff },
    { label: 'Critical', value: criticalCount, color: '#DC2626', spark: [1, 2, 1, 2, 2, criticalCount], icon: AlertTriangle },
    { label: 'Maintenance', value: maintCount, color: '#D97706', spark: [1, 2, 2, 3, 2, maintCount], icon: Wrench },
    { label: 'Trip Updates', value: tripCount, color: '#059669', spark: [3, 4, 3, 5, 4, tripCount], icon: Truck },
    { label: 'Compliance', value: complianceCount, color: '#2563EB', spark: [0, 1, 0, 1, 1, complianceCount], icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-10 w-80 bg-slate-100 rounded-[12px]" />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-slate-50 rounded-[12px]" />)}
        </div>
        <div className="h-96 bg-slate-50 rounded-[16px]" />
      </div>
    );
  }

  return (
    <Reveal className="space-y-6 select-none relative pb-16 text-left">

      {/* ── Sticky Header ── */}
      <SectionHeader
        title="Notifications & Alerts"
        subtitle="Stay informed with real-time operational updates, maintenance reminders, compliance alerts, and fleet activities."
        actions={
          <>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead} 
                className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
            <button 
              onClick={() => setShowPrefs(p => !p)} 
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm flex items-center space-x-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>
            <button 
              onClick={() => onShowToast('Exporting activity log...')} 
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button 
              onClick={loadNotifications} 
              className="p-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] rounded-[12px] transition-all cursor-pointer cc-shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        }
      />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <KpiTile
            key={k.label}
            icon={k.icon}
            label={k.label}
            value={k.value}
            color={k.color}
            spark={k.spark}
            tint={k.color === '#2563EB' ? '#EFF4FF' : k.color === '#059669' ? '#ECFDF5' : k.color === '#DC2626' ? '#FEF2F2' : '#FFFBEB'}
          />
        ))}
      </div>

      {/* ── Notification Preferences Panel ── */}
      <AnimatePresence>
        {showPrefs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Notification Preferences</h3>
              <button 
                onClick={() => setShowPrefs(false)} 
                className="p-1 hover:bg-[#F9FAFB] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4 text-[#9CA3AF]" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              {prefs.map(pref => (
                <div key={pref.id} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-[12px] border border-[#E5E7EB] cc-shadow-sm">
                  <span className="text-[11px] font-semibold text-[#4B5563]">{pref.label}</span>
                  <button
                    onClick={() => togglePref(pref.id)}
                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ml-2 ${pref.checked ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <motion.div
                      animate={{ x: pref.checked ? 16 : 2 }}
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Bar ── */}
      <div className="sticky top-0 z-10 bg-white border border-[#E5E7EB] p-4 rounded-[16px] flex flex-wrap items-center gap-3 cc-shadow-sm">
        <div className="flex items-center space-x-2 border-r border-[#E5E7EB] pr-3 shrink-0 text-[#0A0A0A]">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-wider">Filters</span>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text" 
            placeholder="Search notifications..."
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] text-xs focus:bg-white focus:outline-none transition-all font-semibold text-[#4B5563]"
          />
        </div>
        <select 
          value={filterPriority} 
          onChange={e => setFilterPriority(e.target.value)} 
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer focus:bg-white"
        >
          <option>All Priorities</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)} 
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer focus:bg-white"
        >
          <option value="All">All Status</option>
          <option value="Unread">Unread Only</option>
          <option value="Read">Read</option>
        </select>
        {(search || filterPriority !== 'All Priorities' || filterStatus !== 'All') && (
          <button 
            onClick={() => { setSearch(''); setFilterPriority('All Priorities'); setFilterStatus('All'); }} 
            className="px-2 py-1 text-xs font-bold text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
          >
            Reset
          </button>
        )}
        <div className="ml-auto">
          <span className="text-[10px] font-bold text-[#9CA3AF]">{filtered.length} notifications</span>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div className="flex justify-start overflow-x-auto pb-1 max-w-full">
        <Segmented
          value={activeCategory}
          onChange={(v) => setActiveCategory(v as any)}
          options={CATEGORIES.map(cat => {
            const count = cat === 'all'
              ? notifications.filter(n => n.status !== 'archived').length
              : notifications.filter(n => n.category === cat && n.status !== 'archived').length;
            return {
              id: cat,
              label: (
                <span className="flex items-center space-x-1.5 whitespace-nowrap capitalize">
                  <span>{cat === 'all' ? 'All' : cat}</span>
                  {count > 0 && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-200/50 text-[#4B5563]">
                      {count}
                    </span>
                  )}
                </span>
              )
            };
          })}
        />
      </div>

      {/* ── Main Content: Feed + Detail Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Notification Feed */}
        <div className={`space-y-3 text-left ${selectedNotif ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-16 text-center cc-shadow-sm space-y-4">
              <div className="w-16 h-16 bg-[#EFF4FF] rounded-[16px] flex items-center justify-center mx-auto">
                <BellOff className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="text-base font-black text-[#0A0A0A]">You're All Caught Up</h3>
              <p className="text-xs text-[#6B7280] font-semibold">No new notifications at the moment. Check back later.</p>
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
                className={`group bg-white border rounded-[16px] p-4 cursor-pointer transition-all cc-shadow-sm hover:shadow-md ${
                  isSelected ? 'border-primary/45 ring-1 ring-primary/10' : 'border-[#E5E7EB]'
                } ${isUnread ? 'bg-[#EFF4FF]/20' : ''}`}
              >
                <div className="flex items-start space-x-3.5">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5 border ${
                    notif.priority === 'Critical' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]' :
                    notif.priority === 'High' ? 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]' :
                    'bg-[#EFF4FF] text-primary border-[#DBE6FF]'
                  }`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h4 className={`text-[12px] leading-tight ${isUnread ? 'font-black text-[#0A0A0A]' : 'font-bold text-[#4B5563]'}`}>
                          {notif.title}
                        </h4>
                        {getPriorityBadge(notif.priority)}
                        {isUnread && <span className="w-2 h-2 bg-primary rounded-full shrink-0 animate-pulse" />}
                      </div>
                      <span className="text-[9.5px] font-bold text-[#9CA3AF] shrink-0 whitespace-nowrap">{notif.timestamp}</span>
                    </div>

                    <p className="text-[10.5px] text-[#6B7280] font-medium mt-1 leading-relaxed line-clamp-2">
                      {notif.description}
                    </p>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center space-x-3 text-[9.5px] font-semibold text-[#9CA3AF]">
                        {notif.relatedVehicle && (
                          <span className="flex items-center space-x-1">
                            <Truck className="w-3 h-3" />
                            <span>{notif.relatedVehicle}</span>
                          </span>
                        )}
                        {notif.relatedDriver && (
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{notif.relatedDriver}</span>
                          </span>
                        )}
                        {notif.relatedTrip && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{notif.relatedTrip}</span>
                          </span>
                        )}
                      </div>

                      {/* Row action buttons */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUnread && (
                          <button
                            onClick={e => { e.stopPropagation(); void markRead(notif.id); onShowToast('Marked as read.'); }}
                            className="p-1.5 rounded-[8px] hover:bg-[#F9FAFB] text-[#9CA3AF] hover:text-primary cursor-pointer transition-colors"
                            title="Mark read"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); void archiveNotif(notif.id); }}
                          className="p-1.5 rounded-[8px] hover:bg-[#F9FAFB] text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); void deleteNotif(notif.id); }}
                          className="p-1.5 rounded-[8px] hover:bg-[#FEF2F2] text-[#9CA3AF] hover:text-[#DC2626] cursor-pointer transition-colors"
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
              className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden flex flex-col text-left lg:col-span-1"
            >
              {/* Detail header */}
              <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <span className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider">Notification Detail</span>
                <button 
                  onClick={() => setSelectedNotif(null)} 
                  className="p-1 hover:bg-[#F9FAFB] rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4 text-[#9CA3AF]" />
                </button>
              </div>

              <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                {/* Priority & category */}
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(selectedNotif.priority)}
                  <span className="text-[10px] font-bold text-[#9CA3AF] capitalize">{selectedNotif.category}</span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-black text-[#0A0A0A] leading-snug">{selectedNotif.title}</h3>
                  <span className="text-[10px] font-bold text-[#9CA3AF] mt-1 block">{selectedNotif.timestamp}</span>
                </div>

                {/* Description */}
                <p className="text-[11.5px] text-[#4B5563] font-medium leading-relaxed border-l-2 border-primary/30 pl-3 py-1 bg-[#EFF4FF]/20 rounded-r-lg">
                  {selectedNotif.description}
                </p>

                {/* Related records */}
                {(selectedNotif.relatedVehicle || selectedNotif.relatedDriver || selectedNotif.relatedTrip) && (
                  <div className="border border-[#E5E7EB] rounded-[12px] p-4 space-y-2.5 cc-shadow-sm">
                    <h4 className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider">Related Records</h4>
                    {selectedNotif.relatedVehicle && (
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center space-x-2 text-[#6B7280]">
                          <Truck className="w-3.5 h-3.5 text-[#9CA3AF]" />
                          <span>Vehicle</span>
                        </div>
                        <span className="font-bold text-primary font-mono">{selectedNotif.relatedVehicle}</span>
                      </div>
                    )}
                    {selectedNotif.relatedDriver && (
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center space-x-2 text-[#6B7280]">
                          <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
                          <span>Driver</span>
                        </div>
                        <span className="font-bold text-[#4B5563]">{selectedNotif.relatedDriver}</span>
                      </div>
                    )}
                    {selectedNotif.relatedTrip && (
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center space-x-2 text-[#6B7280]">
                          <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                          <span>Trip</span>
                        </div>
                        <span className="font-bold text-[#4B5563] font-mono">{selectedNotif.relatedTrip}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Timeline */}
                <div>
                  <h4 className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider mb-3">Notification History</h4>
                  <div className="relative pl-4 space-y-3 border-l-2 border-primary/10">
                    {[
                      { time: selectedNotif.timestamp, event: 'Alert generated by system' },
                      { time: 'Now', event: 'Viewed by Fleet Manager' }
                    ].map((ev, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full shadow-sm" />
                        <span className="text-[10.5px] font-bold text-[#4B5563] block">{ev.event}</span>
                        <span className="text-[9px] font-bold text-[#9CA3AF] font-mono">{ev.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="p-4 border-t border-[#E5E7EB] space-y-2">
                {selectedNotif.actionLabel && (
                  <button
                    onClick={() => onShowToast(`Opening: ${selectedNotif.actionLabel}...`)}
                    className="w-full py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cursor-pointer shadow-sm transition-all"
                  >
                    {selectedNotif.actionLabel}
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                   <button
                    onClick={() => { void archiveNotif(selectedNotif.id); }}
                    className="py-1.5 border border-[#E5E7EB] bg-white text-[#4B5563] text-xs font-bold rounded-[12px] cursor-pointer hover:bg-[#F9FAFB] flex items-center justify-center space-x-1"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                  <button
                    onClick={() => { void deleteNotif(selectedNotif.id); }}
                    className="py-1.5 border border-[#FEE2E2] bg-[#FEF2F2] text-[#DC2626] text-xs font-bold rounded-[12px] cursor-pointer hover:bg-[#FEE2E2]/60 flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Smart Alert Center ── */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden text-left">
        <div className="p-4 border-b border-[#E5E7EB]">
          <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Smart Alert Center</h3>
          <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Actionable operational alerts requiring immediate attention.</p>
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
            <div key={i} className={`p-4 border rounded-[12px] space-y-2.5 cc-shadow-sm ${
              alert.color === 'rose' ? 'bg-[#FEF2F2]/40 border-[#FEE2E2]' :
              alert.color === 'amber' ? 'bg-[#FFFBEB]/40 border-[#FEF3C7]' :
              'bg-[#EFF4FF]/20 border-[#DBE6FF]'
            }`}>
              <div className="flex items-start justify-between">
                <h4 className="text-[11px] font-black text-[#0A0A0A] leading-snug">{alert.title}</h4>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  alert.color === 'rose' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]' :
                  alert.color === 'amber' ? 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]' :
                  'bg-[#EFF4FF] text-primary border-[#DBE6FF]'
                }`}>{alert.severity}</span>
              </div>
              <p className="text-[10.5px] text-[#6B7280] font-medium leading-relaxed">{alert.desc}</p>
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
      <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4 text-left">
        <h3 className="text-xs font-black text-[#0A0A0A] uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
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
            <div key={i} className={`p-3 border rounded-[12px] flex items-start space-x-2 text-[10.5px] font-semibold leading-relaxed ${
              ins.type === 'warn' ? 'bg-[#FFFBEB] border-[#FDE8B0] text-[#D97706]' :
              ins.type === 'positive' ? 'bg-[#ECFDF5]/60 border-[#D1FAE5] text-[#059669]' :
              'bg-[#EFF4FF] border-[#DBE6FF] text-[#4B5563]'
            }`}>
              {ins.type === 'warn'
                ? <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                : ins.type === 'positive'
                ? <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                : <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              }
              <span>{ins.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity Timeline ── */}
      <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4 text-left">
        <h3 className="text-xs font-black text-[#0A0A0A] uppercase border-b border-[#F3F4F6] pb-2">Fleet Activity Timeline</h3>
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
            const dotColor = ev.type === 'maintenance' ? 'bg-[#D97706]' : ev.type === 'safety' ? 'bg-[#DC2626]' : ev.type === 'trip' ? 'bg-[#059669]' : 'bg-primary';
            return (
              <div key={i} className="relative">
                <div className={`absolute -left-[26px] top-1 w-3 h-3 ${dotColor} border-2 border-white rounded-full shadow-sm`} />
                <span className="text-[11.5px] font-bold text-[#0A0A0A] block leading-snug">{ev.event}</span>
                <div className="flex items-center space-x-2 text-[9.5px] font-semibold text-[#9CA3AF] mt-0.5">
                  <span className="font-mono">{ev.time}</span>
                  <span>·</span>
                  <span>{ev.user}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </Reveal>
  );
};
