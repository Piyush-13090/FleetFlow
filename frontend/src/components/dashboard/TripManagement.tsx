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
import { SectionHeader } from '../ui/SectionHeader';
import { StatusPill } from '../ui/StatusPill';
import { Reveal } from '../ui/Reveal';

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
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="select-none">
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
    return <StatusPill status={status} pulse={status === 'Dispatched' || status === 'On Trip'} />;
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
    <Reveal className="space-y-6 select-none relative pb-16">
      
      {/* Header operations ribbon */}
      <SectionHeader
        title="Trip Management"
        subtitle="Create, dispatch, monitor, and complete transport operations while tracking vehicles, drivers, cargo, and delivery progress."
        actions={
          <>
            <button
              onClick={() => setTripView('add')}
              className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] shadow-sm hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Create Trip</span>
            </button>
            
            <button
              onClick={() => onShowToast('Exporting Operations Trip Logs as CSV...')}
              className="px-3 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer flex items-center space-x-1.5 cc-shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Trips</span>
            </button>

            <button
              onClick={handleRefresh}
              className="p-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[#0A0A0A] rounded-[12px] transition-all cursor-pointer cc-shadow-sm"
              title="Refresh Operations Center"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      {/* Analytics KPI counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { id: 'active', label: 'Active Trips', val: kpis.active, trend: '+2 this hour', spark: [3, 4, 3, 5, 4, 6, 5], color: '#2563EB' },
          { id: 'draft', label: 'Draft Trips', val: kpis.draft, trend: 'Pending dispatch', spark: [1, 2, 1, 1, 2, 2, 1], color: '#94A3B8' },
          { id: 'completed', label: 'Completed Today', val: kpis.completed, trend: '+8 completed', spark: [4, 5, 5, 6, 7, 8, 8], color: '#059669' },
          { id: 'cancelled', label: 'Cancelled', val: kpis.cancelled, trend: '0 in last 48h', spark: [1, 0, 0, 0, 1, 0, 0], color: '#94A3B8' },
          { id: 'distance', label: 'Average Distance', val: '312 mi', trend: 'Fleet average', spark: [310, 312, 308, 315, 312], color: '#2563EB' },
          { id: 'utilization', label: 'Fleet Utilization', val: `${kpis.utilization}%`, trend: '+2.4% vs yesterday', spark: [80, 82, 81, 84, 84], color: '#059669' }
        ].map(card => (
          <div key={card.id} className="p-4 bg-white border border-[#E5E7EB] rounded-[16px] flex flex-col justify-between cc-shadow-sm hover:shadow-md transition-all duration-300 relative group cursor-pointer text-left">
            <div>
              <span className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider leading-none block">{card.label}</span>
              <h3 className="text-xl font-black text-[#0A0A0A] tracking-tight leading-none mt-2 font-mono tabular-nums">{card.val}</h3>
            </div>
            <div className="mt-4 flex justify-between items-end">
              <span className="text-[9px] font-bold text-[#9CA3AF] block leading-none">{card.trend}</span>
              <div className="w-12 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <Sparkline dataPoints={card.spark} color={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Sticky Filter Ribbon */}
      <div className="sticky top-0 z-15 bg-white/90 backdrop-blur-md border border-[#E5E7EB] p-4 rounded-[16px] flex flex-wrap items-center gap-3.5 cc-shadow-sm">
        <div className="flex items-center space-x-2 text-[#0A0A0A] border-r border-[#E5E7EB] pr-3.5 py-1 shrink-0">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold">Search & Filters</span>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search trip ID, route, driver name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] text-xs focus:bg-white focus:outline-none input-glow transition-all"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 rounded-[12px] text-xs font-bold text-[#4B5563] focus:outline-none cursor-pointer"
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
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 rounded-[12px] text-xs font-bold text-[#4B5563] focus:outline-none cursor-pointer"
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
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-2 rounded-[12px] text-xs font-bold text-[#4B5563] focus:outline-none cursor-pointer font-mono"
        >
          <option value="newest">Sort by Newest</option>
          <option value="distance">Sort by Distance</option>
        </select>

        {(searchQuery || selectedStatus !== 'All Statuses' || selectedRegion !== 'All Regions') && (
          <button onClick={handleResetFilters} className="px-2 py-1 text-xs font-bold text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer">
            Reset
          </button>
        )}
      </div>

      {/* Main workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Data Table and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden text-left">
            <div className="p-4 border-b border-[#E5E7EB]">
              <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase">Operational Trips Database</h3>
              <p className="text-[10px] text-[#9CA3AF] font-medium mt-1">Real-time scheduling logs and active dispatch coordinates.</p>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[850px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Trip ID</th>
                    <th className="p-3.5">Assigned Route</th>
                    <th className="p-3.5">Cargo Config</th>
                    <th className="p-3.5">Assigned Asset</th>
                    <th className="p-3.5">Odometer Distance</th>
                    <th className="p-3.5">Dispatch State</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filteredTrips.map(trip => {
                    const isSelected = selectedTrip?.id === trip.id;
                    const isExpanded = !!expandedRows[trip.id];

                    return (
                      <React.Fragment key={trip.id}>
                        <tr
                          onClick={() => setSelectedTrip(trip)}
                          className={`hover:bg-[#F9FAFB]/50 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-primary/[0.02]' : ''
                          }`}
                        >
                          <td className="p-3.5 pl-5 font-semibold text-[#0A0A0A]">
                            <div className="flex items-center space-x-2.5">
                              <button
                                onClick={(e) => toggleRowExpand(trip.id, e)}
                                className="p-1 rounded hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#4B5563] transition-colors cursor-pointer"
                              >
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                              <span className="font-bold font-mono text-[#4B5563]">{trip.id}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-[#4B5563]">{trip.route}</td>
                          <td className="p-3.5 text-[#6B7280] font-semibold">{trip.cargo}</td>
                          <td className="p-3.5 font-bold">
                            <div className="flex items-center space-x-1.5 text-[#4B5563]">
                              <Truck className="w-3.5 h-3.5 text-[#9CA3AF]" />
                              <span className="truncate block max-w-[120px] font-mono">{trip.vehicle}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold font-mono text-[#4B5563] tabular-nums">{trip.distance} mi</td>
                          <td className="p-3.5">{getStatusBadge(trip.status)}</td>
                          <td className="p-3.5 text-right pr-5">
                            <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedTrip(trip); setTripView('details'); }}
                                className="p-1 text-[#9CA3AF] hover:text-primary hover:bg-[#EFF4FF] rounded-lg transition-colors cursor-pointer"
                                title="View Trip Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {trip.status === 'Draft' && (
                                <button
                                  onClick={(e) => handleDispatchTrip(trip.id, e)}
                                  className="p-1 text-primary hover:bg-[#EFF4FF] rounded-lg transition-colors cursor-pointer"
                                  title="Dispatch Trip"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {trip.status === 'Dispatched' && (
                                <button
                                  onClick={(e) => handleCompleteTrip(trip.id, e)}
                                  className="p-1 text-[#059669] hover:bg-[#ECFDF5] rounded-lg transition-colors cursor-pointer"
                                  title="Complete Trip"
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleCancelTrip(trip.id, e)}
                                className="p-1 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
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
                            <td colSpan={7} className="p-0 bg-[#F9FAFB] border-t border-b border-[#E5E7EB]">
                              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                                <div className="bg-white border border-[#E5E7EB] p-4 rounded-[12px] space-y-3.5 cc-shadow-sm">
                                  <h4 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider">Assigned Driver</h4>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full bg-[#EFF4FF] text-primary border border-[#DBE6FF] flex items-center justify-center shrink-0">
                                      <User className="w-4.5 h-4.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-bold text-xs text-[#4B5563] block">{trip.driver}</span>
                                      <span className="text-[9.5px] text-[#9CA3AF] block font-semibold">Compliance Verified</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white border border-[#E5E7EB] p-4 rounded-[12px] space-y-3 cc-shadow-sm">
                                  <h4 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider">Cargo weight checks</h4>
                                  <div className="space-y-1.5 text-[11px] font-semibold text-[#4B5563]">
                                    <div className="flex justify-between">
                                      <span className="text-[#9CA3AF] font-medium">Cargo weight</span>
                                      <span className="font-mono tabular-nums">{trip.cargoWeight} lbs</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#9CA3AF] font-medium">Configuration</span>
                                      <span>Full Container Load</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white border border-[#E5E7EB] p-4 rounded-[12px] space-y-3 cc-shadow-sm">
                                  <h4 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider">Dispatch Expenses</h4>
                                  <div className="space-y-1.5 text-[11px] font-semibold text-[#4B5563] font-mono tabular-nums">
                                    <div className="flex justify-between">
                                      <span className="text-[#9CA3AF] font-medium font-sans">Fuel Logged</span>
                                      <span>{trip.fuelLogged} Gallons</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#9CA3AF] font-medium font-sans">Est. Costs</span>
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
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
            <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center justify-between">
              <span>Interactive Dispatch Route Map</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC] leading-none">
                Live (24s ago)
              </span>
            </h3>

            {/* Custom SVG Route Vector Map */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] h-64 relative overflow-hidden flex items-center justify-center">
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
              <div className="absolute top-8 left-12 bg-white border border-[#E5E7EB] px-2 py-1 rounded-[8px] text-[9px] font-bold cc-shadow-sm">
                CHI Depot
              </div>
              <div className="absolute bottom-16 right-20 bg-white border border-[#E5E7EB] px-2 py-1 rounded-[8px] text-[9px] font-bold cc-shadow-sm">
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
                className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4"
              >
                <div className="pb-3 border-b border-[#F3F4F6]">
                  <span className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider">Trip Inspector</span>
                  <h3 className="text-sm font-black text-[#0A0A0A] tracking-tight leading-tight mt-1 font-mono">{selectedTrip.id}</h3>
                  <span className="text-[10px] font-bold text-[#4B5563] block mt-1">{selectedTrip.route}</span>
                </div>

                <div className="space-y-3.5 text-[11px] font-semibold text-[#4B5563]">
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Assigned Driver</span>
                    <span className="text-[#0A0A0A] font-bold">{selectedTrip.driver}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Assigned Asset</span>
                    <span className="text-[#0A0A0A] font-bold font-mono">{selectedTrip.vehicle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Estimated ETA</span>
                    <span className="text-[#0A0A0A] font-bold font-mono">{selectedTrip.eta}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Est. Distance</span>
                    <span className="text-[#0A0A0A] font-bold font-mono tabular-nums">{selectedTrip.distance} Miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Trip status</span>
                    <span>{getStatusBadge(selectedTrip.status)}</span>
                  </div>
                </div>

                {/* Vertical status history timeline nodes */}
                <div className="pt-4 border-t border-[#F3F4F6]">
                  <h4 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider mb-3.5">Dispatch Milestones</h4>
                  <div className="relative pl-5 space-y-3.5 border-l-2 border-primary/10">
                    {selectedTrip.timeline?.map((node, idx) => (
                      <div key={idx} className="relative text-[11px] font-semibold text-[#4B5563]">
                        <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
                        <span className="text-[#0A0A0A] block leading-tight">{node.event}</span>
                        <span className="text-[9px] text-[#9CA3AF] font-mono block mt-0.5">{node.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-[#F3F4F6]">
                  <button
                    onClick={() => setTripView('details')}
                    className="w-full py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] transition-all cursor-pointer text-center shadow-sm"
                  >
                    View Operational Command Center
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-10 rounded-[16px] text-center text-[#9CA3AF] text-xs font-semibold py-20 cc-shadow-sm">
                Select a dispatch trip to load routes and telemetry inspector logs
              </div>
            )}
          </AnimatePresence>

          {/* AI insights & compliance guidelines */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
            <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
              <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Operational Insights
            </h3>

            <div className="space-y-3 text-[10.5px] font-semibold leading-normal text-[#4B5563]">
              <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Fleet utilization holds at {kpis.utilization}%. {drivers.filter(d => d.status === 'Available').length} available drivers are ready for route assignments.
                </span>
              </div>
              <div className="p-3 bg-[#FFFBEB] border border-[#FDE8B0] rounded-[12px] flex items-start space-x-2 text-[#D97706]">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Heavy traffic blockages registered along Midwest route CHI ➔ MSP. Delay forecasts indicate +25 mins.
                </span>
              </div>
            </div>
          </div>

      </div>
      </div>
    </Reveal>
  );
};
