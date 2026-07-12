import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Download, 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronRight, 
  Eye, 
  Trash2, 
  Edit2,
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Inbox, 
  ShieldCheck, 
  User, 
  Users, 
  Sparkles
} from 'lucide-react';
import { AddEditDriver } from './AddEditDriver';
import { DriverDetails } from './DriverDetails';
import { apiFetch } from '../../lib/api';

export interface DriverData {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  contactNumber: string;
  safetyScore: number;
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
  currentVehicle: string;
  licenseExpiry: string;
  daysToExpiry: number;
  lastTrip: string;
  experience: number;
  totalTrips: number;
  avgDistance: number;
  avgFuelEfficiency: number;
  emergencyContact: string;
  region: string;
  compliance: {
    license: string;
    medical: string;
    background: string;
    training: string;
  };
  incidents: number;
  timeline: { date: string; event: string }[];
}

interface DriverManagementProps {
  onShowToast: (msg: string) => void;
}

// Custom SVG sparkline generator
const Sparkline: React.FC<{ dataPoints: number[]; color: string }> = ({ dataPoints, color }) => {
  const width = 80;
  const height = 24;
  const max = Math.max(...dataPoints);
  const min = Math.min(...dataPoints);
  const range = max - min || 1;
  const points = dataPoints.map((val, idx) => {
    const x = (idx / (dataPoints.length - 1)) * width;
    const y = height - 2 - ((val - min) / range) * (height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const pathD = `M ${points}`;
  return (
    <svg width={width} height={height} className="overflow-visible select-none">
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const DriverManagement: React.FC<DriverManagementProps> = ({ onShowToast }) => {
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [driverView, setDriverView] = useState<'list' | 'add' | 'edit' | 'details'>('list');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [minSafetyScore, setMinSafetyScore] = useState(60);
  const [sortBy, setSortBy] = useState('safety');

  const [isDialOpen, setIsDialOpen] = useState(false);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/fleet/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data);
        if (data.length > 0 && !selectedDriver) {
          setSelectedDriver(data[0]);
        }
      }
    } catch {
      onShowToast('Error loading safety dossiers from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    onShowToast('Syncing safety dossiers and licensing updates...');
    fetchDrivers();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Statuses');
    setSelectedCategory('All Categories');
    setSelectedRegion('All Regions');
    setMinSafetyScore(60);
    setSortBy('safety');
    onShowToast('Filters reset.');
  };

  const handleRowClick = (drv: DriverData) => {
    setSelectedDriver(drv);
  };

  const toggleRowExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteDriver = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`/api/fleet/drivers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onShowToast(`Driver dossier #${id} archived.`);
        if (selectedDriver?.id === id) {
          setSelectedDriver(null);
        }
        fetchDrivers();
      }
    } catch {
      onShowToast('Archival request failed.');
    }
  };



  // Filtered/Sorted drivers list
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.currentVehicle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All Statuses' || d.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All Categories' || d.licenseCategory === selectedCategory;
    const matchesRegion = selectedRegion === 'All Regions' || d.region === selectedRegion;
    const matchesSafety = d.safetyScore >= minSafetyScore;

    return matchesSearch && matchesStatus && matchesCategory && matchesRegion && matchesSafety;
  }).sort((a, b) => {
    if (sortBy === 'safety') return b.safetyScore - a.safetyScore;
    if (sortBy === 'trips') return b.totalTrips - a.totalTrips;
    if (sortBy === 'experience') return b.experience - a.experience;
    return 0;
  });

  const getStatusBadge = (status: DriverData['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Available
          </span>
        );
      case 'On Trip':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
            On Trip
          </span>
        );
      case 'Off Duty':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Off Duty
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const getSafetyCircleColor = (score: number) => {
    if (score >= 90) return 'stroke-primary';
    if (score >= 70) return 'stroke-amber-500';
    return 'stroke-rose-500';
  };

  const getSafetyTextColor = (score: number) => {
    if (score >= 90) return 'text-primary';
    if (score >= 70) return 'text-amber-500';
    return 'text-rose-500';
  };

  // Stepper calculations
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const selectedScore = selectedDriver?.safetyScore || 100;
  const safetyOffset = circumference - (selectedScore / 100) * circumference;

  // KPI calculations
  const kpis = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'Available').length,
    onTrip: drivers.filter(d => d.status === 'On Trip').length,
    suspended: drivers.filter(d => d.status === 'Suspended' || d.daysToExpiry <= 0).length
  };

  if (driverView === 'add' || driverView === 'edit') {
    return (
      <AddEditDriver
        initialData={driverView === 'edit' ? selectedDriver : null}
        onClose={() => setDriverView('list')}
        onShowToast={onShowToast}
        existingDrivers={drivers}
      />
    );
  }

  if (driverView === 'details' && selectedDriver) {
    return (
      <DriverDetails
        driver={selectedDriver}
        onClose={() => setDriverView('list')}
        onEdit={() => setDriverView('edit')}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <div className="space-y-6 select-none relative pb-16">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-gray/50">
        <div className="text-left">
          <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">Driver Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
            Manage driver profiles, licenses, safety compliance, availability, and assignments across your fleet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setDriverView('add')}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm hover:scale-102 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Driver</span>
          </button>
          
          <button
            onClick={() => onShowToast('Downloading Driver Registry as CSV...')}
            className="px-3 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh Dossier Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 bg-white border border-border-gray rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group cursor-pointer">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 text-primary rounded-xl shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Total Drivers</span>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-text-dark tracking-tight leading-none">{kpis.total}</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Active Dossiers</p>
            </div>
            <div className="w-16 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline dataPoints={[4, 5, 5, 5, 6, 6, 6]} color="#2563EB" />
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 bg-white border border-border-gray rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group cursor-pointer">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Available</span>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-text-dark tracking-tight leading-none">{kpis.available}</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Ready for Dispatch</p>
            </div>
            <div className="w-16 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline dataPoints={[1, 1, 2, 1, 1, 2, 1]} color="#22C55E" />
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 bg-white border border-border-gray rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group cursor-pointer">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 text-primary rounded-xl shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">On Mission</span>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-text-dark tracking-tight leading-none">{kpis.onTrip}</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Active Operators</p>
            </div>
            <div className="w-16 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline dataPoints={[2, 3, 3, 2, 3, 4, 3]} color="#2563EB" />
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 bg-white border border-border-gray rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group cursor-pointer">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Compliance Alert</span>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-text-dark tracking-tight leading-none">{kpis.suspended}</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Expired/Suspended</p>
            </div>
            <div className="w-16 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline dataPoints={[1, 0, 1, 1, 2, 1, 1]} color="#EF4444" />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Filter Section */}
      <div className="sticky top-16 z-15 bg-white border border-border-gray p-4 rounded-2xl flex flex-wrap items-center gap-3.5 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-800 border-r border-border-gray pr-3.5 py-1 shrink-0">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold">Search & Filters</span>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, license, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border-gray rounded-xl text-xs focus:bg-white focus:outline-none input-glow transition-all"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="All Statuses">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Off Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="All Categories">All Categories</option>
          <option value="CDL-A">Class A CDL</option>
          <option value="CDL-B">Class B CDL</option>
        </select>

        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="All Regions">All Regions</option>
          <option value="East Coast">East Coast</option>
          <option value="West Coast">West Coast</option>
          <option value="Midwest">Midwest</option>
          <option value="South">South</option>
        </select>

        <div className="flex items-center space-x-2 border border-border-gray rounded-xl px-3 py-2 bg-slate-50 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Min Safety:</span>
          <input 
            type="range" 
            min="50" 
            max="100" 
            step="5"
            value={minSafetyScore}
            onChange={(e) => setMinSafetyScore(Number(e.target.value))}
            className="w-20 accent-primary cursor-pointer h-1 rounded bg-slate-200"
          />
          <span className="text-[11px] font-bold text-slate-700 font-mono">{minSafetyScore}%</span>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="safety">Sort by Safety</option>
          <option value="trips">Sort by Trips</option>
          <option value="experience">Sort by Experience</option>
        </select>

        {(searchQuery || selectedStatus !== 'All Statuses' || selectedCategory !== 'All Categories' || selectedRegion !== 'All Regions' || minSafetyScore !== 60) && (
          <button onClick={handleResetFilters} className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">
            Reset
          </button>
        )}
      </div>

      {/* Main workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Data Table or Grid cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 tracking-tight uppercase">Operators Database</span>
            <div className="flex p-0.5 bg-slate-100 border border-border-gray rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filteredDrivers.length === 0 ? (
              <div className="bg-white border border-border-gray rounded-2xl p-16 text-center shadow-sm">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-text-dark">No Drivers Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Start building your driver registry or try clearing search queries.
                </p>
              </div>
            ) : viewMode === 'table' ? (
              /* Data Table layout */
              <div className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3.5 pl-5">Operator Name</th>
                        <th className="p-3.5">License</th>
                        <th className="p-3.5">CDL Class</th>
                        <th className="p-3.5">Safety Rating</th>
                        <th className="p-3.5">Odometer Fuel Avg</th>
                        <th className="p-3.5">Availability</th>
                        <th className="p-3.5 text-right pr-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-gray/50">
                      {filteredDrivers.map((drv) => {
                        const isSelected = selectedDriver?.id === drv.id;
                        const isExpanded = !!expandedRows[drv.id];
                        const isExpired = drv.daysToExpiry <= 0;

                        return (
                          <React.Fragment key={drv.id}>
                            <tr
                              onClick={() => handleRowClick(drv)}
                              className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${
                                isSelected ? 'bg-primary/[0.02]' : ''
                              }`}
                            >
                              <td className="p-3.5 pl-5 font-semibold text-text-dark">
                                <div className="flex items-center space-x-2.5">
                                  <button
                                    onClick={(e) => toggleRowExpand(drv.id, e)}
                                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                  >
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                  </button>
                                  <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold leading-none">{drv.name}</span>
                                    <span className="text-[10px] text-slate-400 mt-1 leading-none">{drv.region}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 font-bold font-mono text-slate-600">
                                <div className="flex flex-col">
                                  <span>{drv.licenseNumber}</span>
                                  {isExpired ? (
                                    <span className="text-[9.5px] font-black text-rose-600 flex items-center mt-1 animate-pulse">
                                      <AlertTriangle className="w-3 h-3 mr-0.5" /> EXPIRED
                                    </span>
                                  ) : drv.daysToExpiry <= 30 ? (
                                    <span className="text-[9.5px] font-black text-amber-600 flex items-center mt-1">
                                      <AlertTriangle className="w-3 h-3 mr-0.5" /> EXPIRING SOON ({drv.daysToExpiry}d)
                                    </span>
                                  ) : (
                                    <span className="text-[9.5px] text-slate-400 mt-1">Valid ({drv.daysToExpiry}d left)</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3.5 text-slate-500 font-bold">{drv.licenseCategory}</td>
                              <td className="p-3.5 font-bold">
                                <div className="flex items-center space-x-1.5">
                                  <svg className="w-5 h-5 transform -rotate-90">
                                    <circle cx="10" cy="10" r="8" className="stroke-slate-100" strokeWidth="2" fill="transparent" />
                                    <circle cx="10" cy="10" r="8" className={getSafetyCircleColor(drv.safetyScore)} strokeWidth="2" fill="transparent" strokeDasharray={2 * Math.PI * 8} strokeDashoffset={2 * Math.PI * 8 - (drv.safetyScore / 100) * 2 * Math.PI * 8} />
                                  </svg>
                                  <span className={getSafetyTextColor(drv.safetyScore)}>{drv.safetyScore}%</span>
                                </div>
                              </td>
                              <td className="p-3.5 font-semibold text-slate-600">{drv.avgFuelEfficiency} MPG</td>
                              <td className="p-3.5">{getStatusBadge(drv.status)}</td>
                              <td className="p-3.5 text-right pr-5">
                                <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedDriver(drv); setDriverView('details'); }}
                                    className="p-1 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="View Profile Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedDriver(drv); setDriverView('edit'); }}
                                    className="p-1 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Profile"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteDriver(drv.id, e)}
                                    className="p-1 text-slate-400 hover:text-danger-red hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Archive Profile"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Row Expanded section */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={7} className="p-0 bg-slate-50 border-t border-b border-border-gray/70">
                                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                                    {/* Column 1: Details */}
                                    <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3 shadow-sm">
                                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Driver Overview</h4>
                                      <div className="grid grid-cols-2 gap-y-2 gap-x-1.5 text-[11px] font-semibold">
                                        <div>
                                          <span className="text-slate-400 block text-[9px]">CDL Expiry Date</span>
                                          <span className="text-slate-700">{drv.licenseExpiry}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block text-[9px]">Incident Records</span>
                                          <span className={drv.incidents > 0 ? 'text-rose-500 font-bold' : 'text-slate-700'}>{drv.incidents} Flagged</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block text-[9px]">Odometer Trips count</span>
                                          <span className="text-slate-700">{drv.totalTrips} Completed</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block text-[9px]">Assigned Vehicle</span>
                                          <span className="text-slate-700 truncate block">{drv.currentVehicle}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Column 2: Document Checklist */}
                                    <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3 shadow-sm">
                                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dossier Compliance</h4>
                                      <div className="space-y-2 text-[11px] font-bold text-slate-600">
                                        <div className="flex justify-between">
                                          <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-1.5 text-primary" /> Medical Card</span>
                                          <span className="text-emerald-600">{drv.compliance.medical}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-1.5 text-primary" /> BGC Clearance</span>
                                          <span className="text-emerald-600">{drv.compliance.background}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-1.5 text-primary" /> Safety Seminars</span>
                                          <span className={drv.compliance.training === 'Completed' ? 'text-emerald-600' : 'text-amber-500'}>
                                            {drv.compliance.training}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Column 3: Incident Timeline logger */}
                                    <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3 shadow-sm">
                                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Operational Incident Logs</h4>
                                      {drv.timeline.length > 0 ? (
                                        <div className="space-y-1 text-[11px]">
                                          <div className="font-semibold text-slate-700">{drv.timeline[0].event}</div>
                                          <span className="text-[9px] text-slate-400 block font-mono">{drv.timeline[0].date}</span>
                                        </div>
                                      ) : (
                                        <span className="text-slate-400 text-[11px] block py-3 text-center">Clean Safety Records (90 Days)</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid Cards Layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDrivers.map((drv) => {
                  const isSelected = selectedDriver?.id === drv.id;
                  const isExpired = drv.daysToExpiry <= 0;

                  return (
                    <motion.div
                      key={drv.id}
                      onClick={() => handleRowClick(drv)}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className={`p-4 bg-white border rounded-2xl shadow-sm cursor-pointer text-left transition-all ${
                        isSelected ? 'border-primary shadow-md shadow-primary/5' : 'border-border-gray'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-primary border border-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-text-dark text-xs">{drv.name}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold font-mono">{drv.licenseNumber}</span>
                          </div>
                        </div>
                        {getStatusBadge(drv.status)}
                      </div>

                      {/* Expiry alerts in Grid cards */}
                      {isExpired && (
                        <div className="mt-2.5 bg-rose-50 text-rose-600 border border-rose-100 p-2 rounded-xl text-[10px] font-bold flex items-center space-x-1 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>CDL LICENSE EXPIRED</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-medium">Safety Score</span>
                          <span className={getSafetyTextColor(drv.safetyScore)}>{drv.safetyScore}%</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-medium">Class Category</span>
                          <span>{drv.licenseCategory}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-medium">Active Vehicle</span>
                          <span className="truncate block max-w-[100px]">{drv.currentVehicle}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-medium">Completed Trips</span>
                          <span className="font-mono">{drv.totalTrips}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Detailed Inspector dock */}
        <div>
          <AnimatePresence mode="wait">
            {selectedDriver ? (
              <motion.div
                key={selectedDriver.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-5"
              >
                {/* Header Profile Info */}
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-text-dark tracking-tight leading-none">{selectedDriver.name}</h3>
                    <span className="text-[11px] font-black font-mono text-primary mt-1.5 block leading-none">
                      {selectedDriver.licenseNumber}
                    </span>
                  </div>

                  {/* Circular safety score Progress ring */}
                  <div className="relative w-14 h-14 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="28" cy="28" r={radius} className="stroke-slate-100" strokeWidth="3.5" fill="transparent" />
                      <circle cx="28" cy="28" r={radius} className={getSafetyCircleColor(selectedDriver.safetyScore)} strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={safetyOffset} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-text-dark">
                      {selectedDriver.safetyScore}%
                    </div>
                  </div>
                </div>

                {/* Metrics detail dock */}
                <div className="space-y-3.5 text-[11px] font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">CDL License Class</span>
                    <span>{selectedDriver.licenseCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Experience Hub</span>
                    <span>{selectedDriver.experience} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Contact Phone</span>
                    <span>{selectedDriver.contactNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Average Mileage Ratio</span>
                    <span>{selectedDriver.avgFuelEfficiency} MPG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Assigned Region</span>
                    <span>{selectedDriver.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Current Assignment</span>
                    <span className="text-primary truncate block max-w-[120px] font-bold">{selectedDriver.currentVehicle}</span>
                  </div>
                </div>

                {/* Incident checklist & Emergency details */}
                <div className="pt-4 border-t border-slate-100 space-y-3 text-[11px] font-semibold text-slate-700">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none">Emergency Contact</h4>
                  <p className="text-slate-600 bg-slate-50 border border-border-gray rounded-xl p-2.5 font-medium leading-relaxed">
                    {selectedDriver.emergencyContact}
                  </p>
                </div>

                {/* Smart compliance validation warnings */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2.5">AI Safety Dossier Insights</h4>
                  <div className="space-y-2">
                    {selectedDriver.daysToExpiry <= 0 ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-600">
                        <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                        <span className="text-[10.5px] leading-normal font-semibold">
                          Critical Error: Driving license CDL expired. Excluded from trip dispatch.
                        </span>
                      </div>
                    ) : selectedDriver.daysToExpiry <= 30 ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-amber-600">
                        <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-[10.5px] leading-normal font-semibold">
                          Warning: CDL License expiring in {selectedDriver.daysToExpiry} days. Contact operator immediately.
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50/50 border border-primary/20 rounded-xl flex items-start space-x-2 text-slate-600">
                        <Sparkles className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-[10.5px] leading-normal font-semibold">
                          Dossier holds a {selectedDriver.safetyScore}% safety ratio. Approved for long-distance routes.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Driver Activity Timeline */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Operator Timeline</h4>
                  <div className="relative pl-5 space-y-3.5 text-left border-l-2 border-primary/10">
                    {selectedDriver.timeline.map((item, idx) => (
                      <div key={idx} className="relative text-[11px] font-semibold text-slate-700">
                        <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
                        <span className="text-slate-700 block leading-tight">{item.event}</span>
                        <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setDriverView('details')}
                    className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center shadow-sm"
                  >
                    View Operational Dashboard
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 border border-border-gray p-10 rounded-2xl text-center text-slate-400 text-xs font-semibold py-20">
                Select an operator from the registry to inspect licensing and safety checklists
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Floating Speed Dial Actions dialer */}
      <div className="fixed bottom-6 right-20 z-40 select-none">
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {isDialOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-14 flex flex-col space-y-2 shrink-0"
              >
                <button
                  onClick={() => {
                    setDriverView('add');
                    setIsDialOpen(false);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-border-gray text-[11px] font-bold rounded-xl shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Register Driver</span>
                </button>
                <button
                  onClick={() => {
                    onShowToast('Activating CDL camera scanner...');
                    setIsDialOpen(false);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-border-gray text-[11px] font-bold rounded-xl shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>Scan CDL Document</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onMouseEnter={() => setIsDialOpen(true)}
            onMouseLeave={() => setIsDialOpen(false)}
            onClick={() => setIsDialOpen(!isDialOpen)}
            className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all border-2 border-white cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};
