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
  Briefcase,
  Activity,
  History,
  ShieldAlert,
  FileCheck,
  MapPin
} from 'lucide-react';
import type { DriverData } from './DriverManagement';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusPill } from '../ui/StatusPill';
import { Reveal } from '../ui/Reveal';

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
    <Reveal className="space-y-6 select-none relative text-left">
      
      {/* Sticky top action header */}
      <SectionHeader
        title="Driver Profile Details"
        subtitle="Monitor driver performance, compliance, assignments, and operational history from one unified workspace."
        onBack={onClose}
        actions={
          <>
            <button
              onClick={onEdit}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer flex items-center space-x-1.5 cc-shadow-sm"
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
              className={`px-3.5 py-2 border text-xs font-bold rounded-[12px] transition-all cursor-pointer flex items-center space-x-1.5 cc-shadow-sm ${
                driver.status === 'Suspended'
                  ? 'border-emerald-200 bg-[#ECFDF5] text-[#059669] hover:bg-[#ECFDF5]/80'
                  : 'border-rose-200 bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEF2F2]/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{driver.status === 'Suspended' ? 'Lift Suspension' : 'Suspend Driver'}</span>
            </button>

            <button
              onClick={() => onShowToast('Exporting Operator Safety Dossier as PDF...')}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer flex items-center space-x-1.5 cc-shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Profile</span>
            </button>
          </>
        }
      />

      {/* Tabs navigation */}
      <div className="flex space-x-1 border-b border-[#E5E7EB] pb-px">
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
              className={`px-4 py-2.5 border-b-2 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer focus:outline-none ${
                isActive 
                  ? 'border-primary text-primary font-black' 
                  : 'border-transparent text-[#9CA3AF] hover:text-[#4B5563]'
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
              <div className="bg-white border border-[#E5E7EB] p-6 rounded-[16px] cc-shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
                <div className="md:col-span-1 text-center md:text-left space-y-3.5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#F3F4F6] pb-5 md:pb-0 md:pr-6">
                  <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#EFF4FF] text-primary border border-[#DBE6FF] flex items-center justify-center shadow-inner relative">
                      <User className="w-8 h-8" />
                      {driver.status === 'Available' && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#059669] border-2 border-white rounded-full animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2.5 justify-center md:justify-start">
                        <h2 className="text-base font-black text-[#0A0A0A] tracking-tight leading-tight">{driver.name}</h2>
                        <StatusPill status={driver.status} pulse={driver.status === 'Available'} />
                      </div>
                      <span className="text-[10px] font-bold font-mono text-[#9CA3AF] mt-1.5 block uppercase leading-none">
                        {driver.id}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] font-semibold text-[#4B5563]">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      <span>{driver.region} Hub</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      <span>{driver.experience} Years Experience</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-[#F9FAFB]/50 border border-[#E5E7EB] rounded-[12px] flex flex-col justify-between cc-shadow-sm hover:scale-[1.02] transition-transform duration-200">
                    <span className="text-[9px] uppercase font-bold text-[#9CA3AF] tracking-wider block">Safety Score</span>
                    <div className="flex items-center space-x-2 mt-2">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle cx="20" cy="20" r="16" className="stroke-[#F3F4F6]" strokeWidth="2.5" fill="transparent" />
                        <circle cx="20" cy="20" r="16" className={driver.safetyScore >= 90 ? 'stroke-primary' : driver.safetyScore >= 70 ? 'stroke-amber-500' : 'stroke-rose-500'} strokeWidth="2.5" fill="transparent" strokeDasharray={2 * Math.PI * 16} strokeDashoffset={2 * Math.PI * 16 - (driver.safetyScore / 100) * 2 * Math.PI * 16} />
                      </svg>
                      <span className="text-sm font-black text-[#0A0A0A] font-mono">{driver.safetyScore}%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F9FAFB]/50 border border-[#E5E7EB] rounded-[12px] flex flex-col justify-between cc-shadow-sm hover:scale-[1.02] transition-transform duration-200">
                    <span className="text-[9px] uppercase font-bold text-[#9CA3AF] tracking-wider block">Trips Completed</span>
                    <div className="mt-3">
                      <h4 className="text-xl font-black text-[#0A0A0A] leading-none font-mono tabular-nums">{driver.totalTrips}</h4>
                      <p className="text-[9.5px] text-[#9CA3AF] font-semibold mt-1">Life-to-date missions</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F9FAFB]/50 border border-[#E5E7EB] rounded-[12px] flex flex-col justify-between cc-shadow-sm hover:scale-[1.02] transition-transform duration-200 col-span-2 md:col-span-1">
                    <span className="text-[9px] uppercase font-bold text-[#9CA3AF] tracking-wider block">Fuel Efficiency</span>
                    <div className="mt-3">
                      <h4 className="text-xl font-black text-[#0A0A0A] leading-none font-mono">{driver.avgFuelEfficiency} MPG</h4>
                      <p className="text-[9.5px] text-[#9CA3AF] font-semibold mt-1">Fleet average 7.0 MPG</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Performance Analytics */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                  <div>
                    <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase">Performance Metrics</h3>
                    <p className="text-[10px] text-[#9CA3AF] font-medium">Historical trip counts and distance averages.</p>
                  </div>
                  <div className="flex p-0.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded-[12px] shrink-0">
                    <button
                      onClick={() => setTimeRange('week')}
                      className={`px-2.5 py-1 rounded-[8px] text-[9.5px] font-bold transition-all cursor-pointer ${
                        timeRange === 'week' ? 'bg-white text-primary shadow-sm' : 'text-[#6B7280]'
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setTimeRange('month')}
                      className={`px-2.5 py-1 rounded-[8px] text-[9.5px] font-bold transition-all cursor-pointer ${
                        timeRange === 'month' ? 'bg-white text-primary shadow-sm' : 'text-[#6B7280]'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Distance chart */}
                  <div className="space-y-2 border border-[#E5E7EB] p-4 rounded-[12px] bg-[#F9FAFB]/30">
                    <div className="flex justify-between text-[11px] font-bold text-[#6B7280]">
                      <span>Distance Driven (Miles)</span>
                      <span className="text-primary font-mono tabular-nums">+{timeRange === 'month' ? '10,900' : '2,010'}</span>
                    </div>
                    <div className="pt-2">
                      <AreaChart data={distanceData} color="#2563EB" fillColor="rgba(37, 99, 235, 0.05)" />
                    </div>
                  </div>

                  {/* Trips completed chart */}
                  <div className="space-y-2 border border-[#E5E7EB] p-4 rounded-[12px] bg-[#F9FAFB]/30">
                    <div className="flex justify-between text-[11px] font-bold text-[#6B7280]">
                      <span>Trips Completed</span>
                      <span className="text-primary font-mono tabular-nums">+{timeRange === 'month' ? '105' : '18'}</span>
                    </div>
                    <div className="pt-2">
                      <LineChart data={tripsData} color="#2563EB" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Analytics Summary */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
                <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2">Safety & Incident Audit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-[#4B5563]">
                  <div className="p-3.5 border border-[#E5E7EB] rounded-[12px] bg-[#F9FAFB]/50">
                    <span className="text-[#9CA3AF] text-[10px] uppercase font-bold block mb-1">Speed Warnings</span>
                    <span className="text-base font-black text-[#0A0A0A] font-mono tabular-nums">{driver.incidents > 0 ? '2 Alerts' : '0 Alerts'}</span>
                  </div>
                  <div className="p-3.5 border border-[#E5E7EB] rounded-[12px] bg-[#F9FAFB]/50">
                    <span className="text-[#9CA3AF] text-[10px] uppercase font-bold block mb-1">Harsh Braking</span>
                    <span className="text-base font-black text-[#0A0A0A] font-mono">0 Events</span>
                  </div>
                  <div className="p-3.5 border border-[#E5E7EB] rounded-[12px] bg-[#F9FAFB]/50">
                    <span className="text-[#9CA3AF] text-[10px] uppercase font-bold block mb-1">Total Incidents</span>
                    <span className={`text-base font-black font-mono ${driver.incidents > 0 ? 'text-[#DC2626]' : 'text-[#0A0A0A]'}`}>
                      {driver.incidents} Incidents
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right column: Status details, Readiness, Insights */}
            <div className="space-y-6">
              
              {/* Readiness Panel */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-center space-y-4">
                <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 text-left">
                  Operator Readiness
                </h3>
                
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} className="stroke-[#F3F4F6]" strokeWidth="5.5" fill="transparent" />
                    <circle cx="48" cy="48" r={radius} className={readinessScore >= 90 ? 'stroke-primary' : 'stroke-amber-500'} strokeWidth="5.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none leading-none">
                    <span className="text-lg font-black text-[#0A0A0A] font-mono tabular-nums">{readinessScore}%</span>
                    <span className="text-[8px] text-[#9CA3AF] font-bold uppercase mt-1">Readiness</span>
                  </div>
                </div>

                <div className="pt-2">
                  {readinessScore >= 90 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10.5px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC] leading-none">
                      Ready for Route Assignment
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10.5px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE8C4] leading-none">
                      Requires Compliance Review
                    </span>
                  )}
                </div>
              </div>

              {/* Active vehicle assignment */}
              {driver.status === 'On Trip' && (
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
                  <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
                    <Activity className="w-4 h-4 text-primary mr-1.5 animate-pulse" /> Active Mission Assignment
                  </h3>

                  <div className="space-y-3.5 text-[11px] font-semibold text-[#4B5563]">
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF] font-medium">Assigned Vehicle</span>
                      <span className="font-bold text-[#0A0A0A] font-mono">{driver.currentVehicle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF] font-medium">Active Trip Route</span>
                      <span className="text-[#0A0A0A]">{driver.lastTrip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF] font-medium">Transit Status</span>
                      <span className="text-primary font-bold">On Route</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Performance Insights */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
                <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
                  <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Safety Insights
                </h3>
                
                <div className="space-y-3">
                  {driver.incidents === 0 ? (
                    <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2 text-[#4B5563]">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                      <span className="text-[10.5px] leading-normal font-semibold">
                        Driver holds a {driver.safetyScore}% safety rating. Recommended for premium corporate cargo.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#FFFBEB] border border-[#FDE8C4] rounded-[12px] flex items-start space-x-2 text-[#D97706]">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5" />
                      <span className="text-[10.5px] leading-normal font-semibold">
                        Safety scores require minor review due to incident alerts during harsh braking logs.
                      </span>
                    </div>
                  )}

                  {isExpiringSoon && (
                    <div className="p-3 bg-[#FEF2F2] border border-[#FBD5D5] rounded-[12px] flex items-start space-x-2 text-[#DC2626]">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" />
                      <span className="text-[10.5px] leading-normal font-semibold font-mono">
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
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
              <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2">Compliance Center</h3>
              
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
                    <div key={item.id} className="p-4 border border-[#E5E7EB] rounded-[12px] bg-[#F9FAFB]/30 flex flex-col justify-between space-y-3.5 hover:scale-[1.01] transition-transform">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-[11.5px] font-bold text-[#4B5563] leading-tight">{item.name}</h4>
                          {isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                          ) : isSoon ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                          ) : (
                            <XCircle className="w-4 h-4 text-[#DC2626] shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[9.5px] text-[#9CA3AF] mt-1 leading-normal">{item.desc}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-[#F3F4F6]">
                        <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-wider">{item.status}</span>
                        <button
                          onClick={() => onShowToast(`Renewal queued for ${item.name}`)}
                          className="px-2.5 py-1 text-[9.5px] font-black text-primary hover:bg-[#EFF4FF] border border-primary/20 rounded-[8px] transition-colors cursor-pointer"
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
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
              <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2">Document Attachments</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'license_scan', name: 'CDL License Scan.pdf', size: '2.4 MB' },
                  { id: 'dot_medical', name: 'dot_medical_certificate.pdf', size: '1.8 MB' },
                  { id: 'bgc_auth', name: 'background_check_auth.pdf', size: '3.1 MB' }
                ].map((doc) => (
                  <div key={doc.id} className="p-4 border border-[#E5E7EB] rounded-[12px] hover:border-primary/45 transition-colors flex items-center justify-between group bg-[#F9FAFB]/10">
                    <div className="flex items-center space-x-3.5">
                      <FileText className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <h4 className="text-[11px] font-bold text-[#4B5563] leading-tight">{doc.name}</h4>
                        <span className="text-[9px] text-[#9CA3AF] font-bold font-mono">{doc.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onShowToast(`Downloading ${doc.name}...`)}
                        className="p-1 hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#4B5563] rounded cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onShowToast(`${doc.name} deleted.`)}
                        className="p-1 hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#DC2626] rounded cursor-pointer"
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
            className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-[#E5E7EB] text-left">
              <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase">Missions Logs</h3>
              <p className="text-[10px] text-[#9CA3AF] font-medium mt-1">Completed and active dispatch logs assigned to {driver.name}.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Trip ID</th>
                    <th className="p-3.5">Assigned Route</th>
                    <th className="p-3.5">Cargo Config</th>
                    <th className="p-3.5">Assigned Asset</th>
                    <th className="p-3.5">Odometer Status</th>
                    <th className="p-3.5">Dispatch State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6] text-[11px] font-semibold text-[#4B5563]">
                  {driver.status === 'On Trip' && (
                    <tr className="hover:bg-[#F9FAFB]/50 bg-blue-50/5">
                      <td className="p-3.5 pl-5 font-bold font-mono text-primary">TR-Active</td>
                      <td className="p-3.5">{driver.lastTrip}</td>
                      <td className="p-3.5">Freight Logistics</td>
                      <td className="p-3.5 font-bold text-[#0A0A0A] font-mono">{driver.currentVehicle}</td>
                      <td className="p-3.5 font-mono tabular-nums">142,300 mi</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#EFF4FF] text-primary border border-[#DBE6FF]">
                          On Route
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr className="hover:bg-[#F9FAFB]/50">
                    <td className="p-3.5 pl-5 font-bold font-mono text-[#9CA3AF]">TR-8802</td>
                    <td className="p-3.5">CHI-Depot ➔ ATL-Hub</td>
                    <td className="p-3.5">Consumer Goods</td>
                    <td className="p-3.5 font-bold text-[#0A0A0A] font-mono">Freightliner Cascadia (#TRK-201)</td>
                    <td className="p-3.5 font-mono tabular-nums">215,400 mi</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC]">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F9FAFB]/50">
                    <td className="p-3.5 pl-5 font-bold font-mono text-[#9CA3AF]">TR-7761</td>
                    <td className="p-3.5">LAX-Hub ➔ SFO-Terminal</td>
                    <td className="p-3.5">Perishable Groceries</td>
                    <td className="p-3.5 font-bold text-[#0A0A0A] font-mono">Ford Transit Cargo (#TRK-109)</td>
                    <td className="p-3.5 font-mono tabular-nums">42,100 mi</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC]">
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
    </Reveal>
  );
};
