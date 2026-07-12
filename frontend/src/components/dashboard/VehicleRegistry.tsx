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
import { apiFetch } from '../../lib/api';
import { SectionHeader } from '../ui/SectionHeader';
import { KpiTile } from '../ui/KpiTile';
import { StatusPill } from '../ui/StatusPill';
import { Segmented } from '../ui/Segmented';
import { Ring } from '../ui/Ring';
import { Reveal } from '../ui/Reveal';
import { CardLabel } from '../ui/Card';
import { Sparkline as SharedSparkline } from '../ui/Sparkline';

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
      const res = await apiFetch('/api/fleet/vehicles');
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
      const res = await apiFetch(`/api/fleet/vehicles/${regNum}`, { method: 'DELETE' });
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
    <Reveal className="space-y-6 select-none relative pb-16">
      {/* Header Panel */}
      <SectionHeader
        title="Vehicle Registry"
        subtitle="Manage, monitor, and organize every fleet vehicle from one centralized workspace."
        actions={
          <>
            <button
              onClick={() => { setVehicleToEdit(null); setRegistryView('add'); }}
              className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cc-shadow-sm hover:scale-[1.02] transition-[transform,background-color] cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Add Vehicle</span>
            </button>
            
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-semibold rounded-[12px] transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleImportCSV}
              className="px-3 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-semibold rounded-[12px] transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Vehicles</span>
            </button>

            <button
              onClick={handleRefresh}
              className="p-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[#0A0A0A] rounded-[12px] transition-all cursor-pointer"
              title="Refresh Registry Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          icon={Compass}
          value={kpis.total}
          label="Total Vehicles"
          sublabel="Currently operational"
          delta="+8%"
          deltaUp={true}
          spark={[4, 5, 5, 5, 6, 6, 6]}
          color="#2563EB"
          tint="#EFF4FF"
        />
        <KpiTile
          icon={CheckCircle}
          value={kpis.available}
          label="Available Fleet"
          sublabel="Ready for dispatch"
          delta="Available"
          deltaUp={true}
          spark={[1, 2, 1, 2, 2, 1, 2]}
          color="#059669"
          tint="#ECFDF5"
        />
        <KpiTile
          icon={TrendingUp}
          value={kpis.onTrip}
          label="Vehicles On Trip"
          sublabel="Currently dispatched"
          delta="On Mission"
          deltaUp={true}
          spark={[2, 3, 3, 2, 3, 4, 3]}
          color="#2563EB"
          tint="#EFF4FF"
        />
        <KpiTile
          icon={Wrench}
          value={kpis.maintenance}
          label="In Maintenance"
          sublabel="Service ongoing"
          delta="Shop Care"
          deltaUp={false}
          spark={[1, 0, 1, 1, 2, 1, 1]}
          color="#DC2626"
          tint="#FEF2F2"
        />
      </div>

      {/* Sticky Search & Filter ribbon */}
      <div className="sticky top-0 z-15 bg-white border border-[#E5E7EB] p-4 rounded-[16px] flex flex-wrap items-center gap-3.5 cc-shadow-sm">
        <div className="flex items-center space-x-2 text-[#0A0A0A] border-r border-[#E5E7EB] pr-3.5 py-1 shrink-0">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">Search & Filters</span>
        </div>

        {/* Global Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search registration, name, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] text-xs focus:bg-white focus:outline-none input-glow transition-all"
          />
        </div>

        {/* Configuration select type */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer cc-focus"
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
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer cc-focus"
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
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer cc-focus"
        >
          <option value="All Regions">All Regions</option>
          <option value="East Coast">East Coast</option>
          <option value="West Coast">West Coast</option>
          <option value="Midwest">Midwest</option>
          <option value="South">South</option>
        </select>

        {/* Capacity Slider */}
        <div className="flex items-center space-x-2 border border-[#E5E7EB] rounded-[12px] px-3 py-2 bg-[#F9FAFB] shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Max Load:</span>
          <input 
            type="range" 
            min="4000" 
            max="50000" 
            step="1000"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(Number(e.target.value))}
            className="w-20 accent-primary cursor-pointer h-1 rounded bg-[#E5E7EB]"
          />
          <span className="text-[11px] font-bold text-[#0A0A0A] font-mono tabular-nums">{(maxCapacity / 1000).toFixed(0)}k lbs</span>
        </div>

        {/* Sort option */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer cc-focus"
        >
          <option value="odometer">Sort by Odometer</option>
          <option value="cost">Sort by Cost</option>
          <option value="health">Sort by Health</option>
        </select>

        {/* Reset button */}
        {(searchQuery || selectedType !== 'All Types' || selectedStatus !== 'All Statuses' || selectedRegion !== 'All Regions' || maxCapacity !== 50000) && (
          <button
            onClick={handleResetFilters}
            className="px-2 py-1 text-xs font-bold text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
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
            <span className="text-xs font-bold text-[#4B5563] tracking-tight uppercase">Fleet Database Listing</span>
            <Segmented
              size="sm"
              value={viewMode}
              onChange={(val) => setViewMode(val as 'table' | 'grid')}
              options={[
                { id: 'table', label: <><List className="w-3.5 h-3.5" /><span>List</span></> },
                { id: 'grid', label: <><LayoutGrid className="w-3.5 h-3.5" /><span>Grid</span></> }
              ]}
            />
          </div>

          <AnimatePresence mode="wait">
            {filteredVehicles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-[#E5E7EB] rounded-[16px] p-16 text-center cc-shadow-sm"
              >
                <Inbox className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
                <h3 className="text-sm font-bold text-[#0A0A0A]">No Vehicles Found</h3>
                <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto leading-relaxed">
                  Start building your fleet by registering your first vehicle or try resetting search filters.
                </p>
                <button
                  onClick={() => { setVehicleToEdit(null); setRegistryView('add'); }}
                  className="mt-6 px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-[12px] transition-colors cursor-pointer"
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
                className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden"
              >
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[850px] border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
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
                    <tbody className="divide-y divide-[#E5E7EB]/50">
                      {filteredVehicles.map((veh) => {
                        const isSelected = selectedVehicle?.registrationNumber === veh.registrationNumber;
                        const isExpanded = !!expandedRows[veh.registrationNumber];

                        return (
                          <React.Fragment key={veh.registrationNumber}>
                            <tr
                              onClick={() => handleRowClick(veh)}
                              className={`hover:bg-[#F9FAFB]/50 transition-colors cursor-pointer group ${
                                isSelected ? 'bg-[#EFF4FF]/20' : ''
                              }`}
                            >
                              <td className="p-3.5 pl-5 font-semibold text-[#0A0A0A]">
                                <div className="flex items-center space-x-2.5">
                                  <button
                                    onClick={(e) => toggleRowExpand(veh.registrationNumber, e)}
                                    className="p-1 rounded hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
                                  >
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                  </button>
                                  <div className="w-8 h-8 rounded-[8px] bg-[#EFF4FF] text-primary flex items-center justify-center shrink-0">
                                    <Truck className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-bold leading-none">{veh.name}</span>
                                    <span className="text-[10px] text-[#9CA3AF] mt-1.5 leading-none">{veh.region}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 font-bold font-mono text-[#4B5563]">{veh.registrationNumber}</td>
                              <td className="p-3.5 text-[#4B5563] font-medium">{veh.type}</td>
                              <td className="p-3.5 font-mono text-[#0A0A0A] font-semibold tabular-nums">{veh.odometer.toLocaleString()} mi</td>
                              <td className="p-3.5 font-mono text-[#4B5563] font-medium tabular-nums">{veh.capacity.toLocaleString()} lbs</td>
                              <td className="p-3.5">
                                <StatusPill status={veh.status} pulse={veh.status === 'Available'} />
                              </td>
                              <td className="p-3.5 text-[#4B5563] font-semibold">{veh.assignedDriver}</td>
                              <td className="p-3.5 text-right pr-5">
                                <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setVehicleToEdit(veh); setRegistryView('details'); }}
                                    className="p-1 text-[#9CA3AF] hover:text-[#2563EB] hover:bg-[#EFF4FF] rounded-[8px] transition-colors cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setVehicleToEdit(veh); setRegistryView('edit'); }}
                                    className="p-1 text-[#9CA3AF] hover:text-[#D97706] hover:bg-[#FFFBEB] rounded-[8px] transition-colors cursor-pointer"
                                    title="Edit Vehicle"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(veh.registrationNumber, e); }}
                                    className="p-1 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-[8px] transition-colors cursor-pointer"
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
                                <td colSpan={8} className="p-0 bg-[#F9FAFB] border-t border-b border-[#E5E7EB]">
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-5 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-5"
                                  >
                                    {/* Column 1: Specifications */}
                                    <div className="bg-white border border-[#EEF1F4] p-4 rounded-[12px] space-y-3 cc-shadow-sm text-left">
                                      <CardLabel>Specifications</CardLabel>
                                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-[11px] font-semibold">
                                        <div>
                                          <span className="text-[#9CA3AF] block text-[9.5px] font-medium leading-none mb-1">Engine Model</span>
                                          <span className="text-[#0A0A0A]">{veh.specs.engine}</span>
                                        </div>
                                        <div>
                                          <span className="text-[#9CA3AF] block text-[9.5px] font-medium leading-none mb-1">Fuel System</span>
                                          <span className="text-[#0A0A0A]">{veh.specs.fuelType} ({veh.specs.fuelCapacity} Gal)</span>
                                        </div>
                                        <div>
                                          <span className="text-[#9CA3AF] block text-[9.5px] font-medium leading-none mb-1">Fuel Economy</span>
                                          <span className="text-[#0A0A0A] font-mono tabular-nums">{veh.specs.mpg} MPG</span>
                                        </div>
                                        <div>
                                          <span className="text-[#9CA3AF] block text-[9.5px] font-medium leading-none mb-1">Acquisition Cost</span>
                                          <span className="text-[#0A0A0A] font-mono tabular-nums">${veh.acquisitionCost.toLocaleString()}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Column 2: Documents Upload Checklists */}
                                    <div className="bg-white border border-[#EEF1F4] p-4 rounded-[12px] space-y-3 cc-shadow-sm text-left">
                                      <CardLabel>Compliance Documents</CardLabel>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                          <span className="text-[#4B5563] flex items-center">
                                            <FileText className="w-3.5 h-3.5 text-primary mr-1.5" />
                                            Insurance Policy
                                          </span>
                                          {veh.documents.includes('Insurance') ? (
                                            <span className="text-[#059669] flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Active</span>
                                          ) : (
                                            <span className="text-[#DC2626] flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Expired</span>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                          <span className="text-[#4B5563] flex items-center">
                                            <FileText className="w-3.5 h-3.5 text-primary mr-1.5" />
                                            Registration Card
                                          </span>
                                          {veh.documents.includes('Registration') ? (
                                            <span className="text-[#059669] flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Active</span>
                                          ) : (
                                            <span className="text-[#DC2626] flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Expired</span>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                          <span className="text-[#4B5563] flex items-center">
                                            <FileText className="w-3.5 h-3.5 text-primary mr-1.5" />
                                            IFTA Permits
                                          </span>
                                          {veh.documents.includes('Permits') ? (
                                            <span className="text-[#059669] flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Compliant</span>
                                          ) : (
                                            <span className="text-[#DC2626] flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Missing</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Column 3: Maintenance History */}
                                    <div className="bg-white border border-[#EEF1F4] p-4 rounded-[12px] space-y-3 cc-shadow-sm text-left">
                                      <CardLabel>Last Repair Logs</CardLabel>
                                      {veh.maintenanceHistory.length > 0 ? (
                                        <div className="space-y-1.5 text-[11px]">
                                          <div className="flex justify-between items-center text-[#0A0A0A] font-semibold">
                                            <span className="truncate max-w-[120px]">{veh.maintenanceHistory[0].issue}</span>
                                            <span className="font-bold font-mono text-[#4B5563] tabular-nums">${veh.maintenanceHistory[0].cost}</span>
                                          </div>
                                          <span className="text-[9px] text-[#9CA3AF] block font-medium">Logged on {veh.maintenanceHistory[0].date}</span>
                                        </div>
                                      ) : (
                                        <div className="text-[11px] text-[#9CA3AF] font-medium py-3 text-center">No maintenance logs found</div>
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
                      className={`p-4 bg-white border rounded-[16px] cc-shadow-sm cursor-pointer text-left transition-all ${
                        isSelected ? 'border-primary shadow-md shadow-primary/5' : 'border-[#E5E7EB]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-[8px] bg-[#EFF4FF] text-primary flex items-center justify-center shrink-0">
                            <Truck className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#0A0A0A] text-xs leading-none mb-1">{veh.name}</h4>
                            <span className="text-[10px] text-[#9CA3AF] font-bold font-mono">{veh.registrationNumber}</span>
                          </div>
                        </div>
                        <StatusPill status={veh.status} pulse={veh.status === 'Available'} />
                      </div>

                      <div className="mt-4 flex justify-between items-end border-t border-[#E5E7EB]/50 pt-3">
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-[#4B5563] flex-1">
                          <div>
                            <span className="text-[9px] text-[#9CA3AF] block font-medium">Odometer</span>
                            <span className="font-mono tabular-nums">{veh.odometer.toLocaleString()} mi</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#9CA3AF] block font-medium">Driver</span>
                            <span>{veh.assignedDriver}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#9CA3AF] block font-medium">Region</span>
                            <span>{veh.region}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#9CA3AF] block font-medium">Fuel Level</span>
                            <span className="text-[#2563EB] font-mono tabular-nums">82%</span>
                          </div>
                        </div>
                        <div className="w-16 shrink-0 opacity-80" title="Historical Utilization">
                          <span className="text-[8px] text-[#9CA3AF] block font-bold text-right uppercase tracking-wider mb-1">Utilization</span>
                          <SharedSparkline data={[65, 70, 72, 80, 84, 82, 84]} color="#2563EB" width={64} height={20} area />
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
                className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-5"
              >
                {/* Visual Header */}
                <div className="pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0A0A0A] tracking-tight leading-none">
                      {selectedVehicle.name}
                    </h3>
                    <span className="text-[11px] font-bold font-mono text-primary mt-1.5 block leading-none">
                      #{selectedVehicle.registrationNumber}
                    </span>
                  </div>

                  {/* Circular health meter with Ring primitive */}
                  <Ring value={selectedVehicle.health} size={56} stroke={4} />
                </div>

                {/* Logistics details list */}
                <div className="space-y-3.5 text-[11px] font-semibold text-[#4B5563]">
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Vehicle Configuration</span>
                    <span className="text-[#0A0A0A]">{selectedVehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Purchase Registry Date</span>
                    <span className="text-[#0A0A0A]">{selectedVehicle.purchaseDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Current Odometer Log</span>
                    <span className="font-mono text-[#0A0A0A] tabular-nums">{selectedVehicle.odometer.toLocaleString()} miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Corporate Region Hub</span>
                    <span className="text-[#0A0A0A]">{selectedVehicle.region}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9CA3AF] font-medium">Insurance Policy Expiry</span>
                    <span className="bg-[#EFF4FF] text-primary border border-[#DBE6FF] px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold font-mono tabular-nums">
                      {selectedVehicle.insuranceExpiry}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Road Tax Compliance</span>
                    <span className={selectedVehicle.roadTax === 'Compliant' ? 'text-[#059669]' : 'text-[#DC2626]'}>
                      {selectedVehicle.roadTax}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Assigned Driver Operator</span>
                    <span className="text-[#2563EB] font-bold">{selectedVehicle.assignedDriver}</span>
                  </div>
                </div>

                {/* Documents Indicator Icons */}
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <CardLabel className="mb-2.5">Upload Indicators</CardLabel>
                  <div className="flex space-x-3">
                    <div className={`p-2.5 rounded-[12px] border flex flex-col items-center justify-center flex-1 ${
                      selectedVehicle.documents.includes('Insurance') ? 'bg-[#EFF4FF] border-[#DBE6FF] text-[#2563EB]' : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF]'
                    }`}>
                      <ShieldCheck className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-bold">Insurance</span>
                    </div>
                    <div className={`p-2.5 rounded-[12px] border flex flex-col items-center justify-center flex-1 ${
                      selectedVehicle.documents.includes('Registration') ? 'bg-[#EFF4FF] border-[#DBE6FF] text-[#2563EB]' : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF]'
                    }`}>
                      <FileText className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-bold">Registration</span>
                    </div>
                    <div className={`p-2.5 rounded-[12px] border flex flex-col items-center justify-center flex-1 ${
                      selectedVehicle.documents.includes('Permits') ? 'bg-[#EFF4FF] border-[#DBE6FF] text-[#2563EB]' : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF]'
                    }`}>
                      <SlidersHorizontal className="w-5 h-5 mb-1" />
                      <span className="text-[9px] font-bold">Permits</span>
                    </div>
                  </div>
                </div>

                {/* Recent Vehicle Activity Timeline */}
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <CardLabel className="mb-3">Recent Activity Timeline</CardLabel>
                  <div className="relative pl-5 space-y-3.5 text-left border-l border-[#E5E7EB]">
                    {selectedVehicle.timeline.map((item, idx) => (
                      <div key={idx} className="relative text-[11px] font-semibold text-[#4B5563]">
                        {/* Dot marker */}
                        <div className="absolute -left-[21px] top-1 w-2 h-2 bg-[#2563EB] border border-white rounded-full" />
                        <span className="text-[#0A0A0A] block leading-tight">{item.event}</span>
                        <span className="text-[9px] text-[#9CA3AF] font-mono block mt-0.5 tabular-nums">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-10 rounded-[16px] text-center text-[#9CA3AF] text-xs font-semibold py-20">
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
                  className="px-3.5 py-2 bg-white hover:bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] text-[11px] font-bold rounded-[12px] cc-shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer hover:text-[#0A0A0A]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Register Vehicle</span>
                </button>
                <button
                  onClick={() => { handleImportCSV(); setIsSpeedDialOpen(false); }}
                  className="px-3.5 py-2 bg-white hover:bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] text-[11px] font-bold rounded-[12px] cc-shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer hover:text-[#0A0A0A]"
                >
                  <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Import Fleet</span>
                </button>
                <button
                  onClick={() => { onShowToast('Activating camera scanner...'); setIsSpeedDialOpen(false); }}
                  className="px-3.5 py-2 bg-white hover:bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] text-[11px] font-bold rounded-[12px] cc-shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer hover:text-[#0A0A0A]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Scan Registration</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onMouseEnter={() => setIsSpeedDialOpen(true)}
            onMouseLeave={() => setIsSpeedDialOpen(false)}
            onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
            className="w-12 h-12 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all border border-[#E5E7EB] cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Reveal>
  );
};
