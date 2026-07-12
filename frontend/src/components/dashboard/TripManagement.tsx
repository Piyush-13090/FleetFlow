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
  AlertTriangle, 
  User, 
  Truck,
  Sparkles,
  Info,
  Check,
  XCircle,
  Play
} from 'lucide-react';
import type { DriverData } from './DriverManagement';
import { AddEditTrip } from './AddEditTrip';
import { TripDetails } from './TripDetails';
import { apiFetch } from '../../lib/api';

interface TripData {
  id: string;
  vehicle: string;
  vehicleType: string;
  driver: string;
  route: string;
  status: 'Draft' | 'Dispatched' | 'On Trip' | 'Delayed' | 'Completed' | 'Cancelled';
  cargo: string;
  eta: string;
  health: number;
  region: string;
  cargoWeight?: number; // in lbs
  distance?: number; // in miles
  departureTime?: string;
  timeline?: { time: string; event: string }[];
  fuelLogged?: number; // in gallons
  expenses?: number; // in USD
}



interface TripManagementProps {
  onShowToast: (msg: string) => void;
}

// Custom pure SVG Sparkline
const Sparkline: React.FC<{ dataPoints: number[]; color: string }> = ({ dataPoints, color }) => {
  const width = 80;
  const height = 24;
  const max = Math.max(...dataPoints);
  const min = Math.min(...dataPoints);
  const range = max - min || 1;
  const points = dataPoints.map((val, idx) => {
    const x = (idx / (dataPoints.length - 1)) * width;
    const y = height - 2 - ((val - min) / range) * (height - 6);
    return `${x},${y}`;
  }).join(' ');
  const pathD = `M ${points}`;
  return (
    <svg width={width} height={height} className="overflow-visible select-none">
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const TripManagement: React.FC<TripManagementProps> = ({ onShowToast }) => {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [sortBy, setSortBy] = useState('newest');

  // Trip creation view state
  const [tripView, setTripView] = useState<'list' | 'add' | 'edit' | 'details'>('list');

  const fetchOperationalData = async () => {
    setIsLoading(true);
    try {
      const [tripsRes, driversRes] = await Promise.all([
        apiFetch('/api/fleet/trips'),
        apiFetch('/api/fleet/drivers')
      ]);

      if (tripsRes.ok) {
        const rawTrips = await tripsRes.json();
        // Normalize status names for enterprise display consistency
        const normalized = rawTrips.map((t: any) => ({
          ...t,
          status: t.status === 'On Trip' ? 'Dispatched' : t.status === 'In Shop' ? 'Draft' : t.status,
          cargoWeight: t.cargoWeight || 22000,
          distance: t.distance || 320,
          departureTime: t.departureTime || '08:30 AM',
          timeline: t.timeline || [
            { time: '08:30 AM', event: 'Trip Created & Logged' },
            { time: '09:00 AM', event: 'Asset Dispatched from Terminal' }
          ],
          fuelLogged: t.fuelLogged || 85,
          expenses: t.expenses || 420
        }));
        setTrips(normalized);
        if (normalized.length > 0 && !selectedTrip) {
          setSelectedTrip(normalized[0]);
        }
      }

      if (driversRes.ok) setDrivers(await driversRes.json());

    } catch {
      onShowToast('Error loading active dispatch operational logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    onShowToast('Syncing real-time dispatch routes and locations...');
    fetchOperationalData();
  };

  // Dispatch Draft Trip Trigger
  const handleDispatchTrip = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onShowToast(`Dispatching Trip #${tripId}...`);
    
    // Simulate updating backend DB
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: 'Dispatched',
          timeline: [
            { time: '10:15 AM', event: 'Operator Dispatched to Route' },
            ...(t.timeline || [])
          ]
        };
      }
      return t;
    }));

    onShowToast(`Trip #${tripId} has been successfully Dispatched!`);
  };

  // Complete Trip Trigger
  const handleCompleteTrip = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onShowToast(`Completing Trip #${tripId}...`);

    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: 'Completed',
          timeline: [
            { time: '12:45 PM', event: 'Trip Arrived at Destination Hub' },
            ...(t.timeline || [])
          ]
        };
      }
      return t;
    }));

    onShowToast(`Trip #${tripId} marked Completed. Asset logs released.`);
  };

  // Cancel Trip Trigger
  const handleCancelTrip = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onShowToast(`Cancelling Trip #${tripId}...`);

    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return { ...t, status: 'Cancelled' };
      }
      return t;
    }));
  };

  const handleUpdateTripStatus = (tripId: string, newStatus: 'Completed' | 'Cancelled') => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
    setSelectedTrip(prev => {
      if (prev && prev.id === tripId) {
        return { ...prev, status: newStatus };
      }
      return prev;
    });
  };




  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Statuses');
    setSelectedRegion('All Regions');
    setSortBy('newest');
    onShowToast('Filters reset.');
  };

  const toggleRowExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter and sort logistics trips
  const filteredTrips = trips.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All Statuses' || t.status === selectedStatus;
    const matchesRegion = selectedRegion === 'All Regions' || t.region === selectedRegion;

    return matchesSearch && matchesStatus && matchesRegion;
  }).sort((a, b) => {
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    if (sortBy === 'distance') return (b.distance || 0) - (a.distance || 0);
    return 0;
  });

  const getStatusBadge = (status: TripData['status']) => {
    switch (status) {
      case 'Draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Draft
          </span>
        );
      case 'Dispatched':
      case 'On Trip':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">
            Dispatched
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
            Delayed
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // KPI calculations
  const kpis = {
    active: trips.filter(t => t.status === 'Dispatched' || t.status === 'Delayed').length,
    draft: trips.filter(t => t.status === 'Draft').length,
    completed: trips.filter(t => t.status === 'Completed').length,
    cancelled: trips.filter(t => t.status === 'Cancelled').length,
    utilization: 84
  };

  if (tripView === 'add' || tripView === 'edit') {
    return (
      <AddEditTrip
        initialData={tripView === 'edit' ? selectedTrip : null}
        onClose={() => setTripView('list')}
        onShowToast={onShowToast}
      />
    );
  }

  if (tripView === 'details' && selectedTrip) {
    return (
      <TripDetails
        trip={selectedTrip}
        onClose={() => setTripView('list')}
        onEdit={() => setTripView('edit')}
        onShowToast={onShowToast}
        onUpdateStatus={handleUpdateTripStatus}
      />
    );
  }

  return (
    <div className="space-y-6 select-none relative pb-16">
      
      {/* Header operations ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-gray/50 text-left">
        <div>
          <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">Trip Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
            Create, dispatch, monitor, and complete transport operations while tracking vehicles, drivers, cargo, and delivery progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setTripView('add')}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm hover:scale-102 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Create Trip</span>
          </button>
          
          <button
            onClick={() => onShowToast('Exporting Operations Trip Logs as CSV...')}
            className="px-3 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Trips</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh Operations Center"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Analytics KPI counters */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { id: 'active', label: 'Active Trips', val: kpis.active, trend: '+2 this hour', spark: [3, 4, 3, 5, 4, 6, 5], color: '#2563EB' },
          { id: 'draft', label: 'Draft Trips', val: kpis.draft, trend: 'Pending dispatch', spark: [1, 2, 1, 1, 2, 2, 1], color: '#64748B' },
          { id: 'completed', label: 'Completed Today', val: kpis.completed, trend: '+8 completed', spark: [4, 5, 5, 6, 7, 8, 8], color: '#22C55E' },
          { id: 'cancelled', label: 'Cancelled', val: kpis.cancelled, trend: '0 in last 48h', spark: [1, 0, 0, 0, 1, 0, 0], color: '#64748B' },
          { id: 'distance', label: 'Average Distance', val: '312 mi', trend: 'Fleet average', spark: [310, 312, 308, 315, 312], color: '#2563EB' },
          { id: 'utilization', label: 'Fleet Utilization', val: `${kpis.utilization}%`, trend: '+2.4% vs yesterday', spark: [80, 82, 81, 84, 84], color: '#22C55E' }
        ].map(card => (
          <div key={card.id} className="p-4 bg-white border border-border-gray rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group cursor-pointer text-left">
            <div>
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider leading-none block">{card.label}</span>
              <h3 className="text-xl font-black text-text-dark tracking-tight leading-none mt-2">{card.val}</h3>
            </div>
            <div className="mt-4 flex justify-between items-end">
              <span className="text-[9px] font-bold text-slate-400 block leading-none">{card.trend}</span>
              <div className="w-12 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <Sparkline dataPoints={card.spark} color={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Sticky Filter Ribbon */}
      <div className="sticky top-16 z-15 bg-white border border-border-gray p-4 rounded-2xl flex flex-wrap items-center gap-3.5 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-800 border-r border-border-gray pr-3.5 py-1 shrink-0">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold">Search & Filters</span>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search trip ID, route, driver name..."
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
          <option value="Draft">Draft</option>
          <option value="Dispatched">Dispatched</option>
          <option value="Delayed">Delayed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
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

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="newest">Sort by Newest</option>
          <option value="distance">Sort by Distance</option>
        </select>

        {(searchQuery || selectedStatus !== 'All Statuses' || selectedRegion !== 'All Regions') && (
          <button onClick={handleResetFilters} className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">
            Reset
          </button>
        )}
      </div>

      {/* Main workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Data Table and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden text-left">
            <div className="p-4 border-b border-border-gray/50">
              <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase">Operational Trips Database</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Real-time scheduling logs and active dispatch coordinates.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Trip ID</th>
                    <th className="p-3.5">Assigned Route</th>
                    <th className="p-3.5">Cargo Config</th>
                    <th className="p-3.5">Assigned Asset</th>
                    <th className="p-3.5">Odometer Distance</th>
                    <th className="p-3.5">Dispatch State</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gray/50">
                  {filteredTrips.map(trip => {
                    const isSelected = selectedTrip?.id === trip.id;
                    const isExpanded = !!expandedRows[trip.id];

                    return (
                      <React.Fragment key={trip.id}>
                        <tr
                          onClick={() => setSelectedTrip(trip)}
                          className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-primary/[0.02]' : ''
                          }`}
                        >
                          <td className="p-3.5 pl-5 font-semibold text-text-dark">
                            <div className="flex items-center space-x-2.5">
                              <button
                                onClick={(e) => toggleRowExpand(trip.id, e)}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              >
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                              <span className="font-bold font-mono text-slate-600">{trip.id}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700">{trip.route}</td>
                          <td className="p-3.5 text-slate-500 font-semibold">{trip.cargo}</td>
                          <td className="p-3.5 font-bold">
                            <div className="flex items-center space-x-1.5 text-slate-700">
                              <Truck className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate block max-w-[120px]">{trip.vehicle}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold font-mono text-slate-600">{trip.distance} mi</td>
                          <td className="p-3.5">{getStatusBadge(trip.status)}</td>
                          <td className="p-3.5 text-right pr-5">
                            <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedTrip(trip); setTripView('details'); }}
                                className="p-1 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="View Trip Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {trip.status === 'Draft' && (
                                <button
                                  onClick={(e) => handleDispatchTrip(trip.id, e)}
                                  className="p-1 text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Dispatch Trip"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {trip.status === 'Dispatched' && (
                                <button
                                  onClick={(e) => handleCompleteTrip(trip.id, e)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title="Complete Trip"
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleCancelTrip(trip.id, e)}
                                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Cancel Dispatch"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable row accordion */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-0 bg-slate-50 border-t border-b border-border-gray/70">
                              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                                <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3.5 shadow-sm">
                                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Assigned Driver</h4>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                                      <User className="w-4.5 h-4.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-bold text-xs text-slate-700 block">{trip.driver}</span>
                                      <span className="text-[9.5px] text-slate-400 block font-semibold">Compliance Verified</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3 shadow-sm">
                                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cargo weight checks</h4>
                                  <div className="space-y-1.5 text-[11px] font-semibold text-slate-600">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400 font-medium">Cargo weight</span>
                                      <span>{trip.cargoWeight} lbs</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400 font-medium">Configuration</span>
                                      <span>Full Container Load</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3 shadow-sm">
                                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dispatch Expenses</h4>
                                  <div className="space-y-1.5 text-[11px] font-semibold text-slate-600 font-mono">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400 font-medium font-sans">Fuel Logged</span>
                                      <span>{trip.fuelLogged} Gallons</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400 font-medium font-sans">Est. Costs</span>
                                      <span>${trip.expenses}.50</span>
                                    </div>
                                  </div>
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

          {/* Interactive Operational Map */}
          <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
            <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Interactive Dispatch Route Map</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 leading-none">
                Live (24s ago)
              </span>
            </h3>

            {/* Custom SVG Route Vector Map */}
            <div className="bg-slate-50 border border-border-gray rounded-xl h-64 relative overflow-hidden flex items-center justify-center">
              <svg width="100%" height="100%" className="absolute inset-0 select-none">
                {/* Hub connections */}
                <path d="M 60,80 L 180,120 L 320,60" fill="none" stroke="#DBEAFE" strokeWidth="4" strokeLinecap="round" />
                <path d="M 60,80 L 180,120 L 320,60" fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
                
                <path d="M 100,200 L 250,180 L 400,220" fill="none" stroke="#DBEAFE" strokeWidth="4" strokeLinecap="round" />
                <path d="M 100,200 L 250,180 L 400,220" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />

                {/* Animated truck nodes */}
                <motion.circle 
                  cx="180" 
                  cy="120" 
                  r="6" 
                  fill="#2563EB" 
                  animate={{ scale: [1, 1.4, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.circle 
                  cx="250" 
                  cy="180" 
                  r="6" 
                  fill="#3B82F6" 
                  animate={{ scale: [1, 1.4, 1] }} 
                  transition={{ repeat: Infinity, duration: 2.2 }}
                />
              </svg>

              {/* Pin Labels */}
              <div className="absolute top-8 left-12 bg-white border border-border-gray px-2 py-1 rounded-lg text-[9px] font-bold shadow-sm">
                CHI Depot
              </div>
              <div className="absolute bottom-16 right-20 bg-white border border-border-gray px-2 py-1 rounded-lg text-[9px] font-bold shadow-sm">
                ATL Hub
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Dispatch inspector, Insights, Timeline */}
        <div className="space-y-6">
          
          {/* Active Trip Telemetry panel */}
          <AnimatePresence mode="wait">
            {selectedTrip ? (
              <motion.div
                key={selectedTrip.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4"
              >
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Trip Inspector</span>
                  <h3 className="text-sm font-black text-text-dark tracking-tight leading-tight mt-1">{selectedTrip.id}</h3>
                  <span className="text-[10px] font-semibold text-slate-500 block mt-1">{selectedTrip.route}</span>
                </div>

                <div className="space-y-3.5 text-[11px] font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Assigned Driver</span>
                    <span>{selectedTrip.driver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Assigned Asset</span>
                    <span>{selectedTrip.vehicle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Estimated ETA</span>
                    <span>{selectedTrip.eta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Est. Distance</span>
                    <span>{selectedTrip.distance} Miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Trip status</span>
                    <span>{selectedTrip.status}</span>
                  </div>
                </div>

                {/* Vertical status history timeline nodes */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3.5">Dispatch Milestones</h4>
                  <div className="relative pl-5 space-y-3.5 border-l-2 border-primary/10">
                    {selectedTrip.timeline?.map((node, idx) => (
                      <div key={idx} className="relative text-[11px] font-semibold text-slate-700">
                        <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
                        <span className="text-slate-700 block leading-tight">{node.event}</span>
                        <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{node.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setTripView('details')}
                    className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center shadow-sm"
                  >
                    View Operational Command Center
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 border border-border-gray p-10 rounded-2xl text-center text-slate-400 text-xs font-semibold py-20">
                Select a dispatch trip to load routes and telemetry inspector logs
              </div>
            )}
          </AnimatePresence>

          {/* AI insights & compliance guidelines */}
          <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
            <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2 flex items-center">
              <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Operational Insights
            </h3>

            <div className="space-y-3 text-[10.5px] font-semibold leading-normal text-slate-600">
              <div className="p-3 bg-blue-50/50 border border-primary/20 rounded-xl flex items-start space-x-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Fleet utilization holds at {kpis.utilization}%. {drivers.filter(d => d.status === 'Available').length} available drivers are ready for route assignments.
                </span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-amber-600">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Heavy traffic blockages registered along Midwest route CHI ➔ MSP. Delay forecasts indicate +25 mins.
                </span>
              </div>
            </div>
          </div>

      </div>
      </div>
    </div>
  );
};
