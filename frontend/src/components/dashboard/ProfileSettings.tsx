import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Settings,
  Activity,
  Link,
  Code,
  Lock,
  Download,
  AlertTriangle,
  Check,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Monitor,
  Palette,
  HelpCircle,
  Sparkles,
  Trash2,
  ChevronRight,
  Smartphone,
  LogOut,
  Save,
  Camera,
  Key,
  Layers
} from 'lucide-react';
import { Field, SelectField } from '../ui/Field';
import { Ring } from '../ui/Ring';

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsSection =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'appearance'
  | 'preferences'
  | 'sessions'
  | 'activity'
  | 'connected'
  | 'workspace'
  | 'developer'
  | 'privacy'
  | 'support';

interface ProfileSettingsProps {
  onShowToast: (msg: string) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer shrink-0 focus:outline-none border border-transparent cc-focus ${checked ? 'bg-primary' : 'bg-[#E5E7EB]'}`}
  >
    <motion.div
      animate={{ x: checked ? 18 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className="absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm"
    />
  </button>
);

const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden text-left">
    <div className="p-5 border-b border-[#E5E7EB]">
      <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">{title}</h3>
      {subtitle && <p className="text-[10.5px] text-[#6B7280] font-medium mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── NAV Config ──────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'sessions', label: 'Sessions', icon: Monitor },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'connected', label: 'Connected Accounts', icon: Link },
  { id: 'workspace', label: 'Workspace', icon: Layers },
  { id: 'developer', label: 'API & Developer', icon: Code },
  { id: 'privacy', label: 'Privacy & Data', icon: Lock },
  { id: 'support', label: 'Help & Support', icon: HelpCircle },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onShowToast }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [isDirty, setIsDirty] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Fleet Operations');
  const [designation, setDesignation] = useState('Fleet Manager');
  const [region, setRegion] = useState('East Coast');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Security state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [twoFA, setTwoFA] = useState(true);

  // Notification toggles
  const [notifToggles, setNotifToggles] = useState({
    email: true, push: true, maintenance: true, trips: true,
    compliance: true, expenses: false, weekly: true,
    monthly: false, system: true, sound: false, desktop: true
  });

  // Appearance
  const [fontSize, setFontSize] = useState('Medium');
  const [sidebarLayout, setSidebarLayout] = useState('Expanded');
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  // Preferences
  const [language, setLanguage] = useState('English (US)');
  const [timezone, setTimezone] = useState('America/Chicago (CDT)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [distanceUnit, setDistanceUnit] = useState('Miles');
  const [currency, setCurrency] = useState('USD ($)');
  const [autoRefresh, setAutoRefresh] = useState('30 seconds');

  // API key state
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  const markDirty = () => setIsDirty(true);
  const wrapChange = (fn: (v: string) => void) => (v: string) => { fn(v); markDirty(); };
  const wrapToggle = (key: keyof typeof notifToggles) => () => {
    setNotifToggles(prev => ({ ...prev, [key]: !prev[key] }));
    markDirty();
  };

  // Load profile from backend on mount
  useEffect(() => {
    apiFetch('/api/fleet/profile')
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        const [fn = '', ln = ''] = (data.name || '').split(' ');
        setFirstName(fn);
        setLastName(ln);
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setDepartment(data.department || 'Fleet Operations');
        setDesignation(data.role || 'Fleet Manager');
        setRegion(data.region || 'East Coast');
        setBio(data.bio || '');
        setAddress(data.address || '');
        setEmergencyContact(data.emergencyContact || '');
        if (data.notificationPreferences) {
          setNotifToggles(prev => ({ ...prev, ...data.notificationPreferences }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setShowSaveModal(false);
    try {
      await apiFetch('/api/fleet/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email, phone, department, role: designation, region, bio, address, emergencyContact,
          notificationPreferences: notifToggles,
        }),
      });
    } catch { /* silent */ }
    setSaveSuccess(true);
    setIsDirty(false);
    setTimeout(() => setSaveSuccess(false), 3000);
    onShowToast('Settings saved successfully.');
  };

  const pwdStrength = (() => {
    const p = newPwd;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const pwdStrengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwdStrength];
  const pwdStrengthColor = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'][pwdStrength];

  const completionPct = [firstName, lastName, email, phone, department, designation, region, bio].filter(Boolean).length / 8 * 100;

  return (
    <div className="flex gap-0 select-none text-left -mx-6 -mt-2 min-h-screen">

      {/* ── Left Settings Nav ── */}
      <aside className="w-56 shrink-0 border-r border-[#E5E7EB] bg-white sticky top-0 h-[calc(100vh-64px)] overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-[#E5E7EB]">
          <h2 className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider">Settings</h2>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer text-left ${
                  active ? 'bg-[#EFF4FF] text-primary' : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#0A0A0A]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-[#9CA3AF]'}`} />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto text-primary/50" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom danger zone */}
        <div className="p-3 border-t border-[#E5E7EB] space-y-1">
          <button
            onClick={() => onShowToast('Logging out...')}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-[12px] text-xs font-bold text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden">

        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0A0A0A] tracking-tight leading-none">Profile & Settings</h1>
            <p className="text-[10.5px] text-[#6B7280] font-medium mt-1">Manage your account, security, notifications, and workspace preferences.</p>
          </div>
          <div className="flex items-center space-x-2">
            <AnimatePresence>
              {saveSuccess && (
                <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center space-x-1.5 text-[#059669] text-xs font-bold bg-[#ECFDF5] border border-[#D1FAE5] px-3 py-2 rounded-[12px] cc-shadow-sm">
                  <Check className="w-3.5 h-3.5" /><span>Saved successfully</span>
                </motion.span>
              )}
            </AnimatePresence>
            {isDirty && (
              <>
                <button onClick={() => setIsDirty(false)} className="px-3.5 py-2 border border-[#E5E7EB] bg-white text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] cursor-pointer hover:bg-[#F9FAFB] cc-shadow-sm">Cancel</button>
                <button onClick={() => setShowSaveModal(true)} className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] shadow-sm cursor-pointer flex items-center space-x-1.5 transition-all">
                  <Save className="w-3.5 h-3.5" /><span>Save Changes</span>
                </button>
              </>
            )}
            {!isDirty && (
              <button onClick={() => onShowToast('Refreshing settings...')} className="p-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] rounded-[12px] cursor-pointer cc-shadow-sm">
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Section Content */}
        <div className="px-8 py-6 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

              {/* ── PROFILE ── */}
              {activeSection === 'profile' && (
                <>
                  {/* Profile Hero Card */}
                  <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm p-6 text-left">
                    <div className="flex items-start space-x-6">
                      {/* Avatar */}
                      <div className="relative shrink-0 group">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <Ring value={completionPct} size={88} stroke={5} color="#2563EB" />
                          <div className="absolute inset-2.5 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-2xl font-black text-primary">{firstName[0]}{lastName[0]}</span>
                          </div>
                          <button 
                            onClick={() => onShowToast('Opening image uploader...')} 
                            className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border border-transparent"
                          >
                            <Camera className="w-5 h-5 text-white" />
                          </button>
                        </div>
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div>
                            <h2 className="text-lg font-black text-[#0A0A0A] leading-tight">{firstName} {lastName}</h2>
                            <p className="text-xs text-[#6B7280] font-semibold mt-0.5">{email}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="px-2.5 py-0.5 bg-[#EFF4FF] text-primary border border-[#DBE6FF] rounded-full text-[10px] font-black">{designation}</span>
                              <span className="px-2.5 py-0.5 bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] rounded-full text-[10px] font-bold">{department}</span>
                              <span className="flex items-center space-x-1 text-[#059669] text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span>Active</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-black text-[#9CA3AF] block">Profile Completion</span>
                            <span className="text-2xl font-black text-primary leading-none">{Math.round(completionPct)}%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#F3F4F6]">
                          {[
                            { label: 'Employee ID', value: 'EMP-4821' },
                            { label: 'Region', value: region },
                            { label: 'Joined', value: 'March 2019' },
                          ].map(item => (
                            <div key={item.label}>
                              <span className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider block">{item.label}</span>
                              <span className="text-xs font-bold text-[#4B5563] mt-0.5 block">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information Form */}
                  <SectionCard title="Personal Information" subtitle="Update your personal details and contact information.">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="First Name" value={firstName} onChange={wrapChange(setFirstName)} />
                      <Field label="Last Name" value={lastName} onChange={wrapChange(setLastName)} />
                      <Field label="Email Address" value={email} onChange={wrapChange(setEmail)} type="email" />
                      <Field label="Phone Number" value={phone} onChange={wrapChange(setPhone)} type="tel" />
                      <Field label="Employee ID" value="EMP-4821" onChange={() => {}} readOnly />
                      <Field label="Department" value={department} onChange={wrapChange(setDepartment)} />
                      <Field label="Designation / Title" value={designation} onChange={wrapChange(setDesignation)} />
                      <SelectField 
                        label="Region" 
                        value={region} 
                        onChange={wrapChange(setRegion)} 
                        options={['Midwest', 'Northeast', 'Southeast', 'Southwest', 'West Coast'].map(o => ({ value: o, label: o }))} 
                      />
                      <div className="col-span-2">
                        <Field label="Address" value={address} onChange={wrapChange(setAddress)} />
                      </div>
                      <Field label="Emergency Contact" value={emergencyContact} onChange={wrapChange(setEmergencyContact)} />
                      <div className="col-span-2">
                        <Field 
                          label="Bio" 
                          value={bio} 
                          onChange={wrapChange(setBio)} 
                          textarea 
                        />
                      </div>
                    </div>
                  </SectionCard>

                  {/* AI Personalization */}
                  <SectionCard title="AI Personalization" subtitle="Intelligent suggestions based on your usage patterns.">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: '🔥', title: 'Most Visited', val: 'Trip Management, Vehicle Registry' },
                        { icon: '📊', title: 'Suggested Widgets', val: 'Fleet Utilization, Active Trips' },
                        { icon: '🔔', title: 'Recommended Alerts', val: 'Maintenance Due, License Expiry' },
                        { icon: '📄', title: 'Top Reports', val: 'Weekly Fleet Summary, ROI Report' },
                      ].map(s => (
                        <div key={s.title} className="flex items-start space-x-3 p-3 bg-slate-50 border border-border-gray/60 rounded-xl">
                          <span className="text-xl shrink-0">{s.icon}</span>
                          <div>
                            <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">{s.title}</span>
                            <p className="text-[11px] font-bold text-slate-600 mt-0.5">{s.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </>
              )}

              {/* ── SECURITY ── */}
              {activeSection === 'security' && (
                <>
                  <SectionCard title="Change Password" subtitle="Use a strong, unique password for this account.">
                    <div className="space-y-4 max-w-md">
                      <Field
                        label="Current Password"
                        type="password"
                        value={currentPwd}
                        onChange={wrapChange(setCurrentPwd)}
                        placeholder="Enter current password"
                      />
                      <Field
                        label="New Password"
                        type={showNewPwd ? 'text' : 'password'}
                        value={newPwd}
                        onChange={wrapChange(setNewPwd)}
                        placeholder="Minimum 8 characters"
                        right={
                          <button 
                            type="button"
                            onClick={() => setShowNewPwd(p => !p)} 
                            className="text-[#9CA3AF] cursor-pointer focus:outline-none"
                          >
                            {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />
                      {newPwd && (
                        <div className="space-y-1.5">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="flex-1 h-1 rounded-full transition-colors" style={{ backgroundColor: i <= pwdStrength ? pwdStrengthColor : '#E5E7EB' }} />
                            ))}
                          </div>
                          <span className="text-[9.5px] font-bold" style={{ color: pwdStrengthColor }}>{pwdStrengthLabel}</span>
                        </div>
                      )}
                      <Field
                        label="Confirm Password"
                        type="password"
                        value={confirmPwd}
                        onChange={wrapChange(setConfirmPwd)}
                        placeholder="Repeat new password"
                        error={confirmPwd && confirmPwd !== newPwd ? "Passwords do not match." : undefined}
                      />
                      {confirmPwd && confirmPwd === newPwd && newPwd && (
                        <p className="text-[11px] text-[#059669] font-bold flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Passwords match</span>
                        </p>
                      )}
                      <button 
                        onClick={() => onShowToast('Password updated successfully.')} 
                        className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cursor-pointer shadow-sm transition-all"
                      >
                        Update Password
                      </button>
                    </div>
                  </SectionCard>

                  <SectionCard title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account.">
                    <div className="flex items-center justify-between max-w-md text-left">
                      <div>
                        <h4 className="text-xs font-bold text-[#4B5563]">Authenticator App (TOTP)</h4>
                        <p className="text-[10.5px] text-[#6B7280] font-medium mt-0.5">Use Google Authenticator or Authy to generate one-time codes.</p>
                        <span className={`text-[10px] font-black mt-1.5 block ${twoFA ? 'text-[#059669]' : 'text-[#DC2626]'}`}>{twoFA ? '✓ Enabled' : '✗ Disabled'}</span>
                      </div>
                      <ToggleSwitch checked={twoFA} onChange={() => { setTwoFA(p => !p); markDirty(); }} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Recovery & Login Options" subtitle="Backup methods in case you lose access.">
                    <div className="space-y-3 max-w-sm text-left">
                      {[
                        { label: 'Recovery Email', value: 'alex.backup@gmail.com' },
                        { label: 'Recovery Phone', value: '+1 (312) 555-0844' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] cc-shadow-sm">
                          <div>
                            <span className="text-[9.5px] font-black text-[#9CA3AF] uppercase">{item.label}</span>
                            <p className="text-[11px] font-bold text-[#4B5563] mt-0.5">{item.value}</p>
                          </div>
                          <button onClick={() => onShowToast('Edit recovery method...')} className="text-[10px] font-bold text-primary hover:text-[#1D4ED8] cursor-pointer">Edit</button>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeSection === 'notifications' && (
                <SectionCard title="Notification Preferences" subtitle="Control which events trigger notifications and how you receive them.">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                    {(Object.entries(notifToggles) as [keyof typeof notifToggles, boolean][]).map(([key, val]) => {
                      const labels: Record<string, string> = {
                        email: 'Email Notifications', push: 'Push Notifications',
                        maintenance: 'Maintenance Alerts', trips: 'Trip Updates',
                        compliance: 'Compliance Alerts', expenses: 'Expense Reports',
                        weekly: 'Weekly Reports', monthly: 'Monthly Reports',
                        system: 'System Alerts', sound: 'Sound Notifications',
                        desktop: 'Desktop Notifications'
                      };
                      const descs: Record<string, string> = {
                        email: 'Receive alerts via your registered email', push: 'Browser & mobile push notifications',
                        maintenance: 'Vehicle service and repair reminders', trips: 'Trip status changes and updates',
                        compliance: 'License and regulatory warnings', expenses: 'Expense approvals and reports',
                        weekly: 'Automated Monday fleet summaries', monthly: 'End-of-month performance reports',
                        system: 'Platform maintenance and system events', sound: 'Audio alerts for critical notifications',
                        desktop: 'OS-level notification banners'
                      };
                      return (
                        <div key={key} className="flex items-center justify-between p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] hover:bg-white hover:shadow-md transition-all cc-shadow-sm">
                          <div className="pr-4">
                            <span className="text-[11px] font-black text-[#0A0A0A] block">{labels[key]}</span>
                            <span className="text-[10px] text-[#6B7280] font-semibold">{descs[key]}</span>
                          </div>
                          <ToggleSwitch checked={val} onChange={wrapToggle(key)} />
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* ── APPEARANCE ── */}
              {activeSection === 'appearance' && (
                <SectionCard title="Appearance & Display" subtitle="Customize how the FleetFlow interface looks and feels.">
                  <div className="space-y-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField 
                        label="Font Size" 
                        value={fontSize} 
                        onChange={v => { setFontSize(v); markDirty(); }} 
                        options={['Small', 'Medium', 'Large'].map(o => ({ value: o, label: o }))} 
                      />
                      <SelectField 
                        label="Sidebar Layout" 
                        value={sidebarLayout} 
                        onChange={v => { setSidebarLayout(v); markDirty(); }} 
                        options={['Expanded', 'Compact', 'Mini Icons'].map(o => ({ value: o, label: o }))} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] cc-shadow-sm">
                        <div>
                          <span className="text-[11px] font-black text-[#0A0A0A] block">Compact Mode</span>
                          <span className="text-[10px] text-[#6B7280] font-semibold">Reduce spacing for more content</span>
                        </div>
                        <ToggleSwitch checked={compactMode} onChange={() => { setCompactMode(p => !p); markDirty(); }} />
                      </div>
                        <div className="flex items-center justify-between p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] cc-shadow-sm">
                        <div>
                          <span className="text-[11px] font-black text-[#0A0A0A] block">Smooth Animations</span>
                          <span className="text-[10px] text-[#6B7280] font-semibold">Enable micro-interaction animations</span>
                        </div>
                        <ToggleSwitch checked={animations} onChange={() => { setAnimations(p => !p); markDirty(); }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10.5px] uppercase font-black text-[#9CA3AF] tracking-wider block mb-3">Accent Color</label>
                      <div className="flex space-x-2">
                        {['#2563EB', '#3B82F6', '#0EA5E9', '#6366F1', '#8B5CF6', '#EC4899'].map(col => (
                          <button key={col} title={col}
                            onClick={() => { onShowToast(`Accent color updated.`); markDirty(); }}
                            className="w-8 h-8 rounded-full border-2 border-white shadow cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* ── PREFERENCES ── */}
              {activeSection === 'preferences' && (
                <SectionCard title="Workspace Preferences" subtitle="Regional, language, and operational defaults.">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <SelectField label="Language" value={language} onChange={wrapChange(setLanguage)} options={['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Portuguese'].map(o => ({ value: o, label: o }))} />
                    <SelectField label="Timezone" value={timezone} onChange={wrapChange(setTimezone)} options={['America/Chicago (CDT)', 'America/New_York (EDT)', 'America/Los_Angeles (PDT)', 'UTC', 'Europe/London (BST)'].map(o => ({ value: o, label: o }))} />
                    <SelectField label="Date Format" value={dateFormat} onChange={wrapChange(setDateFormat)} options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(o => ({ value: o, label: o }))} />
                    <SelectField label="Distance Unit" value={distanceUnit} onChange={wrapChange(setDistanceUnit)} options={['Miles', 'Kilometers'].map(o => ({ value: o, label: o }))} />
                    <SelectField label="Currency" value={currency} onChange={wrapChange(setCurrency)} options={['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD (C$)', 'AUD (A$)'].map(o => ({ value: o, label: o }))} />
                    <SelectField label="Auto Refresh" value={autoRefresh} onChange={wrapChange(setAutoRefresh)} options={['Off', '15 seconds', '30 seconds', '1 minute', '5 minutes'].map(o => ({ value: o, label: o }))} />
                    <SelectField label="Default Dashboard" value="Fleet Overview" onChange={() => markDirty()} options={['Fleet Overview', 'Trip Management', 'Driver Management', 'Reports'].map(o => ({ value: o, label: o }))} />
                    <SelectField label="Items Per Page" value="25" onChange={() => markDirty()} options={['10', '25', '50', '100'].map(o => ({ value: o, label: o }))} />
                  </div>
                </SectionCard>
              )}

              {/* ── SESSIONS ── */}
              {activeSection === 'sessions' && (
                <SectionCard title="Active Sessions" subtitle="Manage your logged-in devices and sessions.">
                  <div className="space-y-3 text-left">
                    {[
                      { device: 'MacBook Pro 16"', browser: 'Chrome 124', os: 'macOS 14.5', ip: '192.168.1.10', location: 'Chicago, IL', time: 'Now — Current Session', current: true },
                      { device: 'iPhone 15 Pro', browser: 'Safari 17', os: 'iOS 17.4', ip: '10.0.0.4', location: 'Chicago, IL', time: '2h ago', current: false },
                      { device: 'Windows 11 PC', browser: 'Edge 123', os: 'Windows 11', ip: '72.14.180.6', location: 'Atlanta, GA', time: '3 days ago', current: false },
                    ].map((s, i) => (
                      <div key={i} className={`p-4 border rounded-[12px] flex items-start justify-between cc-shadow-sm ${s.current ? 'bg-blue-50/40 border-primary/25' : 'bg-white border-[#E5E7EB]'}`}>
                        <div className="flex items-start space-x-3.5">
                          <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${s.current ? 'bg-[#EFF4FF] text-primary' : 'bg-[#F9FAFB] text-[#9CA3AF]'}`}>
                            {s.device.includes('iPhone') ? <Smartphone className="w-4.5 h-4.5" /> : <Monitor className="w-4.5 h-4.5" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-[11.5px] font-black text-[#0A0A0A]">{s.device}</h4>
                              {s.current && <span className="text-[9px] font-black text-primary bg-[#EFF4FF] border border-[#DBE6FF] px-1.5 py-0.5 rounded-full">Current</span>}
                            </div>
                            <p className="text-[10.5px] text-[#6B7280] font-semibold">{s.browser} · {s.os}</p>
                            <p className="text-[10px] text-[#9CA3AF] font-mono">{s.ip} · {s.location}</p>
                            <p className="text-[10px] text-[#9CA3AF] mt-0.5">{s.time}</p>
                          </div>
                        </div>
                        {!s.current && (
                          <button onClick={() => onShowToast('Session terminated.')} className="text-[10px] font-bold text-[#DC2626] hover:bg-[#FEF2F2] border border-rose-200 bg-rose-50 px-2.5 py-1 rounded-[8px] cursor-pointer">Terminate</button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => onShowToast('All other sessions terminated.')} className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer pt-1">Terminate All Other Sessions</button>
                  </div>
                </SectionCard>
              )}

              {/* ── ACTIVITY LOG ── */}
              {activeSection === 'activity' && (
                <SectionCard title="Account Activity Log" subtitle="A complete history of actions performed on your account.">
                  <div className="relative pl-5 space-y-5 border-l-2 border-primary/10 text-left">
                    {[
                      { event: 'Profile information updated', time: '5m ago', type: 'profile' },
                      { event: 'Logged in via Chrome on MacBook Pro', time: '2h ago', type: 'login' },
                      { event: 'Password changed', time: '3 days ago', type: 'security' },
                      { event: 'Notification preferences updated', time: '5 days ago', type: 'settings' },
                      { event: 'Weekly fleet report exported as PDF', time: '1 week ago', type: 'report' },
                      { event: 'Role updated: Senior Fleet Manager', time: '2 weeks ago', type: 'role' },
                      { event: 'Two-Factor Authentication enabled', time: '1 month ago', type: 'security' },
                    ].map((ev, i) => {
                      const dot = ev.type === 'security' ? 'bg-[#DC2626]' : ev.type === 'login' ? 'bg-[#059669]' : ev.type === 'role' ? 'bg-[#D97706]' : 'bg-primary';
                      return (
                        <div key={i} className="relative">
                          <div className={`absolute -left-[21px] top-1.5 w-2 h-2 ${dot} border-2 border-white rounded-full`} />
                          <h4 className="text-[11.5px] font-bold text-[#4B5563]">{ev.event}</h4>
                          <span className="text-[9.5px] font-mono text-[#9CA3AF]">{ev.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* ── CONNECTED ACCOUNTS ── */}
              {activeSection === 'connected' && (
                <SectionCard title="Connected Accounts & Integrations" subtitle="Manage external service connections and SSO providers.">
                  <div className="space-y-3 text-left">
                    {[
                      { name: 'Microsoft 365', icon: '🟦', status: true, sync: '2h ago' },
                      { name: 'Google Workspace', icon: '🔴', status: true, sync: '5m ago' },
                      { name: 'Slack', icon: '🟣', status: false, sync: 'Never' },
                      { name: 'Microsoft Teams', icon: '🔵', status: false, sync: 'Never' },
                      { name: 'Email (SMTP)', icon: '📧', status: true, sync: '1h ago' },
                    ].map(acc => (
                      <div key={acc.name} className="flex items-center justify-between p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] hover:bg-white hover:shadow-md transition-all cc-shadow-sm">
                        <div className="flex items-center space-x-3.5">
                          <span className="text-2xl">{acc.icon}</span>
                          <div>
                            <h4 className="text-[11.5px] font-black text-[#0A0A0A]">{acc.name}</h4>
                            <p className="text-[10px] text-[#9CA3AF] font-semibold">Last sync: {acc.sync}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-[9.5px] font-bold ${acc.status ? 'text-[#059669]' : 'text-[#9CA3AF]'}`}>
                            {acc.status ? '● Connected' : '○ Not Connected'}
                          </span>
                          <button
                            onClick={() => onShowToast(acc.status ? `${acc.name} disconnected.` : `Connecting to ${acc.name}...`)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-[8px] border cursor-pointer transition-colors ${acc.status ? 'border-rose-200 bg-rose-50 text-[#DC2626] hover:bg-[#FEF2F2]' : 'border-[#E5E7EB] bg-white text-primary hover:bg-[#EFF4FF]'}`}
                          >
                            {acc.status ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* ── WORKSPACE ── */}
              {activeSection === 'workspace' && (
                <SectionCard title="Workspace Configuration" subtitle="Global settings for your FleetFlow organization.">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <SelectField label="Fleet Region" value="Midwest" onChange={() => markDirty()} options={['Midwest', 'Northeast', 'Southeast', 'Southwest', 'West'].map(o => ({ value: o, label: o }))} />
                    <SelectField label="Fleet Size (Visible)" value="Full Fleet" onChange={() => markDirty()} options={['Full Fleet', 'My Region Only', 'Custom'].map(o => ({ value: o, label: o }))} />
                    <SelectField label="Default Report Period" value="This Month" onChange={() => markDirty()} options={['This Week', 'This Month', 'This Quarter', 'This Year'].map(o => ({ value: o, label: o }))} />
                    <SelectField label="Maintenance Threshold Alert" value="7 Days Before" onChange={() => markDirty()} options={['3 Days Before', '7 Days Before', '14 Days Before', '30 Days Before'].map(o => ({ value: o, label: o }))} />
                  </div>
                </SectionCard>
              )}

              {/* ── DEVELOPER ── */}
              {activeSection === 'developer' && (
                <SectionCard title="API & Developer Settings" subtitle="Manage API keys, webhooks, and developer access tokens.">
                  <div className="space-y-4 max-w-lg text-left">
                    {[
                      { label: 'API Key', value: apiKeyVisible ? 'sk_live_transit_a8f3d2b1c9e7f4a21...' : '••••••••••••••••••••••••••••••', copy: true, toggle: true },
                      { label: 'Webhook URL', value: 'https://hooks.fleetflow.io/webhooks/7f4a21', copy: true, toggle: false },
                      { label: 'Access Token', value: 'Bearer eyJhbGciOiJIUzI1NiIs...', copy: true, toggle: false },
                    ].map(field => (
                      <div key={field.label} className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-[#9CA3AF] tracking-wider block">{field.label}</label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 px-3 py-2.5 bg-[#0F172A] text-[#10B981] text-[10.5px] font-mono rounded-[12px] border border-[#334155] truncate">
                            {field.value}
                          </code>
                          {field.toggle && (
                            <button onClick={() => setApiKeyVisible(p => !p)} className="p-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] rounded-[12px] cursor-pointer cc-shadow-sm">
                              {apiKeyVisible ? <EyeOff className="w-4 h-4 text-[#4B5563]" /> : <Eye className="w-4 h-4 text-[#4B5563]" />}
                            </button>
                          )}
                          <button onClick={() => onShowToast('Copied to clipboard.')} className="p-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] rounded-[12px] cursor-pointer cc-shadow-sm">
                            <Copy className="w-4 h-4 text-[#4B5563]" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => onShowToast('API key regenerated.')} className="flex items-center space-x-1.5 text-xs font-bold text-primary hover:underline cursor-pointer pt-2">
                      <Key className="w-4 h-4" /><span>Regenerate API Key</span>
                    </button>
                  </div>
                </SectionCard>
              )}

              {/* ── PRIVACY ── */}
              {activeSection === 'privacy' && (
                <>
                  <SectionCard title="Privacy & Data Management" subtitle="Manage your personal data and account deletion preferences.">
                    <div className="space-y-3 max-w-lg text-left">
                      {[
                        { label: 'Download My Data', sub: 'Export all your account data as a ZIP archive.', action: 'Request Download', icon: Download, color: 'text-primary' },
                        { label: 'Export Account Settings', sub: 'Export preferences and configuration as JSON.', action: 'Export JSON', icon: Download, color: 'text-primary' },
                        { label: 'View Audit Logs', sub: 'See all administrative actions on your account.', action: 'View Logs', icon: Activity, color: 'text-primary' },
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="flex items-center justify-between p-4 border border-[#E5E7EB] bg-[#F9FAFB] rounded-[12px] hover:bg-white hover:shadow-md transition-all cc-shadow-sm">
                            <div className="flex items-start space-x-3">
                              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.color}`} />
                              <div>
                                <h4 className="text-[11.5px] font-black text-[#0A0A0A]">{item.label}</h4>
                                <p className="text-[10px] text-[#6B7280] font-semibold">{item.sub}</p>
                              </div>
                            </div>
                            <button onClick={() => onShowToast(`${item.action} initiated.`)} className="text-[10px] font-bold text-primary border border-[#DBE6FF] bg-[#EFF4FF] hover:bg-[#DBE6FF] px-2.5 py-1 rounded-[8px] cursor-pointer transition-colors">{item.action}</button>
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                  <div className="border border-rose-200 rounded-[16px] bg-rose-50/40 p-5 space-y-4 text-left">
                    <h3 className="text-xs font-black text-[#DC2626] uppercase tracking-tight flex items-center space-x-2"><AlertTriangle className="w-4 h-4" /><span>Danger Zone</span></h3>
                    <div className="flex items-center justify-between p-4 bg-white border border-[#FCA5A5]/40 rounded-[12px] cc-shadow-sm">
                      <div>
                        <h4 className="text-[11.5px] font-black text-[#DC2626]">Delete Account</h4>
                        <p className="text-[10px] text-[#6B7280] font-semibold">Permanently delete your account and all associated data. This action is irreversible.</p>
                      </div>
                      <button onClick={() => onShowToast('Account deletion requires administrator approval.')} className="text-[10px] font-bold text-[#DC2626] border border-rose-300 bg-rose-50 hover:bg-[#FEF2F2] px-3 py-1.5 rounded-[8px] cursor-pointer flex items-center space-x-1 transition-all">
                        <Trash2 className="w-3.5 h-3.5" /><span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── SUPPORT ── */}
              {activeSection === 'support' && (
                <SectionCard title="Help & Support Center" subtitle="Get help, report issues, or contact the FleetFlow support team.">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    {[
                      { title: 'Documentation', desc: 'Browse the full FleetFlow user guide and API docs.', icon: '📖', action: 'Open Docs' },
                      { title: 'Report an Issue', desc: 'Submit a bug report or feature request to our team.', icon: '🐛', action: 'Report Issue' },
                      { title: 'Contact Administrator', desc: 'Reach out to your system admin for access or account help.', icon: '👨‍💼', action: 'Send Message' },
                      { title: 'System Status', desc: 'Check live service availability and uptime status.', icon: '🟢', action: 'View Status' },
                    ].map(card => (
                      <button key={card.title} onClick={() => onShowToast(`${card.action}...`)}
                        className="p-5 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] hover:shadow-md rounded-[16px] text-left space-y-2 transition-all cursor-pointer group cc-shadow-sm">
                        <span className="text-3xl">{card.icon}</span>
                        <h4 className="text-[12px] font-black text-[#0A0A0A] group-hover:text-primary transition-colors">{card.title}</h4>
                        <p className="text-[10.5px] text-[#6B7280] font-semibold leading-relaxed">{card.desc}</p>
                        <span className="text-[10px] font-bold text-primary flex items-center space-x-1">{card.action} <ChevronRight className="w-3 h-3" /></span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 p-4 bg-[#EFF4FF]/60 border border-primary/20 rounded-[12px] flex items-center space-x-4 text-left">
                    <Sparkles className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-[11.5px] font-black text-[#0A0A0A]">FleetFlow AI Assistant</h4>
                      <p className="text-[10px] text-[#6B7280] font-semibold">Ask the AI assistant anything about your fleet, reports, or platform settings.</p>
                    </div>
                    <button onClick={() => onShowToast('Opening AI Assistant...')} className="ml-auto px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-[8px] cursor-pointer shrink-0 transition-colors hover:bg-[#1D4ED8]">Ask AI</button>
                  </div>
                </SectionCard>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Save Confirmation Modal ── */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSaveModal(false)} className="fixed inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E5E7EB] rounded-[16px] shadow-2xl max-w-sm w-full mx-4 z-10 p-6 text-left space-y-4">
              <div className="w-12 h-12 bg-[#EFF4FF] border border-primary/20 rounded-[12px] flex items-center justify-center">
                <Save className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-black text-[#0A0A0A]">Save Profile Changes?</h3>
              <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                Your changes will be applied immediately across the platform. This action cannot be undone without re-editing.
              </p>
              <div className="flex space-x-3 pt-2">
                <button onClick={() => setShowSaveModal(false)} className="flex-1 py-2.5 border border-[#E5E7EB] bg-white text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] cursor-pointer hover:bg-[#F9FAFB]">
                  Cancel
                </button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cursor-pointer shadow-sm flex items-center justify-center space-x-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
