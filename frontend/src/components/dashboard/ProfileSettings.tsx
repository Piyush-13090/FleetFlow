import React, { useState } from 'react';
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
    className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer shrink-0 focus:outline-none ${checked ? 'bg-primary' : 'bg-slate-300'}`}
    style={{ height: 22, width: 40 }}
  >
    <motion.div
      animate={{ x: checked ? 18 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className="absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm"
    />
  </button>
);

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
}> = ({ label, value, onChange, type = 'text', placeholder, readOnly }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-3 py-2.5 bg-slate-50 border border-border-gray rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}> = ({ label, value, onChange, options }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-slate-50 border border-border-gray rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-primary/40 focus:outline-none transition-all cursor-pointer"
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden">
    <div className="p-5 border-b border-border-gray/50">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">{title}</h3>
      {subtitle && <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
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
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Thompson');
  const [email, setEmail] = useState('alex.thompson@fleetflow.io');
  const [phone, setPhone] = useState('+1 (312) 555-0192');
  const [department, setDepartment] = useState('Fleet Operations');
  const [designation, setDesignation] = useState('Fleet Manager');
  const [region, setRegion] = useState('Midwest');
  const [bio, setBio] = useState('Senior Fleet Manager with 8+ years of logistics experience across Midwest and Southeast regions.');
  const [address, setAddress] = useState('540 W Madison St, Chicago, IL 60661');
  const [emergencyContact, setEmergencyContact] = useState('+1 (312) 555-0844');

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

  const handleSave = () => {
    setShowSaveModal(false);
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
      <aside className="w-56 shrink-0 border-r border-border-gray bg-white sticky top-16 h-[calc(100vh-64px)] overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-border-gray/50">
          <h2 className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Settings</h2>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  active ? 'bg-blue-50 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto text-primary/50" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom danger zone */}
        <div className="p-3 border-t border-border-gray/50 space-y-1">
          <button
            onClick={() => onShowToast('Logging out...')}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden">

        {/* Sticky Header */}
        <div className="sticky top-16 z-20 bg-white/90 backdrop-blur border-b border-border-gray/50 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-text-dark tracking-tight leading-none">Profile & Settings</h1>
            <p className="text-[10.5px] text-slate-400 font-medium mt-1">Manage your account, security, notifications, and workspace preferences.</p>
          </div>
          <div className="flex items-center space-x-2">
            <AnimatePresence>
              {saveSuccess && (
                <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center space-x-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                  <Check className="w-3.5 h-3.5" /><span>Saved successfully</span>
                </motion.span>
              )}
            </AnimatePresence>
            {isDirty && (
              <>
                <button onClick={() => setIsDirty(false)} className="px-3 py-2 border border-border-gray bg-white text-slate-600 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50">Cancel</button>
                <button onClick={() => setShowSaveModal(true)} className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer flex items-center space-x-1.5">
                  <Save className="w-3.5 h-3.5" /><span>Save Changes</span>
                </button>
              </>
            )}
            {!isDirty && (
              <button onClick={() => onShowToast('Refreshing settings...')} className="p-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-500 rounded-xl cursor-pointer">
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
                  <div className="bg-white border border-border-gray rounded-2xl shadow-sm p-6">
                    <div className="flex items-start space-x-6">
                      {/* Avatar */}
                      <div className="relative shrink-0 group">
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 -rotate-90 absolute inset-0">
                            <circle cx="48" cy="48" r="44" className="stroke-slate-100" strokeWidth="4" fill="transparent" />
                            <motion.circle cx="48" cy="48" r="44" className="stroke-primary" strokeWidth="4" fill="transparent"
                              strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 44}
                              initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 44 - (completionPct / 100) * 2 * Math.PI * 44 }}
                              transition={{ duration: 1.0, ease: 'easeOut' }}
                            />
                          </svg>
                          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <span className="text-2xl font-black text-primary">{firstName[0]}{lastName[0]}</span>
                          </div>
                          <button onClick={() => onShowToast('Opening image uploader...')} className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <Camera className="w-5 h-5 text-white" />
                          </button>
                        </div>
                        <div className="absolute bottom-1 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div>
                            <h2 className="text-lg font-black text-text-dark leading-tight">{firstName} {lastName}</h2>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">{email}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="px-2.5 py-0.5 bg-blue-50 text-primary border border-blue-100 rounded-full text-[10px] font-black">{designation}</span>
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[10px] font-bold">{department}</span>
                              <span className="flex items-center space-x-1 text-emerald-600 text-[10px] font-bold"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span>Active</span></span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-black text-slate-400 block">Profile Completion</span>
                            <span className="text-2xl font-black text-primary leading-none">{Math.round(completionPct)}%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border-gray/50">
                          {[
                            { label: 'Employee ID', value: 'EMP-4821' },
                            { label: 'Region', value: region },
                            { label: 'Joined', value: 'March 2019' },
                          ].map(item => (
                            <div key={item.label}>
                              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">{item.label}</span>
                              <span className="text-xs font-bold text-slate-700 mt-0.5 block">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information Form */}
                  <SectionCard title="Personal Information" subtitle="Update your personal details and contact information.">
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="First Name" value={firstName} onChange={wrapChange(setFirstName)} />
                      <InputField label="Last Name" value={lastName} onChange={wrapChange(setLastName)} />
                      <InputField label="Email Address" value={email} onChange={wrapChange(setEmail)} type="email" />
                      <InputField label="Phone Number" value={phone} onChange={wrapChange(setPhone)} type="tel" />
                      <InputField label="Employee ID" value="EMP-4821" onChange={() => {}} readOnly />
                      <InputField label="Department" value={department} onChange={wrapChange(setDepartment)} />
                      <InputField label="Designation / Title" value={designation} onChange={wrapChange(setDesignation)} />
                      <SelectField label="Region" value={region} onChange={wrapChange(setRegion)} options={['Midwest', 'Northeast', 'Southeast', 'Southwest', 'West Coast']} />
                      <div className="col-span-2">
                        <InputField label="Address" value={address} onChange={wrapChange(setAddress)} />
                      </div>
                      <InputField label="Emergency Contact" value={emergencyContact} onChange={wrapChange(setEmergencyContact)} />
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Bio</label>
                        <textarea
                          value={bio} onChange={e => { setBio(e.target.value); markDirty(); }}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-border-gray rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all h-20 resize-none"
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
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Current Password</label>
                        <input type="password" value={currentPwd} onChange={e => { setCurrentPwd(e.target.value); markDirty(); }}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-border-gray rounded-xl text-xs font-semibold focus:bg-white focus:outline-none transition-all"
                          placeholder="Enter current password" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">New Password</label>
                        <div className="relative">
                          <input type={showNewPwd ? 'text' : 'password'} value={newPwd} onChange={e => { setNewPwd(e.target.value); markDirty(); }}
                            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-border-gray rounded-xl text-xs font-semibold focus:bg-white focus:outline-none transition-all"
                            placeholder="Minimum 8 characters" />
                          <button onClick={() => setShowNewPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                            {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {newPwd && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex-1 h-1 rounded-full transition-colors" style={{ backgroundColor: i <= pwdStrength ? pwdStrengthColor : '#E2E8F0' }} />
                              ))}
                            </div>
                            <span className="text-[9.5px] font-bold" style={{ color: pwdStrengthColor }}>{pwdStrengthLabel}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Confirm Password</label>
                        <input type="password" value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); markDirty(); }}
                          className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:bg-white focus:outline-none transition-all ${confirmPwd && confirmPwd !== newPwd ? 'border-rose-300 focus:border-rose-400' : 'border-border-gray'}`}
                          placeholder="Repeat new password" />
                        {confirmPwd && confirmPwd !== newPwd && <p className="text-[10px] text-rose-500 font-bold">Passwords do not match.</p>}
                        {confirmPwd && confirmPwd === newPwd && newPwd && <p className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1"><Check className="w-3 h-3" /><span>Passwords match</span></p>}
                      </div>
                      <button onClick={() => onShowToast('Password updated successfully.')} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm hover:bg-primary/95 transition-all">Update Password</button>
                    </div>
                  </SectionCard>

                  <SectionCard title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account.">
                    <div className="flex items-center justify-between max-w-md">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">Authenticator App (TOTP)</h4>
                        <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">Use Google Authenticator or Authy to generate one-time codes.</p>
                        <span className={`text-[10px] font-black mt-1.5 block ${twoFA ? 'text-emerald-600' : 'text-rose-500'}`}>{twoFA ? '✓ Enabled' : '✗ Disabled'}</span>
                      </div>
                      <ToggleSwitch checked={twoFA} onChange={() => { setTwoFA(p => !p); markDirty(); }} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Recovery & Login Options" subtitle="Backup methods in case you lose access.">
                    <div className="space-y-3 max-w-sm">
                      {[
                        { label: 'Recovery Email', value: 'alex.backup@gmail.com' },
                        { label: 'Recovery Phone', value: '+1 (312) 555-0844' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 border border-border-gray/60 rounded-xl">
                          <div>
                            <span className="text-[9.5px] font-black text-slate-400 uppercase">{item.label}</span>
                            <p className="text-[11px] font-bold text-slate-700 mt-0.5">{item.value}</p>
                          </div>
                          <button onClick={() => onShowToast('Edit recovery method...')} className="text-[10px] font-bold text-primary hover:underline cursor-pointer">Edit</button>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeSection === 'notifications' && (
                <SectionCard title="Notification Preferences" subtitle="Control which events trigger notifications and how you receive them.">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        <div key={key} className="flex items-center justify-between p-4 bg-slate-50 border border-border-gray/60 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                          <div className="pr-4">
                            <span className="text-[11px] font-black text-slate-700 block">{labels[key]}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{descs[key]}</span>
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
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField label="Font Size" value={fontSize} onChange={v => { setFontSize(v); markDirty(); }} options={['Small', 'Medium', 'Large']} />
                      <SelectField label="Sidebar Layout" value={sidebarLayout} onChange={v => { setSidebarLayout(v); markDirty(); }} options={['Expanded', 'Compact', 'Mini Icons']} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-border-gray/60 rounded-xl">
                        <div>
                          <span className="text-[11px] font-black text-slate-700 block">Compact Mode</span>
                          <span className="text-[10px] text-slate-400 font-medium">Reduce spacing for more content</span>
                        </div>
                        <ToggleSwitch checked={compactMode} onChange={() => { setCompactMode(p => !p); markDirty(); }} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-border-gray/60 rounded-xl">
                        <div>
                          <span className="text-[11px] font-black text-slate-700 block">Smooth Animations</span>
                          <span className="text-[10px] text-slate-400 font-medium">Enable micro-interaction animations</span>
                        </div>
                        <ToggleSwitch checked={animations} onChange={() => { setAnimations(p => !p); markDirty(); }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-3">Accent Color</label>
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
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Language" value={language} onChange={wrapChange(setLanguage)} options={['English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Portuguese']} />
                    <SelectField label="Timezone" value={timezone} onChange={wrapChange(setTimezone)} options={['America/Chicago (CDT)', 'America/New_York (EDT)', 'America/Los_Angeles (PDT)', 'UTC', 'Europe/London (BST)']} />
                    <SelectField label="Date Format" value={dateFormat} onChange={wrapChange(setDateFormat)} options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']} />
                    <SelectField label="Distance Unit" value={distanceUnit} onChange={wrapChange(setDistanceUnit)} options={['Miles', 'Kilometers']} />
                    <SelectField label="Currency" value={currency} onChange={wrapChange(setCurrency)} options={['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD (C$)', 'AUD (A$)']} />
                    <SelectField label="Auto Refresh" value={autoRefresh} onChange={wrapChange(setAutoRefresh)} options={['Off', '15 seconds', '30 seconds', '1 minute', '5 minutes']} />
                    <SelectField label="Default Dashboard" value="Fleet Overview" onChange={() => markDirty()} options={['Fleet Overview', 'Trip Management', 'Driver Management', 'Reports']} />
                    <SelectField label="Items Per Page" value="25" onChange={() => markDirty()} options={['10', '25', '50', '100']} />
                  </div>
                </SectionCard>
              )}

              {/* ── SESSIONS ── */}
              {activeSection === 'sessions' && (
                <SectionCard title="Active Sessions" subtitle="Manage your logged-in devices and sessions.">
                  <div className="space-y-3">
                    {[
                      { device: 'MacBook Pro 16"', browser: 'Chrome 124', os: 'macOS 14.5', ip: '192.168.1.10', location: 'Chicago, IL', time: 'Now — Current Session', current: true },
                      { device: 'iPhone 15 Pro', browser: 'Safari 17', os: 'iOS 17.4', ip: '10.0.0.4', location: 'Chicago, IL', time: '2h ago', current: false },
                      { device: 'Windows 11 PC', browser: 'Edge 123', os: 'Windows 11', ip: '72.14.180.6', location: 'Atlanta, GA', time: '3 days ago', current: false },
                    ].map((s, i) => (
                      <div key={i} className={`p-4 border rounded-xl flex items-start justify-between ${s.current ? 'bg-blue-50/40 border-primary/25' : 'bg-white border-border-gray'}`}>
                        <div className="flex items-start space-x-3.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.current ? 'bg-blue-100 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                            {s.device.includes('iPhone') ? <Smartphone className="w-4.5 h-4.5" /> : <Monitor className="w-4.5 h-4.5" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-[11.5px] font-black text-slate-700">{s.device}</h4>
                              {s.current && <span className="text-[9px] font-black text-primary bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">Current</span>}
                            </div>
                            <p className="text-[10.5px] text-slate-500 font-medium">{s.browser} · {s.os}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{s.ip} · {s.location}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{s.time}</p>
                          </div>
                        </div>
                        {!s.current && (
                          <button onClick={() => onShowToast('Session terminated.')} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer border border-rose-200 bg-rose-50 px-2.5 py-1 rounded-lg">Terminate</button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => onShowToast('All other sessions terminated.')} className="text-xs font-bold text-rose-500 hover:underline cursor-pointer pt-1">Terminate All Other Sessions</button>
                  </div>
                </SectionCard>
              )}

              {/* ── ACTIVITY LOG ── */}
              {activeSection === 'activity' && (
                <SectionCard title="Account Activity Log" subtitle="A complete history of actions performed on your account.">
                  <div className="relative pl-5 space-y-5 border-l-2 border-primary/10">
                    {[
                      { event: 'Profile information updated', time: '5m ago', type: 'profile' },
                      { event: 'Logged in via Chrome on MacBook Pro', time: '2h ago', type: 'login' },
                      { event: 'Password changed', time: '3 days ago', type: 'security' },
                      { event: 'Notification preferences updated', time: '5 days ago', type: 'settings' },
                      { event: 'Weekly fleet report exported as PDF', time: '1 week ago', type: 'report' },
                      { event: 'Role updated: Senior Fleet Manager', time: '2 weeks ago', type: 'role' },
                      { event: 'Two-Factor Authentication enabled', time: '1 month ago', type: 'security' },
                    ].map((ev, i) => {
                      const dot = ev.type === 'security' ? 'bg-rose-400' : ev.type === 'login' ? 'bg-emerald-400' : ev.type === 'role' ? 'bg-amber-400' : 'bg-primary';
                      return (
                        <div key={i} className="relative">
                          <div className={`absolute -left-[21px] top-1.5 w-2 h-2 ${dot} border-2 border-white rounded-full`} />
                          <h4 className="text-[11.5px] font-bold text-slate-700">{ev.event}</h4>
                          <span className="text-[9.5px] font-mono text-slate-400">{ev.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* ── CONNECTED ACCOUNTS ── */}
              {activeSection === 'connected' && (
                <SectionCard title="Connected Accounts & Integrations" subtitle="Manage external service connections and SSO providers.">
                  <div className="space-y-3">
                    {[
                      { name: 'Microsoft 365', icon: '🟦', status: true, sync: '2h ago' },
                      { name: 'Google Workspace', icon: '🔴', status: true, sync: '5m ago' },
                      { name: 'Slack', icon: '🟣', status: false, sync: 'Never' },
                      { name: 'Microsoft Teams', icon: '🔵', status: false, sync: 'Never' },
                      { name: 'Email (SMTP)', icon: '📧', status: true, sync: '1h ago' },
                    ].map(acc => (
                      <div key={acc.name} className="flex items-center justify-between p-4 bg-slate-50 border border-border-gray/60 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-center space-x-3.5">
                          <span className="text-2xl">{acc.icon}</span>
                          <div>
                            <h4 className="text-[11.5px] font-black text-slate-700">{acc.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Last sync: {acc.sync}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-[9.5px] font-bold ${acc.status ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {acc.status ? '● Connected' : '○ Not Connected'}
                          </span>
                          <button
                            onClick={() => onShowToast(acc.status ? `${acc.name} disconnected.` : `Connecting to ${acc.name}...`)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${acc.status ? 'border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100/50' : 'border-border-gray bg-white text-primary hover:bg-blue-50'}`}
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
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Fleet Region" value="Midwest" onChange={() => markDirty()} options={['Midwest', 'Northeast', 'Southeast', 'Southwest', 'West']} />
                    <SelectField label="Fleet Size (Visible)" value="Full Fleet" onChange={() => markDirty()} options={['Full Fleet', 'My Region Only', 'Custom']} />
                    <SelectField label="Default Report Period" value="This Month" onChange={() => markDirty()} options={['This Week', 'This Month', 'This Quarter', 'This Year']} />
                    <SelectField label="Maintenance Threshold Alert" value="7 Days Before" onChange={() => markDirty()} options={['3 Days Before', '7 Days Before', '14 Days Before', '30 Days Before']} />
                  </div>
                </SectionCard>
              )}

              {/* ── DEVELOPER ── */}
              {activeSection === 'developer' && (
                <SectionCard title="API & Developer Settings" subtitle="Manage API keys, webhooks, and developer access tokens.">
                  <div className="space-y-4 max-w-lg">
                    {[
                      { label: 'API Key', value: apiKeyVisible ? 'sk_live_transit_a8f3d2b1c9e7f4a21...' : '••••••••••••••••••••••••••••••', copy: true, toggle: true },
                      { label: 'Webhook URL', value: 'https://hooks.fleetflow.io/webhooks/7f4a21', copy: true, toggle: false },
                      { label: 'Access Token', value: 'Bearer eyJhbGciOiJIUzI1NiIs...', copy: true, toggle: false },
                    ].map(field => (
                      <div key={field.label} className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{field.label}</label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 px-3 py-2.5 bg-slate-900 text-emerald-400 text-[10.5px] font-mono rounded-xl border border-slate-700 truncate">
                            {field.value}
                          </code>
                          {field.toggle && (
                            <button onClick={() => setApiKeyVisible(p => !p)} className="p-2 border border-border-gray bg-white hover:bg-slate-50 rounded-xl cursor-pointer">
                              {apiKeyVisible ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                            </button>
                          )}
                          <button onClick={() => onShowToast('Copied to clipboard.')} className="p-2 border border-border-gray bg-white hover:bg-slate-50 rounded-xl cursor-pointer">
                            <Copy className="w-4 h-4 text-slate-500" />
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
                    <div className="space-y-3 max-w-lg">
                      {[
                        { label: 'Download My Data', sub: 'Export all your account data as a ZIP archive.', action: 'Request Download', icon: Download, color: 'text-primary' },
                        { label: 'Export Account Settings', sub: 'Export preferences and configuration as JSON.', action: 'Export JSON', icon: Download, color: 'text-primary' },
                        { label: 'View Audit Logs', sub: 'See all administrative actions on your account.', action: 'View Logs', icon: Activity, color: 'text-primary' },
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="flex items-center justify-between p-4 border border-border-gray bg-slate-50 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                            <div className="flex items-start space-x-3">
                              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.color}`} />
                              <div>
                                <h4 className="text-[11.5px] font-black text-slate-700">{item.label}</h4>
                                <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
                              </div>
                            </div>
                            <button onClick={() => onShowToast(`${item.action} initiated.`)} className="text-[10px] font-bold text-primary border border-blue-100 bg-blue-50 hover:bg-blue-100/50 px-2.5 py-1 rounded-lg cursor-pointer">{item.action}</button>
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                  <div className="border border-rose-200 rounded-2xl bg-rose-50/40 p-5 space-y-4">
                    <h3 className="text-xs font-black text-rose-600 uppercase tracking-tight flex items-center space-x-2"><AlertTriangle className="w-4 h-4" /><span>Danger Zone</span></h3>
                    <div className="flex items-center justify-between p-4 bg-white border border-rose-200 rounded-xl">
                      <div>
                        <h4 className="text-[11.5px] font-black text-rose-600">Delete Account</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Permanently delete your account and all associated data. This action is irreversible.</p>
                      </div>
                      <button onClick={() => onShowToast('Account deletion requires administrator approval.')} className="text-[10px] font-bold text-rose-600 border border-rose-300 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg cursor-pointer flex items-center space-x-1">
                        <Trash2 className="w-3.5 h-3.5" /><span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── SUPPORT ── */}
              {activeSection === 'support' && (
                <SectionCard title="Help & Support Center" subtitle="Get help, report issues, or contact the FleetFlow support team.">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { title: 'Documentation', desc: 'Browse the full FleetFlow user guide and API docs.', icon: '📖', action: 'Open Docs' },
                      { title: 'Report an Issue', desc: 'Submit a bug report or feature request to our team.', icon: '🐛', action: 'Report Issue' },
                      { title: 'Contact Administrator', desc: 'Reach out to your system admin for access or account help.', icon: '👨‍💼', action: 'Send Message' },
                      { title: 'System Status', desc: 'Check live service availability and uptime status.', icon: '🟢', action: 'View Status' },
                    ].map(card => (
                      <button key={card.title} onClick={() => onShowToast(`${card.action}...`)}
                        className="p-5 border border-border-gray bg-white hover:bg-slate-50 hover:shadow-sm rounded-2xl text-left space-y-2 transition-all cursor-pointer group">
                        <span className="text-3xl">{card.icon}</span>
                        <h4 className="text-[12px] font-black text-slate-700 group-hover:text-primary transition-colors">{card.title}</h4>
                        <p className="text-[10.5px] text-slate-400 font-medium leading-relaxed">{card.desc}</p>
                        <span className="text-[10px] font-bold text-primary flex items-center space-x-1">{card.action} <ChevronRight className="w-3 h-3" /></span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 p-4 bg-blue-50/40 border border-primary/20 rounded-xl flex items-center space-x-4">
                    <Sparkles className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-[11.5px] font-black text-slate-700">FleetFlow AI Assistant</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Ask the AI assistant anything about your fleet, reports, or platform settings.</p>
                    </div>
                    <button onClick={() => onShowToast('Opening AI Assistant...')} className="ml-auto px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-xl cursor-pointer shrink-0">Ask AI</button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSaveModal(false)} className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-sm w-full mx-4 z-10 p-6 text-left space-y-4">
              <div className="w-12 h-12 bg-blue-50 border border-primary/20 rounded-2xl flex items-center justify-center">
                <Save className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-black text-text-dark">Save Profile Changes?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Your changes will be applied immediately across the platform. This action cannot be undone without re-editing.
              </p>
              <div className="flex space-x-3 pt-2">
                <button onClick={() => setShowSaveModal(false)} className="flex-1 py-2.5 border border-border-gray bg-white text-slate-600 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm flex items-center justify-center space-x-1.5">
                  <Check className="w-3.5 h-3.5" /><span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
