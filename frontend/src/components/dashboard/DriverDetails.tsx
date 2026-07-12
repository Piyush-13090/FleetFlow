import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit2, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  User, 
  Sparkles,
  ArrowLeft,
  Briefcase,
  Activity,
  History,
  ShieldAlert,
  FileCheck,
  MapPin
} from 'lucide-react';
import type { DriverData } from './DriverManagement';

interface DriverDetailsProps {
  driver: DriverData;
  onClose: () => void;
  onEdit: () => void;
  onShowToast: (msg: string) => void;
}

// Custom pure SVG Area Chart for distance driven
const AreaChart: React.FC<{ data: number[]; color: string; fillColor: string }> = ({ data, color, fillColor }) => {
  const width = 280;
  const height = 80;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - 4 - ((val - min) / range) * (height - 12);
    return `${x},${y}`;
  });
  
  const pathD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  const lineD = `M ${points.join(' L ')}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible select-none">
      <path d={pathD} fill={fillColor} />
      <path d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Custom pure SVG Line Chart for trips completed
const LineChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const width = 280;
  const height = 80;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - 4 - ((val - min) / range) * (height - 12);
    return { x, y, val };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible select-none">
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#FFFFFF" stroke={color} strokeWidth="1.5" className="hover:r-4 transition-all cursor-pointer" />
      ))}
    </svg>
  );
};

export const DriverDetails: React.FC<DriverDetailsProps> = ({
  driver,
  onClose,
  onEdit,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'history'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('month');

  // License Expiry Status helper
  const isExpiringSoon = driver.daysToExpiry > 0 && driver.daysToExpiry <= 30;

  // Mock Performance Data
  const tripsData = timeRange === 'month' ? [12, 14, 11, 16, 15, 18, 20] : [3, 4, 2, 5, 4];
  const distanceData = timeRange === 'month' ? [1200, 1450, 1100, 1650, 1500, 1900, 2100] : [350, 420, 280, 510, 450];

  // Dynamic Driver Readiness Score Calculation
  const calculateReadinessScore = (): number => {
    let score = 0;
    const docs = driver.compliance;
    const docsCount = Object.values(docs).filter(v => v === 'Valid' || v === 'Cleared' || v === 'Completed').length;
    score += docsCount * 15; // 75% max for docs
    if (driver.daysToExpiry > 0) score += 10;
    if (driver.safetyScore >= 90) score += 15;
    else if (driver.safetyScore >= 70) score += 5;
    return score;
  };

  const readinessScore = calculateReadinessScore();

  // SVG Circular progress math
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="space-y-6 select-none relative text-left">
      
      {/* Sticky top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-gray/50 bg-white/80 backdrop-blur sticky top-16 z-20">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onClose}
            className="p-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Back to Registry"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">
              Driver Profile Details
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
              Monitor driver performance, compliance, assignments, and operational history from one unified workspace.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="px-3.5 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Driver</span>
          </button>
          
          <button
            onClick={() => {
              if (driver.status === 'Suspended') {
                onShowToast('Safety suspension order lifted.');
              } else {
                onShowToast('Safety suspension order issued.');
              }
            }}
            className={`px-3.5 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm ${
              driver.status === 'Suspended'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100/50'
                : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{driver.status === 'Suspended' ? 'Lift Suspension' : 'Suspend Driver'}</span>
          </button>

          <button
            onClick={() => onShowToast('Exporting Operator Safety Dossier as PDF...')}
            className="px-3.5 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Profile</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex space-x-1 border-b border-border-gray/50 pb-px">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'compliance', label: 'Compliance & Docs', icon: FileCheck },
          { id: 'history', label: 'Trip History Logs', icon: History }
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer focus:outline-none ${
                isActive 
                  ? 'border-primary text-primary font-black' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT WIDGETS */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left columns: Profile Hero and Analytics */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Hero Card */}
              <div className="bg-white border border-border-gray p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
                <div className="md:col-span-1 text-center md:text-left space-y-3.5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-6">
                  <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-primary border border-primary/20 flex items-center justify-center shadow-inner relative">
                      <User className="w-8 h-8" />
                      {driver.status === 'Available' && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-base font-black text-text-dark tracking-tight leading-tight">{driver.name}</h2>
                      <span className="text-[10px] font-bold font-mono text-slate-400 mt-1 block uppercase leading-none">
                        {driver.id}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] font-semibold text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{driver.region} Hub</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{driver.experience} Years Experience</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-slate-50/50 border border-border-gray rounded-xl flex flex-col justify-between shadow-sm hover:scale-102 transition-transform duration-200">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Safety Score</span>
                    <div className="flex items-center space-x-2 mt-2">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="16" className="stroke-slate-100" strokeWidth="2.5" fill="transparent" />
                        <circle cx="20" cy="20" r="16" className={driver.safetyScore >= 90 ? 'stroke-primary' : driver.safetyScore >= 70 ? 'stroke-amber-500' : 'stroke-rose-500'} strokeWidth="2.5" fill="transparent" strokeDasharray={2 * Math.PI * 16} strokeDashoffset={2 * Math.PI * 16 - (driver.safetyScore / 100) * 2 * Math.PI * 16} />
                      </svg>
                      <span className="text-sm font-black text-slate-700">{driver.safetyScore}%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 border border-border-gray rounded-xl flex flex-col justify-between shadow-sm hover:scale-102 transition-transform duration-200">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Trips Completed</span>
                    <div className="mt-3">
                      <h4 className="text-xl font-black text-slate-700 leading-none">{driver.totalTrips}</h4>
                      <p className="text-[9.5px] text-slate-400 font-semibold mt-1">Life-to-date missions</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 border border-border-gray rounded-xl flex flex-col justify-between shadow-sm hover:scale-102 transition-transform duration-200 col-span-2 md:col-span-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Fuel Efficiency</span>
                    <div className="mt-3">
                      <h4 className="text-xl font-black text-slate-700 leading-none">{driver.avgFuelEfficiency} MPG</h4>
                      <p className="text-[9.5px] text-slate-400 font-semibold mt-1">Fleet average 7.0 MPG</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Performance Analytics */}
              <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase">Performance Metrics</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Historical trip counts and distance averages.</p>
                  </div>
                  <div className="flex p-0.5 bg-slate-100 border border-border-gray rounded-xl shrink-0">
                    <button
                      onClick={() => setTimeRange('week')}
                      className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer ${
                        timeRange === 'week' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setTimeRange('month')}
                      className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer ${
                        timeRange === 'month' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Distance chart */}
                  <div className="space-y-2 border border-border-gray/60 p-4 rounded-xl">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Distance Driven (Miles)</span>
                      <span className="text-primary font-mono">+{timeRange === 'month' ? '10,900' : '2,010'}</span>
                    </div>
                    <AreaChart data={distanceData} color="#2563EB" fillColor="#DBEAFE/30" />
                  </div>

                  {/* Trips completed chart */}
                  <div className="space-y-2 border border-border-gray/60 p-4 rounded-xl">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Trips Completed</span>
                      <span className="text-primary font-mono">+{timeRange === 'month' ? '105' : '18'}</span>
                    </div>
                    <LineChart data={tripsData} color="#3B82F6" />
                  </div>
                </div>
              </div>

              {/* Safety Analytics Summary */}
              <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
                <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2">Safety & Incident Audit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
                  <div className="p-3.5 border border-border-gray/50 rounded-xl bg-slate-50/50">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Speed Warnings</span>
                    <span className="text-base font-black text-slate-700">{driver.incidents > 0 ? '2 Alerts' : '0 Alerts'}</span>
                  </div>
                  <div className="p-3.5 border border-border-gray/50 rounded-xl bg-slate-50/50">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Harsh Braking</span>
                    <span className="text-base font-black text-slate-700">0 Events</span>
                  </div>
                  <div className="p-3.5 border border-border-gray/50 rounded-xl bg-slate-50/50">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Total Incidents</span>
                    <span className={`text-base font-black ${driver.incidents > 0 ? 'text-rose-500' : 'text-slate-700'}`}>
                      {driver.incidents} Incidents
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right column: Status details, Readiness, Insights */}
            <div className="space-y-6">
              
              {/* Readiness Panel */}
              <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-center space-y-4">
                <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2 text-left">
                  Operator Readiness
                </h3>
                
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} className="stroke-slate-100" strokeWidth="5.5" fill="transparent" />
                    <circle cx="48" cy="48" r={radius} className={readinessScore >= 90 ? 'stroke-primary' : 'stroke-amber-500'} strokeWidth="5.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none leading-none">
                    <span className="text-lg font-black text-text-dark">{readinessScore}%</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">Readiness</span>
                  </div>
                </div>

                <div className="pt-2">
                  {readinessScore >= 90 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 leading-none">
                      Ready for Route Assignment
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-600 border border-amber-100 leading-none">
                      Requires Compliance Review
                    </span>
                  )}
                </div>
              </div>

              {/* Active vehicle assignment */}
              {driver.status === 'On Trip' && (
                <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
                  <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2 flex items-center">
                    <Activity className="w-4 h-4 text-primary mr-1.5 animate-pulse" /> Active Mission Assignment
                  </h3>

                  <div className="space-y-3.5 text-[11px] font-semibold text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Assigned Vehicle</span>
                      <span className="font-bold">{driver.currentVehicle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Active Trip Route</span>
                      <span>{driver.lastTrip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Transit Status</span>
                      <span className="text-primary font-bold">On Route</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Performance Insights */}
              <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
                <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2 flex items-center">
                  <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Safety Insights
                </h3>
                
                <div className="space-y-3">
                  {driver.incidents === 0 ? (
                    <div className="p-3 bg-blue-50/50 border border-primary/20 rounded-xl flex items-start space-x-2 text-slate-600">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                      <span className="text-[10.5px] leading-normal font-semibold">
                        Driver holds a {driver.safetyScore}% safety rating. Recommended for premium corporate cargo.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-amber-600">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5" />
                      <span className="text-[10.5px] leading-normal font-semibold">
                        Safety scores require minor review due to incident alerts during harsh braking logs.
                      </span>
                    </div>
                  )}

                  {isExpiringSoon && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-600">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" />
                      <span className="text-[10.5px] leading-normal font-semibold">
                        CDL driving license is expiring in {driver.daysToExpiry} days. Onboard compliance documents soon.
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: COMPLIANCE */}
        {activeTab === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
              <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2">Compliance Center</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'license', name: 'Commercial Driving License', status: driver.compliance.license, desc: 'Class CDL-A credentials validation' },
                  { id: 'medical', name: 'DOT Medical Certificate', status: driver.compliance.medical, desc: 'Medical physical exam fitness' },
                  { id: 'background', name: 'BGC Background Check', status: driver.compliance.background, desc: 'Annual criminal record clearance' },
                  { id: 'training', name: 'Safety Training Certificates', status: driver.compliance.training, desc: 'Mandatory defensive driving seminars' }
                ].map((item) => {
                  const isValid = item.status === 'Valid' || item.status === 'Cleared' || item.status === 'Completed';
                  const isSoon = item.status === 'Expiring Soon';

                  return (
                    <div key={item.id} className="p-4 border border-border-gray/60 rounded-xl bg-slate-50/30 flex flex-col justify-between space-y-3.5">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-[11.5px] font-bold text-slate-700 leading-tight">{item.name}</h4>
                          {isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : isSoon ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">{item.desc}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.status}</span>
                        <button
                          onClick={() => onShowToast(`Renewal queued for ${item.name}`)}
                          className="px-2.5 py-1 text-[9.5px] font-black text-primary hover:bg-blue-50 border border-primary/20 rounded-lg transition-colors cursor-pointer"
                        >
                          Renew
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Documents section */}
            <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
              <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2">Document Attachments</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'license_scan', name: 'CDL License Scan.pdf', size: '2.4 MB' },
                  { id: 'dot_medical', name: 'dot_medical_certificate.pdf', size: '1.8 MB' },
                  { id: 'bgc_auth', name: 'background_check_auth.pdf', size: '3.1 MB' }
                ].map((doc) => (
                  <div key={doc.id} className="p-4 border border-border-gray rounded-xl hover:border-primary/45 transition-colors flex items-center justify-between group bg-slate-50/10">
                    <div className="flex items-center space-x-3.5">
                      <FileText className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-700 leading-tight">{doc.name}</h4>
                        <span className="text-[9px] text-slate-400 font-semibold">{doc.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onShowToast(`Downloading ${doc.name}...`)}
                        className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onShowToast(`${doc.name} deleted.`)}
                        className="p-1 hover:bg-slate-50 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-border-gray/50 text-left">
              <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase">Missions Logs</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Completed and active dispatch logs assigned to {driver.name}.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Trip ID</th>
                    <th className="p-3.5">Assigned Route</th>
                    <th className="p-3.5">Cargo Config</th>
                    <th className="p-3.5">Assigned Asset</th>
                    <th className="p-3.5">Odometer Status</th>
                    <th className="p-3.5">Dispatch State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gray/50 text-[11px] font-semibold text-slate-700">
                  {driver.status === 'On Trip' && (
                    <tr className="hover:bg-slate-50/50 bg-blue-50/5">
                      <td className="p-3.5 pl-5 font-bold font-mono text-primary">TR-Active</td>
                      <td className="p-3.5">{driver.lastTrip}</td>
                      <td className="p-3.5">Freight Logistics</td>
                      <td className="p-3.5 font-bold">{driver.currentVehicle}</td>
                      <td className="p-3.5 font-mono">142,300 mi</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                          On Route
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3.5 pl-5 font-bold font-mono text-slate-500">TR-8802</td>
                    <td className="p-3.5">CHI-Depot ➔ ATL-Hub</td>
                    <td className="p-3.5">Consumer Goods</td>
                    <td className="p-3.5 font-bold">Freightliner Cascadia (#TRK-201)</td>
                    <td className="p-3.5 font-mono">215,400 mi</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3.5 pl-5 font-bold font-mono text-slate-500">TR-7761</td>
                    <td className="p-3.5">LAX-Hub ➔ SFO-Terminal</td>
                    <td className="p-3.5">Perishable Groceries</td>
                    <td className="p-3.5 font-bold">Ford Transit Cargo (#TRK-109)</td>
                    <td className="p-3.5 font-mono">42,100 mi</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
