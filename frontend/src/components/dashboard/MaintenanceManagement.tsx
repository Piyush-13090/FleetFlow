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
  CheckCircle2, 
  Truck,
  Sparkles,
  Info
} from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  vehicle: string;
  registrationNumber: string;
  type: 'Oil Change' | 'Engine Repair' | 'Brake Service' | 'Tyre Replacement' | 'Battery' | 'General Service';
  workshop: string;
  mechanic: string;
  scheduledDate: string;
  estimatedCost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
  partsUsed?: { name: string; qty: number; cost: number }[];
}

interface VehicleData {
  registrationNumber: string;
  name: string;
  type: string;
  status: string;
  health: number;
  region: string;
}

interface MaintenanceManagementProps {
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

// Custom pure SVG Bar Chart for monthly repair expenses
const BarChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const height = 80;
  const max = Math.max(...data) || 1;
  const barWidth = 24;
  const gap = 8;
  const width = data.length * (barWidth + gap) - gap;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible select-none">
      {data.map((val, idx) => {
        const barHeight = (val / max) * (height - 10);
        const x = idx * (barWidth + gap);
        const y = height - barHeight;
        return (
          <g key={idx}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx="4" className="hover:opacity-85 transition-opacity cursor-pointer" />
            <text x={x + barWidth / 2} y={y - 3} textAnchor="middle" fill="#64748B" className="text-[7.5px] font-bold font-mono">
              ${val}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const MaintenanceManagement: React.FC<MaintenanceManagementProps> = ({ onShowToast }) => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');

  // Add Record Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [selectedReg, setSelectedReg] = useState('');
  const [maintType, setMaintType] = useState<MaintenanceRecord['type']>('General Service');
  const [workshop, setWorkshop] = useState('');
  const [mechanic, setMechanic] = useState('');
  const [estCost, setEstCost] = useState('450');
  const [schedDate, setSchedDate] = useState('2026-07-15');
  const [priorityVal, setPriorityVal] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [notes, setNotes] = useState('');

  // Completion Panel States
  const [showCompletePanel, setShowCompletePanel] = useState<string | null>(null);
  const [finalCost, setFinalCost] = useState('480');
  const [techNotes, setTechNotes] = useState('');
  const [qualityChecked, setQualityChecked] = useState(false);

  // Fetch operational vehicles
  const fetchOperationalData = async () => {
    setIsLoading(true);
    try {
      const vRes = await fetch('/api/fleet/vehicles');
      if (vRes.ok) setVehicles(await vRes.json());
      
      // Mock Maintenance Records
      const mockRecords: MaintenanceRecord[] = [
        {
          id: 'MA-908',
          vehicle: 'Freightliner Cascadia (#TRK-201)',
          registrationNumber: 'TRK-201',
          type: 'Brake Service',
          workshop: 'Midwest Fleet Garage',
          mechanic: 'Tom Miller',
          scheduledDate: '2026-07-11',
          estimatedCost: 850,
          status: 'In Progress',
          priority: 'High',
          notes: 'Front brake pads worn down to 15%. Require immediate replacement.',
          partsUsed: [
            { name: 'Ceramic Brake Pads (Set)', qty: 2, cost: 280 },
            { name: 'Fluid Refill', qty: 1, cost: 45 }
          ]
        },
        {
          id: 'MA-907',
          vehicle: 'Ford Transit Cargo (#TRK-109)',
          registrationNumber: 'TRK-109',
          type: 'Oil Change',
          workshop: 'Chicago Rapid Lube',
          mechanic: 'Sarah Jenkins',
          scheduledDate: '2026-07-10',
          estimatedCost: 120,
          status: 'Completed',
          priority: 'Low',
          notes: 'Standard 10,000 mi synthetic oil change.',
          partsUsed: [
            { name: 'Synthetic Oil (5W-30)', qty: 6, cost: 72 },
            { name: 'Premium Oil Filter', qty: 1, cost: 18 }
          ]
        },
        {
          id: 'MA-909',
          vehicle: 'Chevrolet Bolt EV (#TRK-302)',
          registrationNumber: 'TRK-302',
          type: 'General Service',
          workshop: 'EV Hub Chicago',
          mechanic: 'Marcus Vance',
          scheduledDate: '2026-07-15',
          estimatedCost: 350,
          status: 'Scheduled',
          priority: 'Medium',
          notes: 'Annual diagnostic battery check and tire rotation.'
        }
      ];
      setRecords(mockRecords);
      if (mockRecords.length > 0) setSelectedRecord(mockRecords[0]);

    } catch {
      onShowToast('Error loading maintenance logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    onShowToast('Syncing real-time workshop repair logs...');
    fetchOperationalData();
  };

  // Add maintenance record logic
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReg || !workshop || !mechanic) {
      onShowToast('Please fill in all vehicle and workshop fields.');
      return;
    }

    const selectedVehicle = vehicles.find(v => v.registrationNumber === selectedReg);
    const newRecord: MaintenanceRecord = {
      id: `MA-${Math.floor(100 + Math.random() * 900)}`,
      vehicle: `${selectedVehicle?.name} (#${selectedReg})`,
      registrationNumber: selectedReg,
      type: maintType,
      workshop,
      mechanic,
      scheduledDate: schedDate,
      estimatedCost: Number(estCost),
      status: 'Scheduled',
      priority: priorityVal,
      notes
    };

    setRecords(prev => [newRecord, ...prev]);
    setShowAddModal(false);
    onShowToast(`Maintenance scheduled for ${selectedVehicle?.name}. Vehicle status set to In Shop.`);
  };

  // Complete repair logic
  const handleCompleteSubmit = (recordId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!qualityChecked) {
      onShowToast('Please verify quality inspection before completing repair.');
      return;
    }

    setRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          status: 'Completed',
          estimatedCost: Number(finalCost),
          notes: `${rec.notes || ''} [Completed Notes: ${techNotes}]`
        };
      }
      return rec;
    }));

    // If selected record, update it too
    setSelectedRecord(prev => {
      if (prev && prev.id === recordId) {
        return {
          ...prev,
          status: 'Completed',
          estimatedCost: Number(finalCost),
          notes: `${prev.notes || ''} [Completed Notes: ${techNotes}]`
        };
      }
      return prev;
    });

    setShowCompletePanel(null);
    onShowToast(`Repair #${recordId} completed. Vehicle released back to Available status.`);
  };

  const toggleRowExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All Types');
    setSelectedStatus('All Statuses');
    setSelectedPriority('All Priorities');
    onShowToast('Filters reset.');
  };

  // Filter records
  const filteredRecords = records.filter(rec => {
    const matchesSearch = 
      rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.workshop.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All Types' || rec.type === selectedType;
    const matchesStatus = selectedStatus === 'All Statuses' || rec.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All Priorities' || rec.priority === selectedPriority;

    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'Scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
            Scheduled
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
            In Progress
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
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 animate-bounce">
            Overdue
          </span>
        );
      default:
        return null;
    }
  };

  // KPI Calculations
  const kpis = {
    inShop: records.filter(r => r.status === 'In Progress').length,
    scheduled: records.filter(r => r.status === 'Scheduled').length,
    completed: records.filter(r => r.status === 'Completed').length,
    cost: records.reduce((acc, r) => acc + r.estimatedCost, 0)
  };

  // Filter out retired vehicles for scheduling
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired');

  return (
    <div className="space-y-6 select-none relative pb-16">
      
      {/* Sticky top action header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-gray/50 text-left">
        <div>
          <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">Maintenance Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
            Track vehicle health, manage service schedules, monitor repair costs, and minimize fleet downtime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto select-none">
          <button
            onClick={() => {
              setSelectedReg('');
              setWorkshop('');
              setMechanic('');
              setEstCost('450');
              setNotes('');
              setAddStep(1);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Record</span>
          </button>
          
          <button
            onClick={() => onShowToast('Exporting Maintenance logs as CSV...')}
            className="px-3 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Records</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI ribbon dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { id: 'in_shop', label: 'Vehicles In Shop', val: kpis.inShop, trend: 'Active repairs', spark: [1, 2, 1, 2, 2, 1, 1], color: '#F59E0B' },
          { id: 'scheduled', label: 'Scheduled Services', val: kpis.scheduled, trend: 'Next 7 days', spark: [3, 2, 4, 3, 3, 5, 4], color: '#2563EB' },
          { id: 'active', label: 'Active Repairs', val: kpis.inShop, trend: 'In workshop', spark: [1, 1, 2, 1, 2, 1, 1], color: '#2563EB' },
          { id: 'completed', label: 'Completed Today', val: kpis.completed, trend: '+4 this week', spark: [2, 3, 4, 4, 5, 6, 7], color: '#22C55E' },
          { id: 'total_cost', label: 'Total Maint. Cost', val: `$${kpis.cost}`, trend: 'This quarter', spark: [1000, 1120, 980, 1340, 1320], color: '#22C55E' },
          { id: 'avg_downtime', label: 'Avg Downtime', val: '1.8 Days', trend: 'Fleet benchmark 2.0d', spark: [1.9, 1.8, 1.9, 1.8, 1.8], color: '#22C55E' }
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

      {/* Sticky search filter panel */}
      <div className="sticky top-16 z-15 bg-white border border-border-gray p-4 rounded-2xl flex flex-wrap items-center gap-3.5 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-800 border-r border-border-gray pr-3.5 py-1 shrink-0">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold">Search & Filters</span>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records, workshop, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border-gray rounded-xl text-xs focus:bg-white focus:outline-none input-glow transition-all"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="All Types">All Types</option>
          <option value="Oil Change">Oil Change</option>
          <option value="Engine Repair">Engine Repair</option>
          <option value="Brake Service">Brake Service</option>
          <option value="Tyre Replacement">Tyre Replacement</option>
          <option value="Battery">Battery</option>
          <option value="General Service">General Service</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="All Statuses">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Overdue">Overdue</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="bg-slate-50 border border-border-gray px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="All Priorities">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        {(searchQuery || selectedType !== 'All Types' || selectedStatus !== 'All Statuses' || selectedPriority !== 'All Priorities') && (
          <button onClick={handleResetFilters} className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">
            Reset
          </button>
        )}
      </div>

      {/* Main dashboard columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 70% Columns: Records Table and analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-border-gray rounded-2xl shadow-sm overflow-hidden text-left">
            <div className="p-4 border-b border-border-gray/50">
              <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase">Maintenance Database Table</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Servicing schedules, active repair work orders, and parts inventories.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5 pl-5">Maintenance ID</th>
                    <th className="p-3.5">Assigned Asset</th>
                    <th className="p-3.5">Service Type</th>
                    <th className="p-3.5">Workshop Hub</th>
                    <th className="p-3.5">Assigned Mechanic</th>
                    <th className="p-3.5">Scheduled Date</th>
                    <th className="p-3.5">Est. Cost</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gray/50 text-[11px] font-semibold text-slate-700">
                  {filteredRecords.map(rec => {
                    const isSelected = selectedRecord?.id === rec.id;
                    const isExpanded = !!expandedRows[rec.id];

                    return (
                      <React.Fragment key={rec.id}>
                        <tr
                          onClick={() => setSelectedRecord(rec)}
                          className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-primary/[0.02]' : ''
                          }`}
                        >
                          <td className="p-3.5 pl-5 font-semibold text-text-dark">
                            <div className="flex items-center space-x-2.5">
                              <button
                                onClick={(e) => toggleRowExpand(rec.id, e)}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              >
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                              <span className="font-bold font-mono text-slate-600">{rec.id}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold">
                            <div className="flex items-center space-x-1.5 text-slate-700">
                              <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate block max-w-[120px]">{rec.vehicle}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-500 font-semibold">{rec.type}</td>
                          <td className="p-3.5 font-bold text-slate-700">{rec.workshop}</td>
                          <td className="p-3.5 font-medium text-slate-600">{rec.mechanic}</td>
                          <td className="p-3.5 font-mono text-slate-500">{rec.scheduledDate}</td>
                          <td className="p-3.5 font-mono text-slate-700">${rec.estimatedCost}</td>
                          <td className="p-3.5">{getStatusBadge(rec.status)}</td>
                        </tr>

                        {/* Expandable record row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="p-0 bg-slate-50 border-t border-b border-border-gray/70">
                              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-left text-xs font-semibold text-slate-700">
                                <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3.5 shadow-sm">
                                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Technician Notes</h4>
                                  <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                                    {rec.notes || 'No notes added yet by diagnostic mechanic.'}
                                  </p>
                                </div>

                                <div className="bg-white border border-border-gray/60 p-4 rounded-xl space-y-3 shadow-sm col-span-2">
                                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Replacement Parts Used</h4>
                                  {rec.partsUsed && rec.partsUsed.length > 0 ? (
                                    <table className="w-full text-left">
                                      <thead>
                                        <tr className="border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase">
                                          <th className="pb-1.5">Part Name</th>
                                          <th className="pb-1.5">Qty</th>
                                          <th className="pb-1.5 text-right">Cost</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50 text-[10px] text-slate-600 font-mono">
                                        {rec.partsUsed.map((part, idx) => (
                                          <tr key={idx}>
                                            <td className="py-1.5 font-sans font-semibold">{part.name}</td>
                                            <td className="py-1.5">{part.qty}</td>
                                            <td className="py-1.5 text-right">${part.cost}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p className="text-slate-400 text-[10.5px] font-medium">No inventory parts allocated for this record.</p>
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

          {/* Cost Analytics & Health circular widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2">
                Monthly Repair Expenses
              </h3>
              <div className="pt-2">
                <BarChart data={[240, 480, 310, 850, 620]} color="#3B82F6" />
              </div>
            </div>

            {/* Vehicle Diagnostic Health circular widget */}
            <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2">
                  Diagnostic Fleet Health
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Average health indexes across all active dispatches.</p>
              </div>

              <div className="flex items-center space-x-6 py-2">
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" className="stroke-slate-100" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r="28" className="stroke-primary" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 - (92 / 100) * 2 * Math.PI * 28} />
                  </svg>
                  <span className="absolute text-xs font-black text-text-dark">92%</span>
                </div>
                <div className="text-xs font-semibold text-slate-600 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Telemetry Rating</span>
                  <p className="leading-relaxed">92% of vehicles are currently classified as healthy with no engine alert flags.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right 30% Column: Workshop progress, Completion panels, Insights */}
        <div className="space-y-6 text-left">
          
          {/* Active Work Order Telemetry panel */}
          <AnimatePresence mode="wait">
            {selectedRecord ? (
              <motion.div
                key={selectedRecord.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4"
              >
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Work Order Inspector</span>
                  <h3 className="text-sm font-black text-text-dark tracking-tight leading-tight mt-1">{selectedRecord.id}</h3>
                  <span className="text-[10px] font-semibold text-slate-500 block mt-1">{selectedRecord.vehicle}</span>
                </div>

                <div className="space-y-3.5 text-[11px] font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Service Type</span>
                    <span>{selectedRecord.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Workshop Hub</span>
                    <span>{selectedRecord.workshop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Assigned Mechanic</span>
                    <span>{selectedRecord.mechanic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Est. Costs</span>
                    <span>${selectedRecord.estimatedCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Scheduled Date</span>
                    <span>{selectedRecord.scheduledDate}</span>
                  </div>
                </div>

                {/* Completion panel triggers */}
                {selectedRecord.status === 'In Progress' && (
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setFinalCost(selectedRecord.estimatedCost.toString());
                        setTechNotes('');
                        setQualityChecked(false);
                        setShowCompletePanel(selectedRecord.id);
                      }}
                      className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center shadow-sm"
                    >
                      Complete Repair Order
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-slate-50 border border-border-gray p-10 rounded-2xl text-center text-slate-400 text-xs font-semibold py-20">
                Select a maintenance record to load workshop logs
              </div>
            )}
          </AnimatePresence>

          {/* AI Maintenance Insights */}
          <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2 flex items-center">
              <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Health Diagnostics
            </h3>

            <div className="space-y-3 text-[10.5px] font-semibold leading-normal text-slate-600">
              <div className="p-3 bg-blue-50/50 border border-primary/20 rounded-xl flex items-start space-x-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Brake servicing recommended for vehicle TRK-201 within next 600 km due to harsh decelerations.
                </span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-amber-600">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Engine temperature anomaly detected in Ford Transit TRK-109. Preventive inspection advised.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* COMPLETE REPAIR WORK ORDER OVERLAY */}
      <AnimatePresence>
        {showCompletePanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center text-left">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowCompletePanel(null)} className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 z-10 space-y-4"
            >
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-black text-text-dark uppercase">Complete Work Order</h3>
              </div>

              <form onSubmit={(e) => handleCompleteSubmit(showCompletePanel, e)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Final Cost (USD)</label>
                  <input 
                    type="number" 
                    value={finalCost} 
                    onChange={(e) => setFinalCost(e.target.value)}
                    className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Technician Quality Remarks</label>
                  <textarea 
                    placeholder="e.g. Brake pads replaced. Test drive completed."
                    value={techNotes} 
                    onChange={(e) => setTechNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none h-12"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-50/50 p-2.5 border border-border-gray rounded-xl">
                  <input 
                    type="checkbox" 
                    checked={qualityChecked} 
                    onChange={(e) => setQualityChecked(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Confirm vehicle diagnostic verification passed.</span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCompletePanel(null)}
                    className="flex-1 py-2 border border-border-gray hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Release Vehicle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE SERVICE STEPPER MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center text-left">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative z-10 flex flex-col max-h-[85vh]"
            >
              {/* Stepper Header */}
              <div className="bg-slate-50 border-b border-border-gray/70 p-4">
                <h3 className="text-sm font-black text-text-dark tracking-tight uppercase">
                  Schedule Servicing — Step {addStep} of 2
                </h3>
              </div>

              {/* Form Content */}
              <form onSubmit={handleAddSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[55vh]">
                {addStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Fleet Vehicle</label>
                      <select 
                        value={selectedReg} 
                        onChange={(e) => setSelectedReg(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none cursor-pointer"
                        required
                      >
                        <option value="">-- Select active vehicle --</option>
                        {activeVehicles.map(veh => (
                          <option key={veh.registrationNumber} value={veh.registrationNumber}>
                            {veh.name} (#{veh.registrationNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maintenance Service Type</label>
                      <select 
                        value={maintType} 
                        onChange={(e) => setMaintType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="General Service">General Service</option>
                        <option value="Oil Change">Oil Change</option>
                        <option value="Brake Service">Brake Service</option>
                        <option value="Engine Repair">Engine Repair</option>
                        <option value="Tyre Replacement">Tyre Replacement</option>
                        <option value="Battery">Battery Check</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Workshop Hub</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Rapid Lube CHI" 
                          value={workshop} 
                          onChange={(e) => setWorkshop(e.target.value)}
                          className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lead Mechanic</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Tom Miller" 
                          value={mechanic} 
                          onChange={(e) => setMechanic(e.target.value)}
                          className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {addStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimated Cost (USD)</label>
                        <input 
                          type="number" 
                          value={estCost} 
                          onChange={(e) => setEstCost(e.target.value)}
                          className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Date</label>
                        <input 
                          type="date" 
                          value={schedDate} 
                          onChange={(e) => setSchedDate(e.target.value)}
                          className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority Level</label>
                      <select 
                        value={priorityVal} 
                        onChange={(e) => setPriorityVal(e.target.value as any)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Servicing Remarks</label>
                      <textarea 
                        placeholder="e.g. Schedule diagnostic check on cooling unit..."
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none h-12 resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Footer Controls */}
                <div className="flex justify-between pt-4 border-t border-slate-100 select-none">
                  <button
                    type="button"
                    onClick={() => addStep > 1 ? setAddStep(prev => prev - 1) : setShowAddModal(false)}
                    className="px-3.5 py-2 border border-border-gray bg-white text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {addStep === 1 ? 'Cancel' : 'Back'}
                  </button>

                  {addStep < 2 ? (
                    <button
                      type="button"
                      onClick={() => setAddStep(prev => prev + 1)}
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                    >
                      Schedule Servicing
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
