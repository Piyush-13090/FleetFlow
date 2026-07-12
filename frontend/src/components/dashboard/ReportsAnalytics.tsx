import React, { useState, useEffect } from 'react';
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
  TrendingDown,
  BarChart2,
  FileText,
  Share2,
  Shield,
  Activity,
  MapPin
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiData {
  id: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  spark: number[];
  color: string;
  icon: React.ElementType;
}

interface ReportsAnalyticsProps {
  onShowToast: (msg: string) => void;
}

// ─── Pure SVG Chart Components ────────────────────────────────────────────────

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const w = 72; const h = 22;
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - min) / range) * (h - 6)}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible select-none">
      <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

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

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const handleExport = (type: string) => {
    setShowExportMenu(false);
    onShowToast(`Generating ${type} report — download will begin shortly.`);
  };

  // ── Static Analytics Data ──

  const kpis: KpiData[] = [
    { id: 'utilization', label: 'Fleet Utilization', value: '74%', change: '+11% vs last month', up: true, spark: [55, 60, 62, 68, 72, 74], color: '#2563EB', icon: Activity },
    { id: 'revenue', label: 'Total Revenue', value: '$128,400', change: '+8.2%', up: true, spark: [95000, 102000, 109000, 115000, 121000, 128400], color: '#22C55E', icon: DollarSign },
    { id: 'ops_cost', label: 'Operational Cost', value: '$46,200', change: '-3.1%', up: true, spark: [51000, 49000, 48500, 47800, 46500, 46200], color: '#2563EB', icon: BarChart2 },
    { id: 'fuel_eff', label: 'Fuel Efficiency', value: '7.2 mpg', change: '+4% vs fleet avg', up: true, spark: [6.4, 6.6, 6.8, 7.0, 7.1, 7.2], color: '#22C55E', icon: Fuel },
    { id: 'distance', label: 'Total Distance', value: '98,640 mi', change: '+12% vs last month', up: true, spark: [72000, 78000, 82000, 88000, 93000, 98640], color: '#3B82F6', icon: MapPin },
    { id: 'fuel_used', label: 'Fuel Consumed', value: '13,700 L', change: '+2.4%', up: false, spark: [11200, 11800, 12400, 12900, 13300, 13700], color: '#F59E0B', icon: Fuel },
    { id: 'maint_cost', label: 'Maintenance Cost', value: '$8,940', change: '+13% vs last qtr', up: false, spark: [6200, 7100, 7400, 8000, 8500, 8940], color: '#EF4444', icon: Shield },
    { id: 'roi', label: 'Fleet ROI', value: '64.2%', change: '+5.8% net improvement', up: true, spark: [52, 55, 58, 60, 62, 64.2], color: '#22C55E', icon: TrendingUp },
  ];

  const utilizationData = [58, 64, 70, 68, 74, 72, 74];
  const utilizationLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const fuelTrendData = [6.4, 6.7, 6.5, 7.0, 6.9, 7.2, 7.1];
  const costBreakdownData = [18400, 8940, 3200, 1800, 920, 1200];
  const costBreakdownLabels = ['Fuel', 'Maint.', 'Repairs', 'Tolls', 'Parking', 'Other'];
  const costBreakdownColors = ['#2563EB', '#F59E0B', '#EF4444', '#3B82F6', '#64748B', '#94A3B8'];

  const tripStatusData = [42, 8, 5, 3, 7];
  const tripStatusLabels = ['Done', 'Cancelled', 'Delayed', 'Draft', 'Active'];
  const tripStatusColors = ['#22C55E', '#EF4444', '#F59E0B', '#94A3B8', '#2563EB'];

  const donutSegments = [
    { label: 'Fuel', value: 18400, color: '#2563EB' },
    { label: 'Maintenance', value: 8940, color: '#3B82F6' },
    { label: 'Repairs', value: 3200, color: '#DBEAFE' },
    { label: 'Parking', value: 920, color: '#94A3B8' },
    { label: 'Tolls', value: 1800, color: '#64748B' },
  ];

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
    <div className="space-y-6 select-none relative pb-16 text-left">

      {/* ── Sticky Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-gray/50 bg-white/80 backdrop-blur sticky top-16 z-20">
        <div>
          <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 font-medium mt-1.5 leading-none">
            Monitor operational performance, fleet utilization, fuel efficiency, costs, and profitability with real-time analytics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto relative">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(p => !p)}
              className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" /><span>Export Report</span>
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute top-full right-0 mt-2 bg-white border border-border-gray rounded-2xl shadow-xl z-30 w-48 py-2 overflow-hidden"
                >
                  {['Export CSV', 'Export PDF', 'Export Excel', 'Email Report'].map(opt => (
                    <button key={opt} onClick={() => handleExport(opt)} className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left cursor-pointer transition-colors">
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => onShowToast('Dashboard link copied to clipboard.')} className="px-3 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5">
            <Share2 className="w-3.5 h-3.5" /><span>Share</span>
          </button>
          <button onClick={() => onShowToast('Refreshing analytics data...')} className="p-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Global Filters ── */}
      <div className="sticky top-[80px] z-10 bg-white border border-border-gray p-4 rounded-2xl flex flex-wrap items-center gap-3.5 shadow-sm">
        <div className="flex items-center space-x-2 border-r border-border-gray pr-3.5 shrink-0">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-slate-800">Filters</span>
        </div>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
          {['This Week', 'This Month', 'This Quarter', 'This Year', 'Custom Range'].map(o => <option key={o}>{o}</option>)}
        </select>
        {['All Vehicles', 'All Drivers', 'All Regions', 'All Types'].map(ph => (
          <div key={ph} className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder={ph} className="pl-8 pr-3 py-2 bg-slate-50 border border-border-gray rounded-xl text-xs focus:bg-white focus:outline-none w-28 transition-all" />
          </div>
        ))}
        <button onClick={() => onShowToast('Analytics filters applied.')} className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl cursor-pointer">Apply</button>
        <button onClick={() => onShowToast('Filters reset.')} className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">Reset</button>
      </div>

      {/* ── KPI Ribbon ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {kpis.map((k, idx) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.055 }}
              className="p-4 bg-white border border-border-gray rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                {k.up
                  ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                  : <TrendingDown className="w-3 h-3 text-rose-400" />
                }
              </div>
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block leading-none">{k.label}</span>
              <h3 className="text-base font-black text-text-dark tracking-tight leading-tight mt-1.5">{k.value}</h3>
              <div className="mt-2 flex justify-between items-end">
                <span className="text-[8.5px] font-bold text-slate-400 leading-none pr-1">{k.change}</span>
                <div className="w-10 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Sparkline data={k.spark} color={k.color} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Executive Summary Hero Card ── */}
      <div className="bg-white border border-border-gray rounded-2xl shadow-sm p-6 grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="md:col-span-1 flex flex-col items-center justify-center border-r border-slate-100 pr-6 text-center">
          <div className="relative w-28 h-28 mb-2">
            <svg className="w-full h-full -rotate-90">
              <circle cx="56" cy="56" r="48" className="stroke-slate-100" strokeWidth="7" fill="transparent" />
              <motion.circle
                cx="56" cy="56" r="48"
                className="stroke-primary"
                strokeWidth="7" fill="transparent"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 48}
                initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 48 - (0.742 * 2 * Math.PI * 48) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-text-dark leading-none">74</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Score</span>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-wide">Fleet Performance</span>
        </div>

        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Fleet Health', value: '92%', sub: 'Excellent condition', color: '#22C55E' },
            { label: 'Profit Margin', value: '28.4%', sub: '+3.2% vs last qtr', color: '#2563EB' },
            { label: 'Active Fleet', value: '9 / 12', sub: '3 in maintenance', color: '#F59E0B' },
            { label: 'Vehicle Availability', value: '75%', sub: 'Ready for dispatch', color: '#2563EB' },
          ].map(stat => (
            <div key={stat.label} className="border border-border-gray/60 p-4 rounded-xl space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">{stat.label}</span>
              <h4 className="text-xl font-black tracking-tight" style={{ color: stat.color }}>{stat.value}</h4>
              <p className="text-[10px] font-semibold text-slate-400 leading-snug">{stat.sub}</p>
            </div>
          ))}
          <div className="md:col-span-4 pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              <span className="font-black text-text-dark">Executive Summary:</span> Fleet operations this month show strong performance with a 74/100 fleet score. Utilization improved 11%, fuel efficiency reached 7.2 mpg — above the 6.8 mpg fleet benchmark. Operational costs decreased 3.1% following preventive maintenance optimisations. Three vehicles are currently in servicing with an estimated return within 48 hours. Revenue is tracking at $128,400, yielding a 28.4% profit margin.
            </p>
          </div>
        </div>
      </div>

      {/* ── Analytics Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Fleet Utilization Area Chart */}
        <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Fleet Utilization Trend</h3>
              <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">Weekly vehicle deployment rate</p>
            </div>
            <span className="text-xs font-black text-primary">74%</span>
          </div>
          <AreaChart data={utilizationData} labels={utilizationLabels} color="#2563EB" />
        </div>

        {/* Fuel Efficiency Line */}
        <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Fuel Efficiency (mpg)</h3>
              <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">Daily average across fleet</p>
            </div>
            <span className="text-xs font-black text-emerald-600">7.2 mpg</span>
          </div>
          <AreaChart data={fuelTrendData} labels={utilizationLabels} color="#22C55E" />
        </div>

        {/* Expense Donut */}
        <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Expense Distribution</h3>
            <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">Breakdown by expense category</p>
          </div>
          <div className="flex items-center space-x-5 pt-1">
            <DonutChart segments={donutSegments} />
            <div className="space-y-2 flex-1">
              {donutSegments.map(s => (
                <div key={s.label} className="flex items-center justify-between text-[10.5px] font-semibold text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-400">{s.label}</span>
                  </div>
                  <span className="font-mono font-bold">${(s.value / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Cost Breakdown Bar */}
        <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Operational Cost Breakdown</h3>
            <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">By expense category this month</p>
          </div>
          <div className="pt-2">
            <BarChart data={costBreakdownData} labels={costBreakdownLabels} colors={costBreakdownColors} />
          </div>
        </div>

        {/* Trip Status Bar */}
        <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Trip Completion Analysis</h3>
            <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">Status distribution this period</p>
          </div>
          <div className="pt-2">
            <BarChart data={tripStatusData} labels={tripStatusLabels} colors={tripStatusColors} />
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2 flex items-center">
            <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Business Intelligence
          </h3>
          <div className="space-y-2.5 overflow-y-auto max-h-52">
            {insights.map((ins, i) => (
              <div key={i} className={`p-3 border rounded-xl flex items-start space-x-2 text-[10.5px] font-semibold leading-relaxed ${ins.type === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50/50 border-primary/20 text-slate-600'}`}>
                {ins.type === 'warn'
                  ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
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
        <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2">
            Top Performing Vehicles
          </h3>
          <div className="space-y-4">
            {vehicleMatrix.slice(0, 3).map((v, idx) => (
              <div key={v.reg} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-sm font-black text-slate-200 w-5">#{idx + 1}</span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Truck className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-[11px] text-slate-700 block leading-none">{v.name}</span>
                      <span className="font-mono text-[9px] text-slate-400">{v.reg}</span>
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
        <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2">
            Top Performing Drivers
          </h3>
          <div className="space-y-4">
            {driverMatrix.slice(0, 3).map((d, idx) => (
              <div key={d.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-sm font-black text-slate-200 w-5">#{idx + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-[11px] text-slate-700 block leading-none">{d.name}</span>
                      <span className="text-[9px] text-slate-400">{d.trips} trips · {d.onTime}% on-time</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600">{d.safety}%</span>
                </div>
                <HorizontalBar label="Safety Score" value={d.safety} max={100} color="#22C55E" suffix="%" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex space-x-1 border-b border-border-gray/50 pb-px">
        {([
          { id: 'overview', label: 'Overview', icon: BarChart2 },
          { id: 'vehicles', label: 'Vehicle Matrix', icon: Truck },
          { id: 'drivers', label: 'Driver Matrix', icon: User },
          { id: 'costs', label: 'Cost Analytics', icon: DollarSign },
        ] as const).map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 border-b-2 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer focus:outline-none ${active ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <Icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Monthly Expense Timeline */}
            <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2">Monthly Performance Timeline</h3>
              <div className="relative pl-5 space-y-5 border-l-2 border-primary/10 max-w-2xl">
                {[
                  { month: 'February 2026', fleet: 8, revenue: '$98,400', fuel: '$14,200', note: 'Vehicle TRK-302 acquired.' },
                  { month: 'March 2026', fleet: 9, revenue: '$104,800', fuel: '$15,100', note: 'Maintenance spike — brake inspections fleet-wide.' },
                  { month: 'April 2026', fleet: 10, revenue: '$112,200', fuel: '$15,800', note: 'New route CHI → ATL added.' },
                  { month: 'May 2026', fleet: 10, revenue: '$119,600', fuel: '$16,200', note: 'Fuel efficiency optimization program launched.' },
                  { month: 'June 2026', fleet: 11, revenue: '$124,100', fuel: '$15,600', note: 'TRK-201 brake overhaul completed.' },
                  { month: 'July 2026', fleet: 12, revenue: '$128,400', fuel: '$13,700', note: 'Current period — strong performance trending.' },
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
                    <div className="flex flex-wrap gap-4 items-start">
                      <div>
                        <span className="text-[11px] font-black text-slate-700 block">{item.month}</span>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-relaxed">{item.note}</p>
                      </div>
                      <div className="flex space-x-4 text-[10px] font-semibold text-slate-600 ml-auto">
                        <span className="text-slate-400">Revenue: <span className="text-emerald-600 font-bold">{item.revenue}</span></span>
                        <span className="text-slate-400">Fuel: <span className="font-bold">{item.fuel}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Center */}
            <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2 flex items-center">
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
                    className="p-4 border border-border-gray hover:border-primary/40 rounded-xl text-left space-y-1 transition-all hover:shadow-sm cursor-pointer group"
                  >
                    <span className="text-[11px] font-black text-slate-700 group-hover:text-primary transition-colors block">{card.label}</span>
                    <p className="text-[9.5px] text-slate-400 font-medium leading-relaxed">{card.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VEHICLE MATRIX */}
        {activeTab === 'vehicles' && (
          <motion.div key="vehicles" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border-gray/50">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Vehicle Performance Matrix</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">ROI, fuel efficiency, and operational cost per vehicle</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {['Vehicle', 'Distance (mi)', 'Fuel Used (L)', 'Efficiency', 'Maint. Cost', 'Ops Cost', 'Revenue', 'ROI', 'Status'].map(h => (
                        <th key={h} className="p-3.5 first:pl-5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-gray/50 text-[11px] font-semibold text-slate-700">
                    {vehicleMatrix.map(v => (
                      <tr key={v.reg} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <Truck className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-700 block leading-none">{v.name}</span>
                              <span className="font-mono text-[9px] text-slate-400">{v.reg}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono">{v.distance.toLocaleString()}</td>
                        <td className="p-3.5 font-mono">{v.fuel.toLocaleString()}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-600">{v.efficiency} mpg</td>
                        <td className="p-3.5 font-mono">${v.maintCost.toLocaleString()}</td>
                        <td className="p-3.5 font-mono">${v.opsCost.toLocaleString()}</td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">${v.revenue.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className={`font-black ${v.roi >= 58 ? 'text-emerald-600' : v.roi >= 50 ? 'text-primary' : 'text-amber-600'}`}>{v.roi}%</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${v.status === 'Active' ? 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {v.status}
                          </span>
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
            <div className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border-gray/50">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Driver Performance Matrix</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Safety, efficiency, and operational metrics per driver</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {['Driver', 'Trips', 'Distance (mi)', 'Safety Score', 'Efficiency', 'Incidents', 'On-Time %', 'Performance'].map(h => (
                        <th key={h} className="p-3.5 first:pl-5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-gray/50 text-[11px] font-semibold text-slate-700">
                    {driverMatrix.map(d => (
                      <tr key={d.name} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="font-bold text-slate-700">{d.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold">{d.trips}</td>
                        <td className="p-3.5 font-mono">{d.distance.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className={`font-black ${d.safety >= 95 ? 'text-emerald-600' : d.safety >= 90 ? 'text-primary' : 'text-amber-600'}`}>{d.safety}%</span>
                        </td>
                        <td className="p-3.5 font-mono text-emerald-600 font-bold">{d.efficiency} mpg</td>
                        <td className="p-3.5">
                          <span className={`font-bold ${d.incidents === 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{d.incidents}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold">{d.onTime}%</td>
                        <td className="p-3.5 w-32">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Fuel Cost', value: '$18,400', pct: 72, color: '#2563EB', sub: '72% of total ops cost' },
                { label: 'Maintenance', value: '$8,940', pct: 35, color: '#F59E0B', sub: '+13% vs last quarter' },
                { label: 'Tolls & Misc', value: '$3,520', pct: 14, color: '#64748B', sub: 'Tolls, parking, other' },
              ].map(c => (
                <div key={c.label} className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-3">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{c.label}</span>
                  <h3 className="text-2xl font-black" style={{ color: c.color }}>{c.value}</h3>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400">{c.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2">6-Month Cost Trend</h3>
                <AreaChart data={[38200, 39800, 42100, 44500, 45100, 46200]} labels={['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']} color="#2563EB" height={100} />
              </div>
              <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2">Cost Efficiency Rankings</h3>
                <div className="space-y-3 pt-1">
                  {vehicleMatrix.map(v => (
                    <HorizontalBar
                      key={v.reg}
                      label={`${v.name} (${v.reg})`}
                      value={v.roi}
                      max={80}
                      color={v.roi >= 58 ? '#22C55E' : v.roi >= 50 ? '#2563EB' : '#F59E0B'}
                      suffix="% ROI"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
