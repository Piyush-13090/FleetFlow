import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Download,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  AlertTriangle,
  Truck,
  Sparkles,
  Info,
  DollarSign,
  Fuel,
  X,
  TrendingUp,
  TrendingDown,
  FileText
} from 'lucide-react';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface FuelLog {
  id: string;
  vehicle: string;
  registrationNumber: string;
  driver: string;
  tripId: string;
  station: string;
  fuelType: 'Diesel' | 'Petrol' | 'CNG' | 'Electric';
  quantity: number;
  pricePerLiter: number;
  totalCost: number;
  odometer: number;
  date: string;
}

interface Expense {
  id: string;
  vehicle: string;
  tripId: string;
  category: 'Toll' | 'Parking' | 'Maintenance' | 'Repairs' | 'Miscellaneous' | 'Other';
  amount: number;
  date: string;
  recordedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  notes?: string;
}

interface FuelExpenseProps {
  onShowToast: (msg: string) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

const LineChart: React.FC<{ data: number[]; labels: string[]; color: string }> = ({ data, labels, color }) => {
  const w = 300; const h = 90;
  const max = Math.max(...data) || 1; const min = 0;
  const range = max - min;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * (w - 20) + 10},${h - 10 - ((v - min) / range) * (h - 20)}`).join(' ');
  const areaPath = `M ${pts.split(' ')[0]} L ${pts} L ${(data.length - 1) / (data.length - 1) * (w - 20) + 10},${h - 10} L 10,${h - 10} Z`;
  return (
    <svg width="100%" height={h + 20} viewBox={`0 0 ${w} ${h + 20}`} className="overflow-visible select-none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#lineGrad)" />
      <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * (w - 20) + 10} cy={h - 10 - ((v - min) / range) * (h - 20)} r="3" fill={color} />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={(i / (labels.length - 1)) * (w - 20) + 10} y={h + 14} textAnchor="middle" fill="#94A3B8" fontSize="7.5" fontWeight="600">{l}</text>
      ))}
    </svg>
  );
};

const DonutChart: React.FC<{ segments: { label: string; value: number; color: string }[] }> = ({ segments }) => {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 32; const cx = 44; const cy = 44;
  let startAngle = -90;
  const slices = segments.map(s => {
    const angle = (s.value / total) * 360;
    const start = startAngle;
    startAngle += angle;
    return { ...s, startAngle: start, angle };
  });
  const polarToCart = (angle: number, rad: number) => ({
    x: cx + rad * Math.cos((angle * Math.PI) / 180),
    y: cy + rad * Math.sin((angle * Math.PI) / 180)
  });
  return (
    <svg width="88" height="88" className="select-none shrink-0">
      {slices.map((s, i) => {
        if (s.angle <= 0) return null;
        const start = polarToCart(s.startAngle, r);
        const end = polarToCart(s.startAngle + s.angle, r);
        const largeArc = s.angle > 180 ? 1 : 0;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`}
            fill={s.color}
            className="hover:opacity-85 transition-opacity cursor-pointer"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={20} fill="white" />
    </svg>
  );
};

const getCategoryBadge = (cat: Expense['category']) => {
  const map: Record<string, string> = {
    'Toll': 'bg-blue-50 text-blue-600 border-blue-100',
    'Parking': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'Maintenance': 'bg-amber-50 text-amber-600 border-amber-100',
    'Repairs': 'bg-rose-50 text-rose-600 border-rose-100',
    'Miscellaneous': 'bg-slate-100 text-slate-500 border-slate-200',
    'Other': 'bg-slate-100 text-slate-400 border-slate-100'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[cat] || 'bg-slate-100 text-slate-400'}`}>
      {cat}
    </span>
  );
};

const getStatusBadge = (status: Expense['status']) => {
  if (status === 'Approved') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Approved</span>;
  if (status === 'Pending') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">Pending</span>;
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">Rejected</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const FuelExpenseManagement: React.FC<FuelExpenseProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses' | 'summary'>('fuel');
  const [isLoading, setIsLoading] = useState(false);

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Filters
  const [search, setSearch] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('All Vehicles');
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('All Statuses');

  // Add Fuel Modal
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fVehicle, setFVehicle] = useState('TRK-201');
  const [fDriver, setFDriver] = useState('');
  const [fTrip, setFTrip] = useState('');
  const [fStation, setFStation] = useState('');
  const [fFuelType, setFFuelType] = useState<FuelLog['fuelType']>('Diesel');
  const [fQty, setFQty] = useState('80');
  const [fPPL, setFPPL] = useState('3.60');
  const [fOdo, setFOdo] = useState('142500');
  const [fNotes, setFNotes] = useState('');

  // Add Expense Modal
  const [showExpModal, setShowExpModal] = useState(false);
  const [eVehicle, setEVehicle] = useState('TRK-201');
  const [eTrip, setETrip] = useState('');
  const [eCategory, setECategory] = useState<Expense['category']>('Toll');
  const [eAmount, setEAmount] = useState('45');
  const [eDate, setEDate] = useState('2026-07-12');
  const [eBy, setEBy] = useState('Fleet Manager');
  const [eNotes, setENotes] = useState('');

  const seedData = () => {
    setFuelLogs([
      { id: 'FL-001', vehicle: 'Freightliner Cascadia', registrationNumber: 'TRK-201', driver: 'James Carter', tripId: 'TR-501', station: "Love's Travel Stop #102", fuelType: 'Diesel', quantity: 85, pricePerLiter: 3.58, totalCost: 304.30, odometer: 142200, date: '2026-07-11' },
      { id: 'FL-002', vehicle: 'Ford Transit Cargo', registrationNumber: 'TRK-109', driver: 'Maria Torres', tripId: 'TR-498', station: 'Pilot Flying J Chicago', fuelType: 'Diesel', quantity: 60, pricePerLiter: 3.62, totalCost: 217.20, odometer: 89400, date: '2026-07-10' },
      { id: 'FL-003', vehicle: 'Peterbilt 579', registrationNumber: 'TRK-305', driver: 'Robert Blake', tripId: 'TR-490', station: 'Flying J Truck Stop', fuelType: 'Diesel', quantity: 100, pricePerLiter: 3.55, totalCost: 355.00, odometer: 210100, date: '2026-07-09' },
    ]);
    setExpenses([
      { id: 'EX-001', vehicle: 'TRK-201', tripId: 'TR-501', category: 'Toll', amount: 45.00, date: '2026-07-11', recordedBy: 'James Carter', status: 'Approved', notes: 'Midwest turnpike pass' },
      { id: 'EX-002', vehicle: 'TRK-109', tripId: 'TR-498', category: 'Parking', amount: 22.00, date: '2026-07-10', recordedBy: 'Maria Torres', status: 'Pending', notes: 'Overnight dock parking' },
      { id: 'EX-003', vehicle: 'TRK-305', tripId: 'TR-490', category: 'Maintenance', amount: 320.00, date: '2026-07-09', recordedBy: 'Fleet Manager', status: 'Approved', notes: 'Air filter + belt replacement' },
      { id: 'EX-004', vehicle: 'TRK-201', tripId: 'TR-488', category: 'Repairs', amount: 780.00, date: '2026-07-08', recordedBy: 'Fleet Manager', status: 'Approved', notes: 'Emergency brake line repair' },
    ]);
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => { seedData(); setIsLoading(false); }, 600);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    onShowToast('Syncing real-time financial ledger data...');
    setIsLoading(true);
    setTimeout(() => { seedData(); setIsLoading(false); }, 700);
  };

  const handleAddFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(fQty); const ppl = parseFloat(fPPL);
    const newLog: FuelLog = {
      id: `FL-${String(fuelLogs.length + 10).padStart(3, '0')}`,
      vehicle: fVehicle, registrationNumber: fVehicle,
      driver: fDriver, tripId: fTrip, station: fStation,
      fuelType: fFuelType, quantity: qty, pricePerLiter: ppl,
      totalCost: parseFloat((qty * ppl).toFixed(2)),
      odometer: parseInt(fOdo), date: new Date().toISOString().slice(0, 10)
    };
    setFuelLogs(prev => [newLog, ...prev]);
    setShowFuelModal(false);
    onShowToast(`Fuel log ${newLog.id} recorded successfully.`);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: Expense = {
      id: `EX-${String(expenses.length + 10).padStart(3, '0')}`,
      vehicle: eVehicle, tripId: eTrip, category: eCategory,
      amount: parseFloat(eAmount), date: eDate,
      recordedBy: eBy, status: 'Pending', notes: eNotes
    };
    setExpenses(prev => [newExp, ...prev]);
    setShowExpModal(false);
    onShowToast(`Expense ${newExp.id} submitted for approval.`);
  };

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetFilters = () => {
    setSearch(''); setFilterVehicle('All Vehicles');
    setFilterType('All Types'); setFilterStatus('All Statuses');
    onShowToast('Filters cleared.');
  };

  // KPI Computations
  const totalFuelCost = fuelLogs.reduce((a, l) => a + l.totalCost, 0);
  const totalFuelQty = fuelLogs.reduce((a, l) => a + l.quantity, 0);
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const maintCost = expenses.filter(e => e.category === 'Maintenance' || e.category === 'Repairs').reduce((a, e) => a + e.amount, 0);
  const otherCost = expenses.filter(e => e.category !== 'Maintenance' && e.category !== 'Repairs').reduce((a, e) => a + e.amount, 0);
  const opsCost = totalFuelCost + totalExpenses;

  // Filtered data
  const filteredFuel = fuelLogs.filter(l =>
    (search === '' || l.id.toLowerCase().includes(search.toLowerCase()) || l.vehicle.toLowerCase().includes(search.toLowerCase()) || l.driver.toLowerCase().includes(search.toLowerCase())) &&
    (filterVehicle === 'All Vehicles' || l.registrationNumber === filterVehicle) &&
    (filterType === 'All Types' || l.fuelType === filterType)
  );

  const filteredExp = expenses.filter(e =>
    (search === '' || e.id.toLowerCase().includes(search.toLowerCase()) || e.vehicle.toLowerCase().includes(search.toLowerCase())) &&
    (filterVehicle === 'All Vehicles' || e.vehicle === filterVehicle) &&
    (filterType === 'All Types' || e.category === filterType) &&
    (filterStatus === 'All Statuses' || e.status === filterStatus)
  );

  const kpis = [
    { id: 'fuel_cost', label: 'Total Fuel Cost', val: `$${totalFuelCost.toFixed(0)}`, trend: '+3% vs last month', up: false, spark: [280, 310, 290, 340, 320, 304], color: '#2563EB' },
    { id: 'fuel_qty', label: 'Fuel Consumed (L)', val: `${totalFuelQty} L`, trend: '245 L last month', up: true, spark: [200, 220, 210, 245, 235, 245], color: '#3B82F6' },
    { id: 'ops_cost', label: 'Total Ops Cost', val: `$${opsCost.toFixed(0)}`, trend: 'All expenses combined', up: false, spark: [900, 980, 870, 1100, 1040, opsCost / 10], color: '#2563EB' },
    { id: 'maint_cost', label: 'Maintenance Cost', val: `$${maintCost.toFixed(0)}`, trend: '-5% vs last month', up: true, spark: [400, 450, 380, 420, 380, maintCost / 5], color: '#22C55E' },
    { id: 'other_exp', label: 'Other Expenses', val: `$${otherCost.toFixed(0)}`, trend: 'Tolls, Parking, Misc', up: true, spark: [40, 60, 55, 67, 50, otherCost], color: '#F59E0B' },
    { id: 'cost_km', label: 'Avg Cost / Mile', val: '$1.24', trend: 'Fleet benchmark', up: true, spark: [1.1, 1.2, 1.15, 1.28, 1.22, 1.24], color: '#22C55E' }
  ];

  const expenseDonutSegments = [
    { label: 'Fuel', value: totalFuelCost, color: '#2563EB' },
    { label: 'Maintenance', value: maintCost, color: '#3B82F6' },
    { label: 'Tolls', value: expenses.filter(e => e.category === 'Toll').reduce((a, e) => a + e.amount, 0), color: '#DBEAFE' },
    { label: 'Parking', value: expenses.filter(e => e.category === 'Parking').reduce((a, e) => a + e.amount, 0), color: '#94A3B8' },
    { label: 'Repairs', value: expenses.filter(e => e.category === 'Repairs').reduce((a, e) => a + e.amount, 0), color: '#64748B' },
  ];

  const lineLabels = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const fuelTrendData = [280, 310, 265, 340, 310, Math.round(totalFuelCost)];

  return (
    <div className="space-y-6 select-none relative pb-16">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-gray/50 text-left">
        <div>
          <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">Fuel & Expense Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1.5 leading-none">
            Track fuel consumption, operational expenses, and fleet running costs with real-time financial insights.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button onClick={() => setShowFuelModal(true)} className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-1.5">
            <Fuel className="w-4 h-4" /><span>Add Fuel Log</span>
          </button>
          <button onClick={() => setShowExpModal(true)} className="px-4 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5">
            <Plus className="w-4 h-4" /><span>Add Expense</span>
          </button>
          <button onClick={() => onShowToast('Exporting financial records as CSV...')} className="px-3 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5">
            <Download className="w-3.5 h-3.5" /><span>Export CSV</span>
          </button>
          <button onClick={handleRefresh} className="p-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-500 rounded-xl transition-all cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── KPI Ribbon ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map(k => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: kpis.indexOf(k) * 0.06 }}
            className="p-4 bg-white border border-border-gray rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-left group cursor-pointer"
          >
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider leading-none block">{k.label}</span>
            <h3 className="text-xl font-black text-text-dark tracking-tight leading-none mt-2">{k.val}</h3>
            <div className="mt-4 flex justify-between items-end">
              <div className="flex items-center space-x-1">
                {k.up
                  ? <TrendingDown className="w-3 h-3 text-emerald-500" />
                  : <TrendingUp className="w-3 h-3 text-rose-400" />
                }
                <span className="text-[9px] font-bold text-slate-400 leading-none">{k.trend}</span>
              </div>
              <div className="w-12 shrink-0 opacity-75 group-hover:opacity-100 transition-opacity">
                <Sparkline data={k.spark} color={k.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Sticky Filters ── */}
      <div className="sticky top-16 z-20 bg-white border border-border-gray p-4 rounded-2xl flex flex-wrap items-center gap-3.5 shadow-sm">
        <div className="flex items-center space-x-2 border-r border-border-gray pr-3.5 py-1 shrink-0">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-slate-800">Filters</span>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search logs, vehicle, driver..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border-gray rounded-xl text-xs focus:bg-white focus:outline-none transition-all"
          />
        </div>
        <select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
          <option value="All Vehicles">All Vehicles</option>
          <option value="TRK-201">TRK-201</option>
          <option value="TRK-109">TRK-109</option>
          <option value="TRK-305">TRK-305</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
          <option value="All Types">All Types</option>
          {activeTab === 'fuel'
            ? ['Diesel', 'Petrol', 'CNG', 'Electric'].map(t => <option key={t}>{t}</option>)
            : ['Toll', 'Parking', 'Maintenance', 'Repairs', 'Miscellaneous', 'Other'].map(t => <option key={t}>{t}</option>)
          }
        </select>
        {activeTab === 'expenses' && (
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
            <option value="All Statuses">All Statuses</option>
            <option>Approved</option><option>Pending</option><option>Rejected</option>
          </select>
        )}
        {(search || filterVehicle !== 'All Vehicles' || filterType !== 'All Types' || filterStatus !== 'All Statuses') && (
          <button onClick={handleResetFilters} className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">Reset</button>
        )}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex space-x-1 border-b border-border-gray/50 pb-px">
        {([
          { id: 'fuel', label: 'Fuel Logs', icon: Fuel },
          { id: 'expenses', label: 'Expense Records', icon: DollarSign },
          { id: 'summary', label: 'Operational Summary', icon: TrendingUp }
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

        {/* FUEL LOGS TAB */}
        {activeTab === 'fuel' && (
          <motion.div key="fuel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden text-left">
              <div className="p-4 border-b border-border-gray/50">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Refueling Activity Ledger</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{filteredFuel.length} records found</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {['Fuel Log ID', 'Vehicle', 'Driver', 'Trip', 'Station', 'Type', 'Qty (L)', 'Price/L', 'Total Cost', 'Odometer', 'Date'].map(h => (
                        <th key={h} className="p-3.5 first:pl-5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-gray/50 text-[11px] font-semibold text-slate-700">
                    {filteredFuel.length === 0 ? (
                      <tr><td colSpan={11} className="text-center py-16 text-slate-400 font-medium text-xs">No fuel logs match your filters.</td></tr>
                    ) : filteredFuel.map(log => (
                      <React.Fragment key={log.id}>
                        <tr
                          onClick={e => toggleRow(log.id, e)}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center space-x-2">
                              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expandedRows[log.id] ? 'rotate-90' : ''}`} />
                              <span className="font-bold font-mono text-slate-600">{log.id}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center space-x-1.5">
                              <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="max-w-[110px] truncate">{log.vehicle}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-500">{log.driver}</td>
                          <td className="p-3.5 font-mono text-slate-500">{log.tripId || '—'}</td>
                          <td className="p-3.5 text-slate-500 max-w-[120px] truncate">{log.station}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-50 text-blue-600 border border-blue-100">{log.fuelType}</span>
                          </td>
                          <td className="p-3.5 font-mono">{log.quantity} L</td>
                          <td className="p-3.5 font-mono">${log.pricePerLiter}</td>
                          <td className="p-3.5 font-mono font-bold text-slate-900">${log.totalCost.toFixed(2)}</td>
                          <td className="p-3.5 font-mono text-slate-500">{log.odometer.toLocaleString()}</td>
                          <td className="p-3.5 text-slate-400 font-mono">{log.date}</td>
                        </tr>
                        {expandedRows[log.id] && (
                          <tr>
                            <td colSpan={11} className="bg-slate-50 border-t border-b border-border-gray/60 p-5">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-2 shadow-sm">
                                  <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Efficiency Metrics</h4>
                                  <div className="text-[11px] font-semibold text-slate-600 space-y-1">
                                    <div className="flex justify-between"><span className="text-slate-400">Price Per Liter</span><span>${log.pricePerLiter}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Total Litres</span><span>{log.quantity} L</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Total Cost</span><span className="font-black text-primary">${log.totalCost.toFixed(2)}</span></div>
                                  </div>
                                </div>
                                <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-2 shadow-sm">
                                  <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Trip Assignment</h4>
                                  <div className="text-[11px] font-semibold text-slate-600 space-y-1">
                                    <div className="flex justify-between"><span className="text-slate-400">Trip ID</span><span>{log.tripId || 'Unassigned'}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Driver</span><span>{log.driver}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Odometer</span><span>{log.odometer.toLocaleString()} mi</span></div>
                                  </div>
                                </div>
                                <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-2 shadow-sm">
                                  <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Station Info</h4>
                                  <div className="text-[11px] font-semibold text-slate-600 space-y-1">
                                    <div className="flex justify-between"><span className="text-slate-400">Station</span><span className="text-right max-w-[100px] truncate">{log.station}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Fuel Type</span><span>{log.fuelType}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Date</span><span>{log.date}</span></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <motion.div key="expenses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden text-left">
              <div className="p-4 border-b border-border-gray/50">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Fleet Expense Records</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{filteredExp.length} records — Total: ${filteredExp.reduce((a, e) => a + e.amount, 0).toFixed(2)}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {['Expense ID', 'Vehicle', 'Trip', 'Category', 'Amount', 'Recorded By', 'Date', 'Status'].map(h => (
                        <th key={h} className="p-3.5 first:pl-5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-gray/50 text-[11px] font-semibold text-slate-700">
                    {filteredExp.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-16 text-slate-400 font-medium text-xs">No expenses match your filters.</td></tr>
                    ) : filteredExp.map(exp => (
                      <React.Fragment key={exp.id}>
                        <tr
                          onClick={e => toggleRow(exp.id, e)}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center space-x-2">
                              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expandedRows[exp.id] ? 'rotate-90' : ''}`} />
                              <span className="font-bold font-mono text-slate-600">{exp.id}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono">{exp.vehicle}</td>
                          <td className="p-3.5 font-mono text-slate-500">{exp.tripId || '—'}</td>
                          <td className="p-3.5">{getCategoryBadge(exp.category)}</td>
                          <td className="p-3.5 font-mono font-bold text-slate-900">${exp.amount.toFixed(2)}</td>
                          <td className="p-3.5 text-slate-500">{exp.recordedBy}</td>
                          <td className="p-3.5 font-mono text-slate-400">{exp.date}</td>
                          <td className="p-3.5">{getStatusBadge(exp.status)}</td>
                        </tr>
                        {expandedRows[exp.id] && (
                          <tr>
                            <td colSpan={8} className="bg-slate-50 border-t border-b border-border-gray/60 p-5">
                              <div className="grid grid-cols-2 gap-4 max-w-xl">
                                <div className="bg-white border border-border-gray/60 p-4 rounded-xl shadow-sm">
                                  <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2">Expense Notes</h4>
                                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{exp.notes || 'No notes provided.'}</p>
                                </div>
                                <div className="bg-white border border-border-gray/60 p-4 rounded-xl shadow-sm">
                                  <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2">Receipt Status</h4>
                                  <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
                                    <FileText className="w-4 h-4 text-slate-300" />
                                    <span>No receipt uploaded yet.</span>
                                  </div>
                                  <button className="mt-2 text-[10px] font-bold text-primary hover:underline cursor-pointer">+ Upload Receipt</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* OPERATIONAL SUMMARY TAB */}
        {activeTab === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Cost overview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              {[
                { label: 'Fuel Cost', val: `$${totalFuelCost.toFixed(0)}`, pct: Math.round((totalFuelCost / (opsCost || 1)) * 100), color: '#2563EB' },
                { label: 'Maintenance', val: `$${maintCost.toFixed(0)}`, pct: Math.round((maintCost / (opsCost || 1)) * 100), color: '#F59E0B' },
                { label: 'Other Expenses', val: `$${otherCost.toFixed(0)}`, pct: Math.round((otherCost / (opsCost || 1)) * 100), color: '#64748B' },
                { label: 'Grand Total', val: `$${opsCost.toFixed(0)}`, pct: 100, color: '#0F172A' },
              ].map(c => {
                return (
                  <div key={c.label} className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-3">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">{c.label}</span>
                    <h3 className="text-xl font-black text-text-dark">{c.val}</h3>
                    <div className="flex items-center space-x-2">
                      <svg width="30" height="30" className="-rotate-90">
                        <circle cx="15" cy="15" r="15" className="stroke-slate-100" strokeWidth="3" fill="transparent" />
                        <circle cx="15" cy="15" r="15" stroke={c.color} strokeWidth="3" fill="transparent"
                          strokeDasharray={2 * Math.PI * 15}
                          strokeDashoffset={2 * Math.PI * 15 - (c.pct / 100) * 2 * Math.PI * 15}
                        />
                      </svg>
                      <span className="text-[10px] font-bold text-slate-400">{c.pct}% of total ops</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase border-b border-slate-100 pb-2">Fuel Cost Trend (6 Months)</h3>
                <div className="pt-2">
                  <LineChart data={fuelTrendData} labels={lineLabels} color="#2563EB" />
                </div>
              </div>
              <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase border-b border-slate-100 pb-2">Expense Distribution</h3>
                <div className="pt-2 flex items-center space-x-6">
                  <DonutChart segments={expenseDonutSegments} />
                  <div className="space-y-2">
                    {expenseDonutSegments.map(s => (
                      <div key={s.label} className="flex items-center space-x-2 text-[10.5px] font-semibold text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-slate-400 w-20">{s.label}</span>
                        <span className="font-mono font-bold">${s.value.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle cost leaderboard */}
            <div className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden text-left">
              <div className="p-4 border-b border-border-gray/50">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Vehicle Cost Leaderboard — Top Operational Costs</h3>
              </div>
              <div className="divide-y divide-border-gray/40">
                {[
                  { reg: 'TRK-201', name: 'Freightliner Cascadia', fuel: 304, maint: 780, total: 1129, cpkm: 1.42 },
                  { reg: 'TRK-305', name: 'Peterbilt 579', fuel: 355, maint: 320, total: 720, cpkm: 1.18 },
                  { reg: 'TRK-109', name: 'Ford Transit Cargo', fuel: 217, maint: 22, total: 284, cpkm: 0.91 },
                ].map((v, idx) => (
                  <div key={v.reg} className="flex items-center px-5 py-4 hover:bg-slate-50/50 transition-colors">
                    <span className="text-lg font-black text-slate-200 w-8 shrink-0">#{idx + 1}</span>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                        <Truck className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-700 truncate">{v.name}</h4>
                        <span className="text-[9.5px] text-slate-400 font-mono">{v.reg}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 shrink-0 text-[11px] font-semibold text-slate-600">
                      <div className="text-center hidden md:block"><span className="text-[9px] text-slate-400 font-bold block">Fuel</span>${v.fuel}</div>
                      <div className="text-center hidden md:block"><span className="text-[9px] text-slate-400 font-bold block">Maint.</span>${v.maint}</div>
                      <div className="text-center"><span className="text-[9px] text-slate-400 font-bold block">Total</span><span className="font-black text-primary">${v.total}</span></div>
                      <div className="text-center hidden lg:block">
                        <span className="text-[9px] text-slate-400 font-bold block">$/mile</span>
                        <span className="font-mono font-bold">${v.cpkm}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase border-b border-slate-100 pb-2 flex items-center">
                <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Cost Intelligence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { type: 'info', msg: 'Fuel cost increased by 8% this month. Diesel prices rose nationally — consider bulk purchase agreements.' },
                  { type: 'warn', msg: 'Vehicle TRK-201 has the highest operational cost ($1,129) — review maintenance schedule.' },
                  { type: 'info', msg: 'Fuel efficiency dropped 5% fleet-wide. Recommend tire pressure audit and route optimization.' },
                  { type: 'warn', msg: 'Maintenance expenses are above the 90-day fleet average by 12%. Preventive service may reduce long-term cost.' },
                ].map((ins, i) => (
                  <div key={i} className={`p-3 border rounded-xl flex items-start space-x-2 text-[10.5px] font-semibold leading-relaxed ${ins.type === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50/50 border-primary/20 text-slate-600'}`}>
                    {ins.type === 'warn'
                      ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      : <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    }
                    <span>{ins.msg}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Fuel Log Modal ── */}
      <AnimatePresence>
        {showFuelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center text-left">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFuelModal(false)} className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-md w-full mx-4 z-10 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border-gray/50">
                <div className="flex items-center space-x-2">
                  <Fuel className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black text-text-dark">Add Fuel Log</h3>
                </div>
                <button onClick={() => setShowFuelModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <form onSubmit={handleAddFuel} className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle</label>
                    <select value={fVehicle} onChange={e => setFVehicle(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none cursor-pointer">
                      <option value="TRK-201">TRK-201 — Freightliner</option>
                      <option value="TRK-109">TRK-109 — Ford Transit</option>
                      <option value="TRK-305">TRK-305 — Peterbilt</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Driver</label>
                    <input type="text" placeholder="e.g. James Carter" value={fDriver} onChange={e => setFDriver(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trip ID (optional)</label>
                    <input type="text" placeholder="e.g. TR-501" value={fTrip} onChange={e => setFTrip(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fuel Type</label>
                    <select value={fFuelType} onChange={e => setFFuelType(e.target.value as any)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none cursor-pointer">
                      <option>Diesel</option><option>Petrol</option><option>CNG</option><option>Electric</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fuel Station</label>
                  <input type="text" placeholder="e.g. Love's Travel Stop #102" value={fStation} onChange={e => setFStation(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fuel Quantity (L)</label>
                    <input type="number" value={fQty} onChange={e => setFQty(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none font-mono" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Price Per Litre ($)</label>
                    <input type="number" step="0.01" value={fPPL} onChange={e => setFPPL(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none font-mono" required />
                  </div>
                </div>
                <div className="p-3 bg-blue-50/60 border border-primary/20 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Auto Computed Total Cost</span>
                  <span className="text-base font-black text-primary">${(parseFloat(fQty || '0') * parseFloat(fPPL || '0')).toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Odometer (mi)</label>
                  <input type="number" value={fOdo} onChange={e => setFOdo(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes</label>
                  <textarea value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="e.g. Standard fill-up at overnight rest stop." className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none h-12 resize-none" />
                </div>
                <div className="flex space-x-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowFuelModal(false)} className="flex-1 py-2.5 border border-border-gray bg-white text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm">Save Fuel Log</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Expense Modal ── */}
      <AnimatePresence>
        {showExpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center text-left">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowExpModal(false)} className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-md w-full mx-4 z-10 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border-gray/50">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black text-text-dark">Add Expense</h3>
                </div>
                <button onClick={() => setShowExpModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-4 h-4 text-slate-500" /></button>
              </div>
              <form onSubmit={handleAddExpense} className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle</label>
                    <select value={eVehicle} onChange={e => setEVehicle(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none cursor-pointer">
                      <option value="TRK-201">TRK-201</option>
                      <option value="TRK-109">TRK-109</option>
                      <option value="TRK-305">TRK-305</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trip (optional)</label>
                    <input type="text" placeholder="e.g. TR-501" value={eTrip} onChange={e => setETrip(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expense Category</label>
                    <select value={eCategory} onChange={e => setECategory(e.target.value as any)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none cursor-pointer">
                      <option>Toll</option><option>Parking</option><option>Maintenance</option><option>Repairs</option><option>Miscellaneous</option><option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount ($)</label>
                    <input type="number" step="0.01" value={eAmount} onChange={e => setEAmount(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none font-mono" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                    <input type="date" value={eDate} onChange={e => setEDate(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submitted By</label>
                    <input type="text" value={eBy} onChange={e => setEBy(e.target.value)} className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes</label>
                  <textarea value={eNotes} onChange={e => setENotes(e.target.value)} placeholder="e.g. Midwest I-90 toll gate, cash payment." className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none h-12 resize-none" />
                </div>
                <div className="flex space-x-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowExpModal(false)} className="flex-1 py-2.5 border border-border-gray bg-white text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm">Submit Expense</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
