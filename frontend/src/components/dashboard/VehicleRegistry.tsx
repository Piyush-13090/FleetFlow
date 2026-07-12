import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Download, 
  Upload, 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronRight, 
  Eye, 
  Trash2, 
  Wrench, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Compass, 
  TrendingUp,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Inbox,
  ShieldCheck,
  Truck,
  Edit2
} from 'lucide-react';
import { AddEditVehicle } from './AddEditVehicle';
import { VehicleDetails } from './VehicleDetails';

export interface VehicleData {
  registrationNumber: string;
  name: string;
  type: string;
  capacity: number;
  odometer: number;
  acquisitionCost: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
  lastMaintenance: string;
  assignedDriver: string;
  health: number;
  region: string;
  purchaseDate: string;
  insuranceExpiry: string;
  roadTax: string;
  documents: string[];
  specs: {
    engine: string;
    fuelType: string;
    mpg: number;
    fuelCapacity: number;
  };
  tripsHistory: { id: string; route: string; date: string; status: string }[];
  fuelConsumption: { date: string; gallons: number; cost: number }[];
  maintenanceHistory: { date: string; issue: string; cost: number; shop: string }[];
  timeline: { date: string; event: string }[];
}

interface VehicleRegistryProps {
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

export const VehicleRegistry: React.FC<VehicleRegistryProps> = ({ onShowToast }) => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [maxCapacity, setMaxCapacity] = useState(50000);
  const [sortBy, setSortBy] = useState('odometer');

  const [registryView, setRegistryView] = useState<'list' | 'add' | 'edit' | 'details'>('list');
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleData | null>(null);

  // Floating speed dial menu state
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/fleet/vehicles');
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
        if (data.length > 0 && !selectedVehicle) {
          setSelectedVehicle(data[0]);
        }
      }
    } catch {
      onShowToast('Error loading fleet registry. Make sure Express server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    onShowToast('Syncing satellite odometer telemetry...');
    fetchVehicles();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All Types');
    setSelectedStatus('All Statuses');
    setSelectedRegion('All Regions');
    setMaxCapacity(50000);
    setSortBy('odometer');
    onShowToast('Filters reset.');
  };

  const handleRowClick = (veh: VehicleData) => {
    setSelectedVehicle(veh);
  };

  const toggleRowExpand = (regNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows(prev => ({
      ...prev,
      [regNumber]: !prev[regNumber]
    }));
  };

  const handleDeleteVehicle = async (regNum: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/fleet/vehicles/${regNum}`, { method: 'DELETE' });
      if (res.ok) {
        onShowToast(`Asset #${regNum} decommissioned.`);
        if (selectedVehicle?.registrationNumber === regNum) {
          setSelectedVehicle(null);
        }
        fetchVehicles();
      }
    } catch {
      onShowToast('Connection failed.');
    }
  };



  const handleExportCSV = () => {
    onShowToast('Generating CSV report: Vehicles-Registry-Export.csv');
    setTimeout(() => {
      onShowToast('CSV Downloaded.');
    }, 1000);
  };

  const handleImportCSV = () => {
    onShowToast('Launching fleet CSV parser window...');
  };

  // Filtered/Sorted list
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.assignedDriver.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'All Types' || v.type === selectedType;
    const matchesStatus = selectedStatus === 'All Statuses' || v.status === selectedStatus;
    const matchesRegion = selectedRegion === 'All Regions' || v.region === selectedRegion;
    const matchesCapacity = v.capacity <= maxCapacity;

    return matchesSearch && matchesType && matchesStatus && matchesRegion && matchesCapacity;
  }).sort((a, b) => {
    if (sortBy === 'odometer') return b.odometer - a.odometer;
    if (sortBy === 'cost') return b.acquisitionCost - a.acquisitionCost;
    if (sortBy === 'health') return b.health - a.health;
    return 0;
  });

  // KPI Calculations
  const kpis = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'Available').length,
    onTrip: vehicles.filter(v => v.status === 'On Trip').length,
    maintenance: vehicles.filter(v => v.status === 'In Shop').length
  };

  const getStatusBadge = (status: VehicleData['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse">
            Available
          </span>
        );
      case 'On Trip':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
            On Trip
          </span>
        );
      case 'In Shop':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
            In Shop
          </span>
        );
      case 'Retired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Retired
          </span>
        );
      default:
        return null;
    }
  };

  // Circular health ring maths
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const selectedHealth = selectedVehicle?.health || 100;
  const healthOffset = circumference - (selectedHealth / 100) * circumference;

  if (registryView === 'add' || registryView === 'edit') {
    return (
      <AddEditVehicle
        initialData={vehicleToEdit}
        onClose={() => setRegistryView('list')}
        onShowToast={onShowToast}
        existingVehicles={vehicles}
      />
    );
  }

  if (registryView === 'details' && vehicleToEdit) {
    return (
      <VehicleDetails
        vehicle={vehicleToEdit}
        onClose={() => setRegistryView('list')}
        onEdit={(veh) => {
          setVehicleToEdit(veh);
          setRegistryView('edit');
        }}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <div className="space-y-6 select-none relative pb-16">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-gray/50">
        <div className="text-left">
          <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">
            Vehicle Registry
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
            Manage, monitor, and organize every fleet vehicle from one centralized workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => { setVehicleToEdit(null); setRegistryView('add'); }}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow hover:scale-102 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Vehicle</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleImportCSV}
            className="px-3 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Vehicles</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh Registry Data"
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
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+100% Health</span>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-text-dark tracking-tight leading-none">{kpis.total}</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Total Vehicles</p>
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
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Available Fleet</p>
            </div>
            <div className="w-16 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline dataPoints={[1, 2, 1, 2, 2, 1, 2]} color="#22C55E" />
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
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">Vehicles On Trip</p>
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
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Shop Care</span>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-text-dark tracking-tight leading-none">{kpis.maintenance}</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">In Maintenance</p>
            </div>
            <div className="w-16 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline dataPoints={[1, 0, 1, 1, 2, 1, 1]} color="#EF4444" />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Search & Filter ribbon */}
      <div className="sticky top-16 z-15 bg-white border border-border-gray p-4 rounded-2xl flex flex-wrap items-center gap-3.5 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-800 border-r border-border-gray pr-3.5 py-1 shrink-0">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold">Search & Filters</span>
        </div>

        {/* Global Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search registration, name, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border-gray rounded-xl text-xs focus:bg-white focus:outline-none input-glow transition-all"
          />
        </div>

        {/* Configuration select type */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="All Types">All Configurations</option>
          <option value="Semi-Truck">Semi-Truck</option>
          <option value="Box Truck">Box Truck</option>
          <option value="Delivery Van">Delivery Van</option>
        </select>

        {/* Status select type */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="All Statuses">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
          <option value="Retired">Retired</option>
        </select>

        {/* Region Select */}
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

        {/* Capacity Slider */}
        <div className="flex items-center space-x-2 border border-border-gray rounded-xl px-3 py-2 bg-slate-50 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Max Load:</span>
          <input 
            type="range" 
            min="4000" 
            max="50000" 
            step="1000"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(Number(e.target.value))}
            className="w-20 accent-primary cursor-pointer h-1 rounded bg-slate-200"
          />
          <span className="text-[11px] font-bold text-slate-700 font-mono">{(maxCapacity / 1000).toFixed(0)}k lbs</span>
        </div>

        {/* Sort option */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="odometer">Sort by Odometer</option>
          <option value="cost">Sort by Cost</option>
          <option value="health">Sort by Health</option>
        </select>

        {/* Reset button */}
        {(searchQuery || selectedType !== 'All Types' || selectedStatus !== 'All Statuses' || selectedRegion !== 'All Regions' || maxCapacity !== 50000) && (
          <button
            onClick={handleResetFilters}
            className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Table or Visual Card Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Table vs Grid Switcher */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 tracking-tight uppercase">Fleet Database Listing</span>
            <div className="flex p-0.5 bg-slate-100 border border-border-gray rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                }`}
                title="Grid visual card view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filteredVehicles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-border-gray rounded-2xl p-16 text-center shadow-sm"
              >
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-text-dark">No Vehicles Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Start building your fleet by registering your first vehicle or try resetting search filters.
                </p>
                <button
                  onClick={() => { setVehicleToEdit(null); setRegistryView('add'); }}
                  className="mt-6 px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Register Vehicle
                </button>
              </motion.div>
            ) : viewMode === 'table' ? (
              /* Expandable Table view */
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3.5 pl-5">Vehicle Name</th>
                        <th className="p-3.5">Registration</th>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Odometer</th>
                        <th className="p-3.5">Capacity</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Driver</th>
                        <th className="p-3.5 text-right pr-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-gray/50">
                      {filteredVehicles.map((veh) => {
                        const isSelected = selectedVehicle?.registrationNumber === veh.registrationNumber;
                        const isExpanded = !!expandedRows[veh.registrationNumber];

                        return (
                          <React.Fragment key={veh.registrationNumber}>
                            <tr
                              onClick={() => handleRowClick(veh)}
                              className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${
                                isSelected ? 'bg-primary/[0.02]' : ''
                              }`}
                            >
                              <td className="p-3.5 pl-5 font-semibold text-text-dark">
                                <div className="flex items-center space-x-2.5">
                                  <button
                                    onClick={(e) => toggleRowExpand(veh.registrationNumber, e)}
                                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                  >
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                  </button>
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
                                    <Truck className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold leading-none">{veh.name}</span>
                                    <span className="text-[10px] text-slate-400 mt-1 leading-none">{veh.region}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 font-bold font-mono text-slate-600">{veh.registrationNumber}</td>
                              <td className="p-3.5 text-slate-500 font-medium">{veh.type}</td>
                              <td className="p-3.5 font-mono text-slate-700 font-semibold">{veh.odometer.toLocaleString()} mi</td>
                              <td className="p-3.5 font-mono text-slate-600 font-medium">{veh.capacity.toLocaleString()} lbs</td>
                              <td className="p-3.5">{getStatusBadge(veh.status)}</td>
                              <td className="p-3.5 text-slate-600 font-semibold">{veh.assignedDriver}</td>
                              <td className="p-3.5 text-right pr-5">
                                <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setVehicleToEdit(veh); setRegistryView('details'); }}
                                    className="p-1 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setVehicleToEdit(veh); setRegistryView('edit'); }}
                                    className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Vehicle"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(veh.registrationNumber, e); }}
                                    className="p-1 text-slate-400 hover:text-danger-red hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Decommission vehicle"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Inline Row Expansion Details */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={8} className="p-0 bg-slate-50 border-t border-b border-border-gray/70">
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-5 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-5"
                                  >
                                    {/* Column 1: Specifications */}
                                    <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3 shadow-sm text-left">
                                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Specifications</h4>
                                      <div className="grid grid-cols-2 gap-y-2 gap-x-1.5 text-[11px] font-semibold">
                                        <div>
                                          <span className="text-slate-400 block text-[9.5px]">Engine Model</span>
                                          <span className="text-slate-700">{veh.specs.engine}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block text-[9.5px]">Fuel System</span>
                                          <span className="text-slate-700">{veh.specs.fuelType} ({veh.specs.fuelCapacity} Gal)</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block text-[9.5px]">Fuel Economy</span>
                                          <span className="text-slate-700 font-mono">{veh.specs.mpg} MPG</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block text-[9.5px]">Acquisition Cost</span>
                                          <span className="text-slate-700 font-mono">${veh.acquisitionCost.toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Column 2: Documents Upload Checklists */}
                                    <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3 shadow-sm text-left">
                                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Compliance Documents</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                          <span className="text-slate-600 flex items-center">
                                            <FileText className="w-3.5 h-3.5 text-primary mr-1.5" />
                                            Insurance Policy
                                          </span>
                                          {veh.documents.includes('Insurance') ? (
                                            <span className="text-emerald-600 flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Active</span>
                                          ) : (
                                            <span className="text-rose-500 flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Expired</span>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                          <span className="text-slate-600 flex items-center">
                                            <FileText className="w-3.5 h-3.5 text-primary mr-1.5" />
                                            Registration Card
                                          </span>
                                          {veh.documents.includes('Registration') ? (
                                            <span className="text-emerald-600 flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Active</span>
                                          ) : (
                                            <span className="text-rose-500 flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Expired</span>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                          <span className="text-slate-600 flex items-center">
                                            <FileText className="w-3.5 h-3.5 text-primary mr-1.5" />
                                            IFTA Permits
                                          </span>
                                          {veh.documents.includes('Permits') ? (
                                            <span className="text-emerald-600 flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Compliant</span>
                                          ) : (
                                            <span className="text-rose-500 flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Missing</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Column 3: Maintenance History */}
                                    <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3 shadow-sm text-left">
                                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Last Repair Logs</h4>
                                      {veh.maintenanceHistory.length > 0 ? (
                                        <div className="space-y-1 text-[11px]">
                                          <div className="flex justify-between items-center text-slate-700 font-semibold">
                                            <span className="truncate max-w-[100px]">{veh.maintenanceHistory[0].issue}</span>
                                            <span className="font-bold font-mono text-slate-500">${veh.maintenanceHistory[0].cost}</span>
                                          </div>
                                          <span className="text-[9px] text-slate-400 block font-medium">Logged on {veh.maintenanceHistory[0].date}</span>
                                        </div>
                                      ) : (
                                        <div className="text-[11px] text-slate-400 font-medium py-3 text-center">No maintenance logs found</div>
                                      )}
                                    </div>
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              /* visual Grid Cards view */
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {filteredVehicles.map((veh) => {
                  const isSelected = selectedVehicle?.registrationNumber === veh.registrationNumber;
                  return (
                    <motion.div
                      key={veh.registrationNumber}
                      onClick={() => handleRowClick(veh)}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className={`p-4 bg-white border rounded-2xl shadow-sm cursor-pointer text-left transition-all ${
                        isSelected ? 'border-primary shadow-md shadow-primary/5' : 'border-border-gray'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
                            <Truck className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-text-dark text-xs">{veh.name}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold font-mono">{veh.registrationNumber}</span>
                          </div>
                        </div>
                        {getStatusBadge(veh.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-medium">Odometer</span>
                          <span className="font-mono">{veh.odometer.toLocaleString()} mi</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-medium">Driver</span>
                          <span>{veh.assignedDriver}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-medium">Region</span>
                          <span>{veh.region}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-medium">Fuel Level</span>
                          <span className="text-primary font-mono">82%</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Detailed Inspection dock panel */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedVehicle ? (
              <motion.div
                key={selectedVehicle.registrationNumber}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-5"
              >
                {/* Visual Header */}
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-text-dark tracking-tight leading-none">
                      {selectedVehicle.name}
                    </h3>
                    <span className="text-[11px] font-black font-mono text-primary mt-1.5 block leading-none">
                      #{selectedVehicle.registrationNumber}
                    </span>
                  </div>

                  {/* Circular health meter */}
                  <div className="relative w-14 h-14 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        className="stroke-slate-100"
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        className="stroke-primary"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={healthOffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-text-dark">
                      {selectedVehicle.health}%
                    </div>
                  </div>
                </div>

                {/* Logistics details list */}
                <div className="space-y-3.5 text-[11px] font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Vehicle Configuration</span>
                    <span>{selectedVehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Purchase Registry Date</span>
                    <span>{selectedVehicle.purchaseDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Current Odometer Log</span>
                    <span className="font-mono">{selectedVehicle.odometer.toLocaleString()} miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Corporate Region Hub</span>
                    <span>{selectedVehicle.region}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Insurance Policy Expiry</span>
                    <span className="bg-blue-50 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[10px] font-black font-mono">
                      {selectedVehicle.insuranceExpiry}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Road Tax Compliance</span>
                    <span className={selectedVehicle.roadTax === 'Compliant' ? 'text-emerald-600' : 'text-rose-500'}>
                      {selectedVehicle.roadTax}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Assigned Driver Operator</span>
                    <span className="text-primary font-bold">{selectedVehicle.assignedDriver}</span>
                  </div>
                </div>

                {/* Documents Indicator Icons */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2.5">Upload Indicators</h4>
                  <div className="flex space-x-3">
                    <div className={`p-2 rounded-xl border flex flex-col items-center justify-center flex-1 ${
                      selectedVehicle.documents.includes('Insurance') ? 'bg-blue-50/50 border-primary/20 text-primary' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <ShieldCheck className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-bold">Insurance</span>
                    </div>
                    <div className={`p-2 rounded-xl border flex flex-col items-center justify-center flex-1 ${
                      selectedVehicle.documents.includes('Registration') ? 'bg-blue-50/50 border-primary/20 text-primary' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <FileText className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-bold">Registration</span>
                    </div>
                    <div className={`p-2 rounded-xl border flex flex-col items-center justify-center flex-1 ${
                      selectedVehicle.documents.includes('Permits') ? 'bg-blue-50/50 border-primary/20 text-primary' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <SlidersHorizontal className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-bold">Permits</span>
                    </div>
                  </div>
                </div>

                {/* Recent Vehicle Activity Timeline */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Recent Activity Timeline</h4>
                  <div className="relative pl-5 space-y-3.5 text-left border-l-2 border-primary/10">
                    {selectedVehicle.timeline.map((item, idx) => (
                      <div key={idx} className="relative text-[11px] font-semibold text-slate-700">
                        {/* Dot marker */}
                        <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
                        <span className="text-slate-700 block leading-tight">{item.event}</span>
                        <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 border border-border-gray p-10 rounded-2xl text-center text-slate-400 text-xs font-semibold py-20">
                Select a vehicle from the registry to inspect telemetry and documents
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Speed Dial Actions dialer */}
      <div className="fixed bottom-6 right-20 z-40 select-none">
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {isSpeedDialOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-14 flex flex-col space-y-2 shrink-0"
              >
                <button
                  onClick={() => { setVehicleToEdit(null); setRegistryView('add'); setIsSpeedDialOpen(false); }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-border-gray text-[11px] font-bold rounded-xl shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Register Vehicle</span>
                </button>
                <button
                  onClick={() => { handleImportCSV(); setIsSpeedDialOpen(false); }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-border-gray text-[11px] font-bold rounded-xl shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Import Fleet</span>
                </button>
                <button
                  onClick={() => { onShowToast('Activating camera scanner...'); setIsSpeedDialOpen(false); }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-border-gray text-[11px] font-bold rounded-xl shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>Scan Registration</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onMouseEnter={() => setIsSpeedDialOpen(true)}
            onMouseLeave={() => setIsSpeedDialOpen(false)}
            onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
            className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all border-2 border-white cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};
