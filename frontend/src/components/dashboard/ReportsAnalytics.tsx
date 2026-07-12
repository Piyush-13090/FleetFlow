import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Truck,
  Sparkles,
  Info,
  DollarSign,
  Fuel,
  User,
  TrendingUp,
  BarChart2,
  FileText,
  Share2,
  Shield,
  Activity,
  MapPin
} from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusPill } from '../ui/StatusPill';
import { KpiTile } from '../ui/KpiTile';
import { Reveal } from '../ui/Reveal';
import { Segmented } from '../ui/Segmented';
import { Ring } from '../ui/Ring';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiData {
  id: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  spark: number[];
  color: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

interface ReportsAnalyticsProps {
  onShowToast: (msg: string) => void;
}

// ─── Pure SVG Chart Components ────────────────────────────────────────────────

const AreaChart: React.FC<{ data: number[]; labels: string[]; color: string; height?: number }> = ({ data, labels, color, height = 110 }) => {
  const w = 340; const h = height;
  const max = Math.max(...data, 1); const min = 0;
  const range = max - min;
  const pts = data.map((v, i) => `${10 + (i / (data.length - 1)) * (w - 20)},${h - 14 - ((v - min) / range) * (h - 28)}`);
  const pathD = `M ${pts.join(' L ')}`;
  const areaD = `M 10,${h - 14} L ${pts.join(' L ')} L ${10 + (w - 20)},${h - 14} Z`;
  return (
    <svg width="100%" height={h + 10} viewBox={`0 0 ${w} ${h + 10}`} className="overflow-visible select-none">
      <defs>
        <linearGradient id={`aGrad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#aGrad_${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((_, i) => (
        <circle key={i} cx={10 + (i / (data.length - 1)) * (w - 20)} cy={h - 14 - ((_ - min) / range) * (h - 28)} r="3" fill={color} />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={10 + (i / (labels.length - 1)) * (w - 20)} y={h + 6} textAnchor="middle" fill="#94A3B8" fontSize="7.5" fontWeight="600">{l}</text>
      ))}
    </svg>
  );
};

const BarChart: React.FC<{ data: number[]; labels: string[]; colors?: string[] }> = ({ data, labels, colors }) => {
  const h = 100; const max = Math.max(...data, 1);
  const bw = 28; const gap = 12;
  const totalW = data.length * (bw + gap) - gap;
  return (
    <svg width="100%" height={h + 20} viewBox={`0 0 ${totalW} ${h + 20}`} preserveAspectRatio="none" className="overflow-visible select-none">
      {data.map((v, i) => {
        const bh = (v / max) * (h - 10);
        const x = i * (bw + gap);
        const y = h - bh;
        const col = colors ? colors[i % colors.length] : '#2563EB';
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill={col} rx="4" opacity="0.9" className="hover:opacity-100 transition-opacity cursor-pointer" />
            <text x={x + bw / 2} y={h + 14} textAnchor="middle" fill="#94A3B8" fontSize="7" fontWeight="600">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};

const DonutChart: React.FC<{ segments: { label: string; value: number; color: string }[] }> = ({ segments }) => {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 38; const cx = 48; const cy = 48;
  let startAngle = -90;
  const slices = segments.map(s => {
    const angle = (s.value / total) * 360;
    const sa = startAngle; startAngle += angle;
    return { ...s, sa, angle };
  });
  const toXY = (angle: number, rad: number) => ({ x: cx + rad * Math.cos(angle * Math.PI / 180), y: cy + rad * Math.sin(angle * Math.PI / 180) });
  return (
    <svg width="96" height="96" className="select-none shrink-0">
      {slices.map((s, i) => {
        if (s.angle <= 0) return null;
        const s1 = toXY(s.sa, r); const e1 = toXY(s.sa + s.angle, r);
        return (
          <path key={i}
            d={`M ${cx} ${cy} L ${s1.x} ${s1.y} A ${r} ${r} 0 ${s.angle > 180 ? 1 : 0} 1 ${e1.x} ${e1.y} Z`}
            fill={s.color} className="hover:opacity-85 transition-opacity cursor-pointer"
          />
        );
      })}
      <circle cx={cx} cy={cy} r="24" fill="white" />
    </svg>
  );
};

const HorizontalBar: React.FC<{ label: string; value: number; max: number; color: string; suffix?: string }> = ({ label, value, max, color, suffix = '%' }) => {
  const pct = Math.min((value / (max || 1)) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10.5px] font-semibold text-slate-600">
        <span className="truncate max-w-[140px]">{label}</span>
        <span className="font-mono font-bold text-slate-800">{value}{suffix}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'drivers' | 'costs'>('overview');
  const [dateRange, setDateRange] = useState('This Month');
  const [isLoading, setIsLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Backend summary data
  const [summary, setSummary] = useState<{
    vehicles: number;
    drivers: number;
    trips: number;
    activeTrips: number;
    totalFuelCost: number;
    totalMaintenanceCost: number;
    totalExpenses: number;
    operationalCost: number;
    totalFuelQuantity: number;
  } | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await apiFetch('/api/fleet/reports/summary');
        if (res.ok) setSummary(await res.json());
      } catch { /* silent */ } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExport = (type: string) => {
    setShowExportMenu(false);
    onShowToast(`Generating ${type} report — download will begin shortly.`);
  };

  // ── Analytics KPIs (static sparklines + live values where available) ──

  const fuelCostVal = summary ? `$${summary.totalFuelCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '...';
  const maintCostVal = summary ? `$${summary.totalMaintenanceCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '...';
  const opsCostVal = summary ? `$${summary.operationalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '...';

  const kpis: KpiData[] = [
    { id: 'utilization', label: 'Fleet Utilization', value: '74%', change: '+11% vs last month', up: true, spark: [55, 60, 62, 68, 72, 74], color: '#2563EB', icon: Activity },
    { id: 'revenue', label: 'Total Revenue', value: '$128,400', change: '+8.2%', up: true, spark: [95000, 102000, 109000, 115000, 121000, 128400], color: '#22C55E', icon: DollarSign },
    { id: 'ops_cost', label: 'Operational Cost', value: opsCostVal, change: '-3.1%', up: true, spark: [51000, 49000, 48500, 47800, 46500, 46200], color: '#2563EB', icon: BarChart2 },
    { id: 'fuel_eff', label: 'Fuel Efficiency', value: '7.2 mpg', change: '+4% vs fleet avg', up: true, spark: [6.4, 6.6, 6.8, 7.0, 7.1, 7.2], color: '#22C55E', icon: Fuel },
    { id: 'distance', label: 'Total Distance', value: '98,640 mi', change: '+12% vs last month', up: true, spark: [72000, 78000, 82000, 88000, 93000, 98640], color: '#3B82F6', icon: MapPin },
    { id: 'fuel_used', label: 'Fuel Consumed', value: summary ? `${summary.totalFuelQuantity.toLocaleString()} gal` : '...', change: '+2.4%', up: false, spark: [11200, 11800, 12400, 12900, 13300, 13700], color: '#F59E0B', icon: Fuel },
    { id: 'maint_cost', label: 'Maintenance Cost', value: maintCostVal, change: '+13% vs last qtr', up: false, spark: [6200, 7100, 7400, 8000, 8500, 8940], color: '#EF4444', icon: Shield },
    { id: 'roi', label: 'Fleet ROI', value: '64.2%', change: '+5.8% net improvement', up: true, spark: [52, 55, 58, 60, 62, 64.2], color: '#22C55E', icon: TrendingUp },
  ];

  const costBreakdownData = summary
    ? [summary.totalFuelCost, summary.totalMaintenanceCost, summary.totalExpenses, 1800, 920, 1200]
    : [18400, 8940, 3200, 1800, 920, 1200];
  const costBreakdownLabels = ['Fuel', 'Maint.', 'Expenses', 'Tolls', 'Parking', 'Other'];
  const costBreakdownColors = ['#2563EB', '#F59E0B', '#EF4444', '#3B82F6', '#64748B', '#94A3B8'];

  const donutSegments = summary
    ? [
        { label: 'Fuel', value: summary.totalFuelCost, color: '#2563EB' },
        { label: 'Maintenance', value: summary.totalMaintenanceCost, color: '#3B82F6' },
        { label: 'Expenses', value: summary.totalExpenses, color: '#DBEAFE' },
        { label: 'Parking', value: 920, color: '#94A3B8' },
        { label: 'Tolls', value: 1800, color: '#64748B' },
      ]
    : [
        { label: 'Fuel', value: 18400, color: '#2563EB' },
        { label: 'Maintenance', value: 8940, color: '#3B82F6' },
        { label: 'Repairs', value: 3200, color: '#DBEAFE' },
        { label: 'Parking', value: 920, color: '#94A3B8' },
        { label: 'Tolls', value: 1800, color: '#64748B' },
      ];

  const utilizationData = [58, 64, 70, 68, 74, 72, 74];
  const utilizationLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fuelTrendData = [6.4, 6.7, 6.5, 7.0, 6.9, 7.2, 7.1];
  const tripStatusData = [42, 8, 5, 3, 7];
  const tripStatusLabels = ['Done', 'Cancelled', 'Delayed', 'Draft', 'Active'];
  const tripStatusColors = ['#22C55E', '#EF4444', '#F59E0B', '#94A3B8', '#2563EB'];

  const vehicleMatrix = [
    { reg: 'TRK-201', name: 'Freightliner Cascadia', distance: 18240, fuel: 2540, efficiency: 7.2, maintCost: 1650, opsCost: 9820, revenue: 24400, roi: 58.2, status: 'Active' },
    { reg: 'TRK-305', name: 'Peterbilt 579', distance: 22100, fuel: 2980, efficiency: 7.4, maintCost: 980, opsCost: 11200, revenue: 28600, roi: 61.4, status: 'Active' },
    { reg: 'TRK-109', name: 'Ford Transit Cargo', distance: 9800, fuel: 1420, efficiency: 6.9, maintCost: 320, opsCost: 4800, revenue: 12100, roi: 44.8, status: 'Available' },
    { reg: 'TRK-412', name: 'Kenworth T680', distance: 19600, fuel: 2700, efficiency: 7.3, maintCost: 2100, opsCost: 10200, revenue: 26000, roi: 53.9, status: 'Active' },
  ];

  const driverMatrix = [
    { name: 'James Carter', trips: 18, distance: 22100, safety: 97, efficiency: 7.4, incidents: 0, onTime: 98 },
    { name: 'Maria Torres', trips: 14, distance: 17400, safety: 94, efficiency: 7.1, incidents: 1, onTime: 93 },
    { name: 'Robert Blake', trips: 21, distance: 26800, safety: 91, efficiency: 6.9, incidents: 2, onTime: 88 },
    { name: 'Sarah Jenkins', trips: 11, distance: 13200, safety: 98, efficiency: 7.3, incidents: 0, onTime: 100 },
  ];

  const insights = [
    { type: 'positive', text: 'Fleet utilization increased by 11% this month — highest recorded in Q2.' },
    { type: 'positive', text: 'Fuel efficiency improved by 4% fleet-wide. Recommend sustained route optimization.' },
    { type: 'warn', text: 'Maintenance expenses trending upward (+13%). Three vehicles may require replacement planning.' },
    { type: 'warn', text: 'Vehicle TRK-109 has the lowest ROI (44.8%) — consider load optimization or reassignment.' },
    { type: 'positive', text: 'Driver Sarah Jenkins achieved 100% on-time delivery rate with zero incidents this period.' },
    { type: 'warn', text: 'Fuel cost is projected to rise 5–8% next month based on regional diesel price trends.' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-80 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-52 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <Reveal className="space-y-6 select-none relative pb-16 text-left">

      {/* ── Sticky Header ── */}
      <SectionHeader
        title="Reports & Analytics"
        subtitle="Monitor operational performance, fleet utilization, fuel efficiency, costs, and profitability with real-time analytics."
        actions={
          <>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(p => !p)}
                className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full right-0 mt-2 bg-white border border-[#E5E7EB] rounded-[16px] shadow-xl z-30 w-48 py-2 overflow-hidden"
                  >
                    {['Export CSV', 'Export PDF', 'Export Excel', 'Email Report'].map(opt => (
                      <button 
                        key={opt} 
                        onClick={() => handleExport(opt)} 
                        className="w-full px-4 py-2.5 text-xs font-semibold text-[#4B5563] hover:text-[#0A0A0A] hover:bg-[#F9FAFB] text-left cursor-pointer transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => onShowToast('Dashboard link copied to clipboard.')} 
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm flex items-center space-x-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button 
              onClick={() => onShowToast('Refreshing analytics data...')} 
              className="p-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] rounded-[12px] transition-all cursor-pointer cc-shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        }
      />

      {/* ── Global Filters ── */}
      <div className="sticky top-0 z-20 bg-white border border-[#E5E7EB] p-4 rounded-[16px] flex flex-wrap items-center gap-3.5 cc-shadow-sm">
        <div className="flex items-center space-x-2 border-r border-[#E5E7EB] pr-3.5 shrink-0 text-[#0A0A0A]">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-wider">Filters</span>
        </div>
        <select 
          value={dateRange} 
          onChange={e => setDateRange(e.target.value)} 
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer focus:bg-white"
        >
          {['This Week', 'This Month', 'This Quarter', 'This Year', 'Custom Range'].map(o => <option key={o}>{o}</option>)}
        </select>
        {['All Vehicles', 'All Drivers', 'All Regions', 'All Types'].map(ph => (
          <div key={ph} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder={ph} 
              className="pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] text-xs focus:bg-white focus:outline-none w-28 transition-all font-semibold text-[#4B5563]" 
            />
          </div>
        ))}
        <button 
          onClick={() => onShowToast('Analytics filters applied.')} 
          className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cursor-pointer shadow-sm transition-all"
        >
          Apply
        </button>
        <button 
          onClick={() => onShowToast('Filters reset.')} 
          className="px-2 py-1 text-xs font-bold text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* ── KPI Ribbon ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {kpis.map((k) => (
          <KpiTile
            key={k.id}
            icon={k.icon}
            label={k.label}
            value={k.value}
            sublabel={k.change}
            spark={k.spark}
            color={k.color}
            tint={k.color === '#2563EB' ? '#EFF4FF' : k.color === '#22C55E' ? '#ECFDF5' : k.color === '#EF4444' ? '#FEF2F2' : '#FFFBEB'}
          />
        ))}
      </div>

      {/* ── Executive Summary Hero Card ── */}
      <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm p-6 grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="md:col-span-1 flex flex-col items-center justify-center border-r border-[#F3F4F6] pr-6 text-center">
          <div className="relative w-28 h-28 mb-2 flex items-center justify-center">
            <Ring value={74} size={96} stroke={6} color="#2563EB" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#0A0A0A] leading-none">74</span>
              <span className="text-[9px] font-bold text-[#9CA3AF] uppercase mt-1">Score</span>
            </div>
          </div>
          <span className="text-[10px] font-black text-[#4B5563] uppercase tracking-wide">Fleet Performance</span>
        </div>

        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Fleet Health', value: '92%', sub: 'Excellent condition', color: '#059669' },
            { label: 'Profit Margin', value: '28.4%', sub: '+3.2% vs last qtr', color: '#2563EB' },
            { label: 'Active Fleet', value: '9 / 12', sub: '3 in maintenance', color: '#D97706' },
            { label: 'Vehicle Availability', value: '75%', sub: 'Ready for dispatch', color: '#2563EB' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#F9FAFB] border border-[#E5E7EB] p-4 rounded-[12px] space-y-1 cc-shadow-sm">
              <span className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider block">{stat.label}</span>
              <h4 className="text-xl font-black tracking-tight" style={{ color: stat.color }}>{stat.value}</h4>
              <p className="text-[10px] font-semibold text-[#6B7280] leading-snug">{stat.sub}</p>
            </div>
          ))}
          <div className="md:col-span-4 pt-3 border-t border-[#F3F4F6]">
            <p className="text-xs font-semibold text-[#4B5563] leading-relaxed">
              <span className="font-black text-[#0A0A0A]">Executive Summary:</span> Fleet operations this month show strong performance with a 74/100 fleet score. Utilization improved 11%, fuel efficiency reached 7.2 mpg — above the 6.8 mpg fleet benchmark. Operational costs decreased 3.1% following preventive maintenance optimisations. Three vehicles are currently in servicing with an estimated return within 48 hours. Revenue is tracking at $128,400, yielding a 28.4% profit margin.
            </p>
          </div>
        </div>
      </div>

      {/* ── Analytics Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Fleet Utilization Area Chart */}
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Fleet Utilization Trend</h3>
              <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Weekly vehicle deployment rate</p>
            </div>
            <span className="text-xs font-black text-primary">74%</span>
          </div>
          <AreaChart data={utilizationData} labels={utilizationLabels} color="#2563EB" />
        </div>

        {/* Fuel Efficiency Line */}
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Fuel Efficiency (mpg)</h3>
              <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Daily average across fleet</p>
            </div>
            <span className="text-xs font-black text-[#059669]">7.2 mpg</span>
          </div>
          <AreaChart data={fuelTrendData} labels={utilizationLabels} color="#059669" />
        </div>

        {/* Expense Donut */}
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Expense Distribution</h3>
            <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Breakdown by expense category</p>
          </div>
          <div className="flex items-center space-x-5 pt-1">
            <DonutChart segments={donutSegments} />
            <div className="space-y-2 flex-1">
              {donutSegments.map(s => (
                <div key={s.label} className="flex items-center justify-between text-[10.5px] font-semibold text-[#4B5563]">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-[#9CA3AF]">{s.label}</span>
                  </div>
                  <span className="font-mono font-bold text-[#0A0A0A]">${(s.value / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Cost Breakdown Bar */}
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Operational Cost Breakdown</h3>
            <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">By expense category this month</p>
          </div>
          <div className="pt-2">
            <BarChart data={costBreakdownData} labels={costBreakdownLabels} colors={costBreakdownColors} />
          </div>
        </div>

        {/* Trip Status Bar */}
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Trip Completion Analysis</h3>
            <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Status distribution this period</p>
          </div>
          <div className="pt-2">
            <BarChart data={tripStatusData} labels={tripStatusLabels} colors={tripStatusColors} />
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
          <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight border-b border-[#F3F4F6] pb-2 flex items-center">
            <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Business Intelligence
          </h3>
          <div className="space-y-2.5 overflow-y-auto max-h-52">
            {insights.map((ins, i) => (
              <div key={i} className={`p-3 border rounded-[12px] flex items-start space-x-2 text-[10.5px] font-semibold leading-relaxed ${ins.type === 'warn' ? 'bg-[#FFFBEB] border-[#FDE8B0] text-[#D97706]' : 'bg-[#EFF4FF] border-[#DBE6FF] text-[#4B5563]'}`}>
                {ins.type === 'warn'
                  ? <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                  : <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                }
                <span>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Fleet Leaderboards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Best Performing Vehicles */}
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
          <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight border-b border-[#F3F4F6] pb-2">
            Top Performing Vehicles
          </h3>
          <div className="space-y-4">
            {vehicleMatrix.slice(0, 3).map((v, idx) => (
              <div key={v.reg} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-sm font-black text-[#9CA3AF] w-5">#{idx + 1}</span>
                    <div className="w-7 h-7 rounded-[8px] bg-[#EFF4FF] flex items-center justify-center shrink-0 border border-[#DBE6FF]">
                      <Truck className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-[11px] text-[#4B5563] block leading-none">{v.name}</span>
                      <span className="font-mono text-[9px] text-[#9CA3AF]">{v.reg}</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-primary">{v.roi}% ROI</span>
                </div>
                <HorizontalBar label="ROI Score" value={v.roi} max={80} color="#2563EB" suffix="%" />
              </div>
            ))}
          </div>
        </div>

        {/* Best Drivers */}
        <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
          <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight border-b border-[#F3F4F6] pb-2">
            Top Performing Drivers
          </h3>
          <div className="space-y-4">
            {driverMatrix.slice(0, 3).map((d, idx) => (
              <div key={d.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-sm font-black text-[#9CA3AF] w-5">#{idx + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-[#EFF4FF] flex items-center justify-center shrink-0 border border-[#DBE6FF]">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-[11px] text-[#4B5563] block leading-none">{d.name}</span>
                      <span className="text-[9px] text-[#9CA3AF]">{d.trips} trips · {d.onTime}% on-time</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#059669]">{d.safety}%</span>
                </div>
                <HorizontalBar label="Safety Score" value={d.safety} max={100} color="#059669" suffix="%" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex justify-start">
        <Segmented
          value={activeTab}
          onChange={(v) => setActiveTab(v as any)}
          options={[
            { id: 'overview', label: <span className="flex items-center gap-1.5"><BarChart2 className="w-4 h-4" /> Overview</span> },
            { id: 'vehicles', label: <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Vehicle Matrix</span> },
            { id: 'drivers', label: <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Driver Matrix</span> },
            { id: 'costs', label: <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Cost Analytics</span> }
          ]}
        />
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Monthly Performance Timeline */}
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
              <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight border-b border-[#F3F4F6] pb-2">Monthly Performance Timeline</h3>
              <div className="relative pl-5 space-y-5 border-l-2 border-primary/10 max-w-2xl text-left">
                {[
                  { month: 'February 2026', fleet: 8, revenue: '$98,400', fuel: '$14,200', note: 'Vehicle TRK-302 acquired.' },
                  { month: 'March 2026', fleet: 9, revenue: '$104,800', fuel: '$15,100', note: 'Maintenance spike — brake inspections fleet-wide.' },
                  { month: 'April 2026', fleet: 10, revenue: '$112,200', fuel: '$15,800', note: 'New route CHI → ATL added.' },
                  { month: 'May 2026', fleet: 10, revenue: '$119,600', fuel: '$16,200', note: 'Fuel efficiency optimization program launched.' },
                  { month: 'June 2026', fleet: 11, revenue: '$124,100', fuel: '$15,600', note: 'TRK-201 brake overhaul completed.' },
                  { month: 'July 2026', fleet: 12, revenue: '$128,400', fuel: '$13,700', note: 'Current period — strong performance trending.' },
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[26px] top-1.5 w-3 h-3 bg-primary border-2 border-white rounded-full shadow-sm" />
                    <div className="flex flex-wrap gap-4 items-start">
                      <div>
                        <span className="text-[11px] font-black text-[#0A0A0A] block">{item.month}</span>
                        <p className="text-[10px] font-semibold text-[#6B7280] mt-1 leading-relaxed">{item.note}</p>
                      </div>
                      <div className="flex space-x-4 text-[10px] font-bold text-[#6B7280] ml-auto">
                        <span>Revenue: <span className="text-[#059669] font-black">{item.revenue}</span></span>
                        <span>Fuel: <span className="font-black text-[#0A0A0A]">{item.fuel}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Center */}
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
              <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight border-b border-[#F3F4F6] pb-2 flex items-center">
                <FileText className="w-4 h-4 text-primary mr-1.5" /> Export & Distribution Center
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Full CSV Export', sub: 'All fleet data, trips, fuel, expenses', action: 'Export CSV' },
                  { label: 'Executive PDF Report', sub: 'Charts, KPIs, and executive summary', action: 'Export PDF' },
                  { label: 'Excel Workbook', sub: 'Multi-sheet workbook with raw data', action: 'Export Excel' },
                  { label: 'Email Report', sub: 'Send to stakeholders automatically', action: 'Email Report' },
                  { label: 'Schedule Weekly', sub: 'Auto-generate every Monday at 8AM', action: 'Schedule' },
                  { label: 'Share Dashboard', sub: 'Generate shareable live link', action: 'Share Link' },
                ].map(card => (
                  <button
                    key={card.label}
                    onClick={() => handleExport(card.action)}
                    className="p-4 border border-[#E5E7EB] hover:border-primary/40 rounded-[12px] text-left space-y-1 transition-all hover:shadow-sm cursor-pointer group bg-white"
                  >
                    <span className="text-[11px] font-black text-[#4B5563] group-hover:text-primary transition-colors block">{card.label}</span>
                    <p className="text-[9.5px] text-[#9CA3AF] font-semibold leading-relaxed">{card.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VEHICLE MATRIX */}
        {activeTab === 'vehicles' && (
          <motion.div key="vehicles" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden text-left">
              <div className="p-4.5 border-b border-[#E5E7EB]">
                <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Vehicle Performance Matrix</h3>
                <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">ROI, fuel efficiency, and operational cost per vehicle</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                      {['Vehicle', 'Distance (mi)', 'Fuel Used (L)', 'Efficiency', 'Maint. Cost', 'Ops Cost', 'Revenue', 'ROI', 'Status'].map(h => (
                        <th key={h} className="p-3.5 first:pl-5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-[11px] font-semibold text-[#4B5563]">
                    {vehicleMatrix.map(v => (
                      <tr key={v.reg} className="hover:bg-[#F9FAFB]/50 transition-colors cursor-pointer">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-[8px] bg-[#EFF4FF] flex items-center justify-center shrink-0 border border-[#DBE6FF]">
                              <Truck className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                              <span className="font-bold text-[#0A0A0A] block leading-none">{v.name}</span>
                              <span className="font-mono text-[9px] text-[#9CA3AF]">{v.reg}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono">{v.distance.toLocaleString()}</td>
                        <td className="p-3.5 font-mono">{v.fuel.toLocaleString()}</td>
                        <td className="p-3.5 font-mono font-bold text-[#059669]">{v.efficiency} mpg</td>
                        <td className="p-3.5 font-mono">${v.maintCost.toLocaleString()}</td>
                        <td className="p-3.5 font-mono">${v.opsCost.toLocaleString()}</td>
                        <td className="p-3.5 font-mono font-bold text-[#0A0A0A]">${v.revenue.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className={`font-black ${v.roi >= 58 ? 'text-[#059669]' : v.roi >= 50 ? 'text-primary' : 'text-[#D97706]'}`}>{v.roi}%</span>
                        </td>
                        <td className="p-3.5">
                          <StatusPill status={v.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* DRIVER MATRIX */}
        {activeTab === 'drivers' && (
          <motion.div key="drivers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden text-left">
              <div className="p-4.5 border-b border-[#E5E7EB]">
                <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Driver Performance Matrix</h3>
                <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Safety, efficiency, and operational metrics per driver</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                      {['Driver', 'Trips', 'Distance (mi)', 'Safety Score', 'Efficiency', 'Incidents', 'On-Time %', 'Performance'].map(h => (
                        <th key={h} className="p-3.5 first:pl-5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-[11px] font-semibold text-[#4B5563]">
                    {driverMatrix.map(d => (
                      <tr key={d.name} className="hover:bg-[#F9FAFB]/50 transition-colors cursor-pointer">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#EFF4FF] flex items-center justify-center shrink-0 border border-[#DBE6FF]">
                              <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="font-bold text-[#0A0A0A]">{d.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold">{d.trips}</td>
                        <td className="p-3.5 font-mono">{d.distance.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className={`font-black ${d.safety >= 95 ? 'text-[#059669]' : d.safety >= 90 ? 'text-primary' : 'text-[#D97706]'}`}>{d.safety}%</span>
                        </td>
                        <td className="p-3.5 font-mono text-[#059669] font-bold">{d.efficiency} mpg</td>
                        <td className="p-3.5">
                          <span className={`font-bold ${d.incidents === 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>{d.incidents}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold">{d.onTime}%</td>
                        <td className="p-3.5 w-32">
                          <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${d.onTime}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* COST ANALYTICS */}
        {activeTab === 'costs' && (
          <motion.div key="costs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { label: 'Fuel Cost', value: '$18,400', pct: 72, color: '#2563EB', sub: '72% of total ops cost' },
                { label: 'Maintenance', value: '$8,940', pct: 35, color: '#D97706', sub: '+13% vs last quarter' },
                { label: 'Tolls & Misc', value: '$3,520', pct: 14, color: '#6B7280', sub: 'Tolls, parking, other' },
              ].map(c => (
                <div key={c.label} className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-3">
                  <span className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider block">{c.label}</span>
                  <h3 className="text-2xl font-black" style={{ color: c.color }}>{c.value}</h3>
                  <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-[#6B7280]">{c.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
                <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight border-b border-[#F3F4F6] pb-2">6-Month Cost Trend</h3>
                <AreaChart data={[38200, 39800, 42100, 44500, 45100, 46200]} labels={['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']} color="#2563EB" height={100} />
              </div>
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
                <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight border-b border-[#F3F4F6] pb-2">Cost Efficiency Rankings</h3>
                <div className="space-y-3 pt-1">
                  {vehicleMatrix.map(v => (
                    <HorizontalBar
                      key={v.reg}
                      label={`${v.name} (${v.reg})`}
                      value={v.roi}
                      max={80}
                      color={v.roi >= 58 ? '#059669' : v.roi >= 50 ? '#2563EB' : '#D97706'}
                      suffix="% ROI"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </Reveal>
  );
};
