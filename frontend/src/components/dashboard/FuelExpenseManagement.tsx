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
  TrendingUp,
  FileText,
  Activity,
  Clock,
  Wrench
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusPill } from '../ui/StatusPill';
import { KpiTile } from '../ui/KpiTile';
import { Reveal } from '../ui/Reveal';
import { Field, SelectField } from '../ui/Field';
import { ModalShell } from '../ui/ModalShell';
import { Segmented } from '../ui/Segmented';
import { Ring } from '../ui/Ring';

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
        <text key={i} x={(i / (labels.length - 1)) * (w - 20) + 10} y={h + 14} textAnchor="middle" fill="#9CA3AF" fontSize="7.5" fontWeight="600">{l}</text>
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
    'Toll': 'bg-[#EFF4FF] text-[#2563EB] border-[#DBE6FF]',
    'Parking': 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]',
    'Maintenance': 'bg-[#FFFBEB] text-[#D97706] border-[#FDE8B0]',
    'Repairs': 'bg-[#FEF2F2] text-[#DC2626] border-[#FBD5D5]',
    'Miscellaneous': 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]',
    'Other': 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[cat] || 'bg-[#F3F4F6] text-[#4B5563]'}`}>
      {cat}
    </span>
  );
};

const getStatusBadge = (status: Expense['status']) => {
  return <StatusPill status={status} pulse={status === 'Pending'} />;
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

  const loadLedger = async () => {
    setIsLoading(true);
    try {
      const [fuelResponse, expensesResponse] = await Promise.all([
        apiFetch('/api/fleet/fuel-logs'),
        apiFetch('/api/fleet/expenses')
      ]);
      if (fuelResponse.ok) setFuelLogs(await fuelResponse.json());
      if (expensesResponse.ok) setExpenses(await expensesResponse.json());
    } catch {
      onShowToast('Unable to load the financial ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    onShowToast('Syncing real-time financial ledger data...');
    loadLedger();
  };

  const handleAddFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiFetch('/api/fleet/fuel-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: fVehicle, driver: fDriver, tripId: fTrip, station: fStation, fuelType: fFuelType, quantity: Number(fQty), pricePerLiter: Number(fPPL), odometer: Number(fOdo), notes: fNotes })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to record fuel log.');
      setFuelLogs((records) => [data.record, ...records]);
      setShowFuelModal(false);
      onShowToast(`Fuel log ${data.record.id} recorded successfully.`);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Unable to record fuel log.');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiFetch('/api/fleet/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle: eVehicle, tripId: eTrip, category: eCategory, amount: Number(eAmount), date: eDate, recordedBy: eBy, notes: eNotes })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to submit expense.');
      setExpenses((records) => [data.record, ...records]);
      setShowExpModal(false);
      onShowToast(`Expense ${data.record.id} submitted for approval.`);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Unable to submit expense.');
    }
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
    <Reveal className="space-y-6 select-none relative pb-16">

      {/* ── Page Header ── */}
      <SectionHeader
        title="Fuel & Expense Management"
        subtitle="Track fuel consumption, operational expenses, and fleet running costs with real-time financial insights."
        actions={
          <>
            <button 
              onClick={() => setShowFuelModal(true)} 
              className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Fuel className="w-4 h-4" />
              <span>Add Fuel Log</span>
            </button>
            <button 
              onClick={() => setShowExpModal(true)} 
              className="px-4 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
            <button 
              onClick={() => onShowToast('Exporting financial records as CSV...')} 
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={handleRefresh} 
              className="p-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] rounded-[12px] transition-all cursor-pointer cc-shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      {/* ── KPI Ribbon ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiTile 
          icon={Fuel}
          label="Total Fuel Cost" 
          value={`$${totalFuelCost.toFixed(0)}`}
          sublabel="+3% vs last month" 
          spark={[280, 310, 290, 340, 320, 304]}
          color="#2563EB"
          tint="#EFF4FF"
        />
        <KpiTile 
          icon={Activity}
          label="Fuel Consumed" 
          value={totalFuelQty} 
          suffix=" L"
          sublabel="245 L last month" 
          spark={[200, 220, 210, 245, 235, 245]}
          color="#2563EB"
          tint="#EFF4FF"
        />
        <KpiTile 
          icon={DollarSign}
          label="Total Ops Cost" 
          value={`$${opsCost.toFixed(0)}`}
          sublabel="All expenses combined" 
          spark={[900, 980, 870, 1100, 1040, Math.round(opsCost / 10)]}
          color="#2563EB"
          tint="#EFF4FF"
        />
        <KpiTile 
          icon={Wrench}
          label="Maintenance Cost" 
          value={`$${maintCost.toFixed(0)}`}
          sublabel="-5% vs last month" 
          spark={[400, 450, 380, 420, 380, Math.round(maintCost / 5)]}
          color="#059669"
          tint="#ECFDF5"
        />
        <KpiTile 
          icon={Plus}
          label="Other Expenses" 
          value={`$${otherCost.toFixed(0)}`}
          sublabel="Tolls, Parking, Misc" 
          spark={[40, 60, 55, 67, 50, otherCost]}
          color="#D97706"
          tint="#FFFBEB"
        />
        <KpiTile 
          icon={Clock}
          label="Avg Cost / Mile" 
          value="$1.24"
          decimals={2}
          sublabel="Fleet benchmark" 
          spark={[1.1, 1.2, 1.15, 1.28, 1.22, 1.24]}
          color="#059669"
          tint="#ECFDF5"
        />
      </div>

      {/* ── Sticky Filters ── */}
      <div className="sticky top-0 z-20 bg-white border border-[#E5E7EB] p-4 rounded-[16px] flex flex-wrap items-center gap-3.5 cc-shadow-sm">
        <div className="flex items-center space-x-2 border-r border-[#E5E7EB] pr-3.5 py-1 shrink-0 text-[#0A0A0A]">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-wider">Filters</span>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text" 
            placeholder="Search logs, vehicle, driver..."
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] text-xs focus:bg-white focus:outline-none transition-all font-semibold text-[#4B5563]"
          />
        </div>
        <select 
          value={filterVehicle} 
          onChange={e => setFilterVehicle(e.target.value)} 
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer focus:bg-white"
        >
          <option value="All Vehicles">All Vehicles</option>
          <option value="TRK-201">TRK-201</option>
          <option value="TRK-109">TRK-109</option>
          <option value="TRK-305">TRK-305</option>
        </select>
        <select 
          value={filterType} 
          onChange={e => setFilterType(e.target.value)} 
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer focus:bg-white"
        >
          <option value="All Types">All Types</option>
          {activeTab === 'fuel'
            ? ['Diesel', 'Petrol', 'CNG', 'Electric'].map(t => <option key={t}>{t}</option>)
            : ['Toll', 'Parking', 'Maintenance', 'Repairs', 'Miscellaneous', 'Other'].map(t => <option key={t}>{t}</option>)
          }
        </select>
        {activeTab === 'expenses' && (
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)} 
            className="bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer focus:bg-white"
          >
            <option value="All Statuses">All Statuses</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
        )}
        {(search || filterVehicle !== 'All Vehicles' || filterType !== 'All Types' || filterStatus !== 'All Statuses') && (
          <button onClick={handleResetFilters} className="px-2 py-1 text-xs font-bold text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer">Reset</button>
        )}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex justify-start">
        <Segmented
          value={activeTab}
          onChange={(v) => setActiveTab(v as any)}
          options={[
            { id: 'fuel', label: <span className="flex items-center gap-1.5"><Fuel className="w-4 h-4" /> Fuel Logs</span> },
            { id: 'expenses', label: <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Expense Records</span> },
            { id: 'summary', label: <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Operational Summary</span> }
          ]}
        />
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">

        {/* FUEL LOGS TAB */}
        {activeTab === 'fuel' && (
          <motion.div key="fuel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden text-left">
              <div className="p-4.5 border-b border-[#E5E7EB]">
                <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Refueling Activity Ledger</h3>
                <p className="text-[11px] text-[#6B7280] mt-1">{filteredFuel.length} records found</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                      {['Fuel Log ID', 'Vehicle', 'Driver', 'Trip', 'Station', 'Type', 'Qty (L)', 'Price/L', 'Total Cost', 'Odometer', 'Date'].map(h => (
                        <th key={h} className="p-3.5 first:pl-5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-[11px] font-semibold text-[#4B5563]">
                    {filteredFuel.length === 0 ? (
                      <tr><td colSpan={11} className="text-center py-16 text-[#9CA3AF] font-medium text-xs">No fuel logs match your filters.</td></tr>
                    ) : filteredFuel.map(log => (
                      <React.Fragment key={log.id}>
                        <tr
                          onClick={e => toggleRow(log.id, e)}
                          className="hover:bg-[#F9FAFB]/50 transition-colors cursor-pointer group"
                        >
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center space-x-2">
                              <ChevronRight className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform ${expandedRows[log.id] ? 'rotate-90' : ''}`} />
                              <span className="font-bold font-mono text-[#4B5563]">{log.id}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center space-x-1.5">
                              <Truck className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                              <span className="max-w-[110px] truncate">{log.vehicle}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-[#6B7280]">{log.driver}</td>
                          <td className="p-3.5 font-mono text-[#6B7280]">{log.tripId || '—'}</td>
                          <td className="p-3.5 text-[#6B7280] max-w-[120px] truncate">{log.station}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#EFF4FF] text-[#2563EB] border border-[#DBE6FF]">{log.fuelType}</span>
                          </td>
                          <td className="p-3.5 font-mono">{log.quantity} L</td>
                          <td className="p-3.5 font-mono">${log.pricePerLiter}</td>
                          <td className="p-3.5 font-mono font-bold text-[#0A0A0A]">${log.totalCost.toFixed(2)}</td>
                          <td className="p-3.5 font-mono text-[#6B7280]">{log.odometer.toLocaleString()}</td>
                          <td className="p-3.5 text-[#9CA3AF] font-mono">{log.date}</td>
                        </tr>
                        {expandedRows[log.id] && (
                          <tr>
                            <td colSpan={11} className="bg-[#F9FAFB] border-t border-b border-[#E5E7EB] p-5">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white border border-[#E5E7EB] p-4 rounded-[12px] space-y-2 cc-shadow-sm">
                                  <h4 className="text-[9px] font-black uppercase text-[#9CA3AF] tracking-wider">Efficiency Metrics</h4>
                                  <div className="text-[11px] font-semibold text-[#6B7280] space-y-1">
                                    <div className="flex justify-between"><span className="text-[#9CA3AF]">Price Per Liter</span><span className="text-[#0A0A0A]">${log.pricePerLiter}</span></div>
                                    <div className="flex justify-between"><span className="text-[#9CA3AF]">Total Litres</span><span className="text-[#0A0A0A] font-mono">{log.quantity} L</span></div>
                                    <div className="flex justify-between"><span className="text-[#9CA3AF]">Total Cost</span><span className="font-bold text-primary font-mono">${log.totalCost.toFixed(2)}</span></div>
                                  </div>
                                </div>
                                <div className="bg-white border border-[#E5E7EB] p-4 rounded-[12px] space-y-2 cc-shadow-sm">
                                  <h4 className="text-[9px] font-black uppercase text-[#9CA3AF] tracking-wider">Trip Assignment</h4>
                                  <div className="text-[11px] font-semibold text-[#6B7280] space-y-1">
                                    <div className="flex justify-between"><span className="text-[#9CA3AF]">Trip ID</span><span className="text-[#0A0A0A]">{log.tripId || 'Unassigned'}</span></div>
                                    <div className="flex justify-between"><span className="text-[#9CA3AF]">Driver</span><span className="text-[#0A0A0A]">{log.driver}</span></div>
                                    <div className="flex justify-between"><span className="text-[#9CA3AF]">Odometer</span><span className="text-[#0A0A0A] font-mono">{log.odometer.toLocaleString()} mi</span></div>
                                  </div>
                                </div>
                                <div className="bg-white border border-[#E5E7EB] p-4 rounded-[12px] space-y-2 cc-shadow-sm">
                                  <h4 className="text-[9px] font-black uppercase text-[#9CA3AF] tracking-wider">Station Info</h4>
                                  <div className="text-[11px] font-semibold text-[#6B7280] space-y-1">
                                    <div className="flex justify-between"><span className="text-[#9CA3AF]">Station</span><span className="text-right max-w-[100px] truncate text-[#0A0A0A]">{log.station}</span></div>
                                    <div className="flex justify-between"><span className="text-[#9CA3AF]">Fuel Type</span><span className="text-[#0A0A0A]">{log.fuelType}</span></div>
                                    <div className="flex justify-between"><span className="text-[#9CA3AF]">Date</span><span className="text-[#0A0A0A] font-mono">{log.date}</span></div>
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
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden text-left">
              <div className="p-4.5 border-b border-[#E5E7EB]">
                <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Fleet Expense Records</h3>
                <p className="text-[11px] text-[#6B7280] mt-1">{filteredExp.length} records — Total: ${filteredExp.reduce((a, e) => a + e.amount, 0).toFixed(2)}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                      {['Expense ID', 'Vehicle', 'Trip', 'Category', 'Amount', 'Recorded By', 'Date', 'Status'].map(h => (
                        <th key={h} className="p-3.5 first:pl-5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-[11px] font-semibold text-[#4B5563]">
                    {filteredExp.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-16 text-[#9CA3AF] font-medium text-xs">No expenses match your filters.</td></tr>
                    ) : filteredExp.map(exp => (
                      <React.Fragment key={exp.id}>
                        <tr
                          onClick={e => toggleRow(exp.id, e)}
                          className="hover:bg-[#F9FAFB]/50 transition-colors cursor-pointer group"
                        >
                          <td className="p-3.5 pl-5">
                            <div className="flex items-center space-x-2">
                              <ChevronRight className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform ${expandedRows[exp.id] ? 'rotate-90' : ''}`} />
                              <span className="font-bold font-mono text-[#4B5563]">{exp.id}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-[#0A0A0A]">{exp.vehicle}</td>
                          <td className="p-3.5 font-mono text-[#6B7280]">{exp.tripId || '—'}</td>
                          <td className="p-3.5">{getCategoryBadge(exp.category)}</td>
                          <td className="p-3.5 font-mono font-bold text-[#0A0A0A]">${exp.amount.toFixed(2)}</td>
                          <td className="p-3.5 text-[#6B7280]">{exp.recordedBy}</td>
                          <td className="p-3.5 font-mono text-[#9CA3AF]">{exp.date}</td>
                          <td className="p-3.5">{getStatusBadge(exp.status)}</td>
                        </tr>
                        {expandedRows[exp.id] && (
                          <tr>
                            <td colSpan={8} className="bg-[#F9FAFB] border-t border-b border-[#E5E7EB] p-5">
                              <div className="grid grid-cols-2 gap-4 max-w-xl">
                                <div className="bg-white border border-[#E5E7EB] p-4 rounded-[12px] cc-shadow-sm">
                                  <h4 className="text-[9px] font-black uppercase text-[#9CA3AF] tracking-wider mb-2">Expense Notes</h4>
                                  <p className="text-[11px] font-semibold text-[#6B7280] leading-relaxed">{exp.notes || 'No notes provided.'}</p>
                                </div>
                                <div className="bg-white border border-[#E5E7EB] p-4 rounded-[12px] cc-shadow-sm">
                                  <h4 className="text-[9px] font-black uppercase text-[#9CA3AF] tracking-wider mb-2">Receipt Status</h4>
                                  <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#6B7280]">
                                    <FileText className="w-4 h-4 text-[#9CA3AF]" />
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
                { label: 'Maintenance', val: `$${maintCost.toFixed(0)}`, pct: Math.round((maintCost / (opsCost || 1)) * 100), color: '#D97706' },
                { label: 'Other Expenses', val: `$${otherCost.toFixed(0)}`, pct: Math.round((otherCost / (opsCost || 1)) * 100), color: '#6B7280' },
                { label: 'Grand Total', val: `$${opsCost.toFixed(0)}`, pct: 100, color: '#0A0A0A' },
              ].map(c => {
                return (
                  <div key={c.label} className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-3.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider leading-none block">{c.label}</span>
                      <h3 className="text-xl font-black text-[#0A0A0A] mt-2">{c.val}</h3>
                    </div>
                    <div className="flex items-center space-x-2 pt-2 border-t border-[#F3F4F6]">
                      <Ring value={c.pct} size={32} stroke={3} color={c.color} />
                      <span className="text-[10px] font-bold text-[#9CA3AF]">{c.pct}% of total ops</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
                <h3 className="text-xs font-black text-[#0A0A0A] uppercase border-b border-[#F3F4F6] pb-2">Fuel Cost Trend (6 Months)</h3>
                <div className="pt-2">
                  <LineChart data={fuelTrendData} labels={lineLabels} color="#2563EB" />
                </div>
              </div>
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
                <h3 className="text-xs font-black text-[#0A0A0A] uppercase border-b border-[#F3F4F6] pb-2">Expense Distribution</h3>
                <div className="pt-2 flex items-center space-x-6">
                  <DonutChart segments={expenseDonutSegments} />
                  <div className="space-y-2">
                    {expenseDonutSegments.map(s => (
                      <div key={s.label} className="flex items-center space-x-2 text-[10.5px] font-semibold text-[#4B5563]">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-[#9CA3AF] w-20">{s.label}</span>
                        <span className="font-mono font-bold text-[#0A0A0A]">${s.value.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle cost leaderboard */}
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden text-left">
              <div className="p-4.5 border-b border-[#E5E7EB]">
                <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Vehicle Cost Leaderboard — Top Operational Costs</h3>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {[
                  { reg: 'TRK-201', name: 'Freightliner Cascadia', fuel: 304, maint: 780, total: 1129, cpkm: 1.42 },
                  { reg: 'TRK-305', name: 'Peterbilt 579', fuel: 355, maint: 320, total: 720, cpkm: 1.18 },
                  { reg: 'TRK-109', name: 'Ford Transit Cargo', fuel: 217, maint: 22, total: 284, cpkm: 0.91 },
                ].map((v, idx) => (
                  <div key={v.reg} className="flex items-center px-5 py-4 hover:bg-[#F9FAFB]/50 transition-colors">
                    <span className="text-lg font-black text-[#9CA3AF] w-8 shrink-0">#{idx + 1}</span>
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-[10px] bg-[#EFF4FF] text-primary border border-[#DBE6FF] flex items-center justify-center shrink-0">
                        <Truck className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-[#4B5563] truncate">{v.name}</h4>
                        <span className="text-[9.5px] text-[#9CA3AF] font-mono">{v.reg}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 shrink-0 text-[11px] font-semibold text-[#4B5563]">
                      <div className="text-center hidden md:block"><span className="text-[9px] text-[#9CA3AF] font-bold block">Fuel</span>${v.fuel}</div>
                      <div className="text-center hidden md:block"><span className="text-[9px] text-[#9CA3AF] font-bold block">Maint.</span>${v.maint}</div>
                      <div className="text-center"><span className="text-[9px] text-[#9CA3AF] font-bold block">Total</span><span className="font-black text-primary">${v.total}</span></div>
                      <div className="text-center hidden lg:block">
                        <span className="text-[9px] text-[#9CA3AF] font-bold block">$/mile</span>
                        <span className="font-mono font-bold">${v.cpkm}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
              <h3 className="text-xs font-black text-[#0A0A0A] uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
                <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Cost Intelligence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { type: 'info', msg: 'Fuel cost increased by 8% this month. Diesel prices rose nationally — consider bulk purchase agreements.' },
                  { type: 'warn', msg: 'Vehicle TRK-201 has the highest operational cost ($1,129) — review maintenance schedule.' },
                  { type: 'info', msg: 'Fuel efficiency dropped 5% fleet-wide. Recommend tire pressure audit and route optimization.' },
                  { type: 'warn', msg: 'Maintenance expenses are above the 90-day fleet average by 12%. Preventive service may reduce long-term cost.' },
                ].map((ins, i) => (
                  <div key={i} className={`p-3 border rounded-[12px] flex items-start space-x-2 text-[10.5px] font-semibold leading-relaxed ${ins.type === 'warn' ? 'bg-[#FFFBEB] border-[#FDE8B0] text-[#D97706]' : 'bg-[#EFF4FF] border-[#DBE6FF] text-[#4B5563]'}`}>
                    {ins.type === 'warn'
                      ? <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
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
      <ModalShell
        isOpen={showFuelModal}
        onClose={() => setShowFuelModal(false)}
        title="Add Fuel Log"
      >
        <form onSubmit={handleAddFuel} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Vehicle"
              value={fVehicle}
              onChange={setFVehicle}
              options={[
                { value: 'TRK-201', label: 'TRK-201 — Freightliner' },
                { value: 'TRK-109', label: 'TRK-109 — Ford Transit' },
                { value: 'TRK-305', label: 'TRK-305 — Peterbilt' }
              ]}
            />
            <Field
              label="Driver"
              placeholder="e.g. James Carter"
              value={fDriver}
              onChange={setFDriver}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Trip ID (optional)"
              placeholder="e.g. TR-501"
              value={fTrip}
              onChange={setFTrip}
            />
            <SelectField
              label="Fuel Type"
              value={fFuelType}
              onChange={v => setFFuelType(v as any)}
              options={['Diesel', 'Petrol', 'CNG', 'Electric'].map(o => ({ value: o, label: o }))}
            />
          </div>
          <Field
            label="Fuel Station"
            placeholder="e.g. Love's Travel Stop #102"
            value={fStation}
            onChange={setFStation}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              type="number"
              label="Fuel Quantity (L)"
              value={fQty}
              onChange={setFQty}
              required
            />
            <Field
              type="number"
              step="0.01"
              label="Price Per Litre ($)"
              value={fPPL}
              onChange={setFPPL}
              required
            />
          </div>
          <div className="p-3 bg-[#EFF4FF] border border-primary/20 rounded-[12px] flex justify-between items-center">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase">Auto Computed Total Cost</span>
            <span className="text-base font-black text-primary font-mono">${(parseFloat(fQty || '0') * parseFloat(fPPL || '0')).toFixed(2)}</span>
          </div>
          <Field
            type="number"
            label="Current Odometer (mi)"
            value={fOdo}
            onChange={setFOdo}
          />
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">Notes</label>
            <textarea
              value={fNotes}
              onChange={e => setFNotes(e.target.value)}
              placeholder="e.g. Standard fill-up at overnight rest stop."
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] px-3.5 py-2 text-xs focus:bg-white focus:outline-none h-16 resize-none font-semibold text-[#4B5563]"
            />
          </div>
          <div className="flex space-x-3 pt-3 border-t border-[#F3F4F6]">
            <button 
              type="button" 
              onClick={() => setShowFuelModal(false)} 
              className="flex-1 py-2.5 border border-[#E5E7EB] bg-white text-[#4B5563] text-xs font-bold rounded-[12px] cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cursor-pointer shadow-sm"
            >
              Save Fuel Log
            </button>
          </div>
        </form>
      </ModalShell>

      {/* ── Add Expense Modal ── */}
      <ModalShell
        isOpen={showExpModal}
        onClose={() => setShowExpModal(false)}
        title="Add Expense"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Vehicle"
              value={eVehicle}
              onChange={setEVehicle}
              options={[
                { value: 'TRK-201', label: 'TRK-201' },
                { value: 'TRK-109', label: 'TRK-109' },
                { value: 'TRK-305', label: 'TRK-305' }
              ]}
            />
            <Field
              label="Trip (optional)"
              placeholder="e.g. TR-501"
              value={eTrip}
              onChange={setETrip}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Expense Category"
              value={eCategory}
              onChange={v => setECategory(v as any)}
              options={['Toll', 'Parking', 'Maintenance', 'Repairs', 'Miscellaneous', 'Other'].map(o => ({ value: o, label: o }))}
            />
            <Field
              type="number"
              step="0.01"
              label="Amount ($)"
              value={eAmount}
              onChange={setEAmount}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              type="date"
              label="Date"
              value={eDate}
              onChange={setEDate}
            />
            <Field
              label="Submitted By"
              value={eBy}
              onChange={setEBy}
              required
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">Notes</label>
            <textarea
              value={eNotes}
              onChange={e => setENotes(e.target.value)}
              placeholder="e.g. Midwest I-90 toll gate, cash payment."
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] px-3.5 py-2 text-xs focus:bg-white focus:outline-none h-16 resize-none font-semibold text-[#4B5563]"
            />
          </div>
          <div className="flex space-x-3 pt-3 border-t border-[#F3F4F6]">
            <button 
              type="button" 
              onClick={() => setShowExpModal(false)} 
              className="flex-1 py-2.5 border border-[#E5E7EB] bg-white text-[#4B5563] text-xs font-bold rounded-[12px] cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2.5 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cursor-pointer shadow-sm"
            >
              Submit Expense
            </button>
          </div>
        </form>
      </ModalShell>

    </Reveal>
  );
};
