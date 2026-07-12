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
  Activity,
  Calendar,
  DollarSign,
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
import { Ring } from '../ui/Ring';

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
      const [vehiclesResponse, maintenanceResponse] = await Promise.all([
        apiFetch('/api/fleet/vehicles'),
        apiFetch('/api/fleet/maintenance')
      ]);
      if (vehiclesResponse.ok) setVehicles(await vehiclesResponse.json());
      if (maintenanceResponse.ok) {
        const maintenanceRecords = await maintenanceResponse.json();
        setRecords(maintenanceRecords);
        if (maintenanceRecords.length > 0 && !selectedRecord) setSelectedRecord(maintenanceRecords[0]);
      }

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

    try {
      const response = await apiFetch('/api/fleet/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: selectedReg,
          type: maintType,
          workshop,
          mechanic,
          scheduledDate: schedDate,
          estimatedCost: Number(estCost),
          priority: priorityVal,
          notes
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to schedule maintenance.');
      setShowAddModal(false);
      await fetchOperationalData();
      onShowToast(`Maintenance scheduled for ${data.record.vehicle}. Vehicle status set to In Shop.`);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Unable to schedule maintenance.');
    }
  };

  // Complete repair logic
  const handleCompleteSubmit = async (recordId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!qualityChecked) {
      onShowToast('Please verify quality inspection before completing repair.');
      return;
    }

    try {
      const currentRecord = records.find((record) => record.id === recordId);
      const response = await apiFetch(`/api/fleet/maintenance/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          estimatedCost: Number(finalCost),
          notes: `${currentRecord?.notes || ''} [Completed Notes: ${techNotes}]`
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to complete maintenance.');
      setRecords((currentRecords) => currentRecords.map((record) => record.id === recordId ? data.record : record));
      setSelectedRecord(data.record);
      setShowCompletePanel(null);
      onShowToast(`Repair #${recordId} completed. Vehicle released back to Available status.`);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Unable to complete maintenance.');
    }
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
    return <StatusPill status={status} pulse={status === 'In Progress' || status === 'Overdue'} />;
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
    <Reveal className="space-y-6 select-none relative pb-16">
      
      {/* Sticky top action header */}
      <SectionHeader
        title="Maintenance Management"
        subtitle="Track vehicle health, manage service schedules, monitor repair costs, and minimize fleet downtime."
        actions={
          <>
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
              className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Add Record</span>
            </button>
            
            <button
              onClick={() => onShowToast('Exporting Maintenance logs as CSV...')}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Records</span>
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

      {/* KPI ribbon dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiTile 
          icon={Truck}
          label="Vehicles In Shop" 
          value={kpis.inShop} 
          sublabel="Active repairs" 
          spark={[1, 2, 1, 2, 2, 1, 1]}
          color="#D97706"
          tint="#FFFBEB"
        />
        <KpiTile 
          icon={Calendar}
          label="Scheduled Services" 
          value={kpis.scheduled} 
          sublabel="Next 7 days" 
          spark={[3, 2, 4, 3, 3, 5, 4]}
          color="#2563EB"
          tint="#EFF4FF"
        />
        <KpiTile 
          icon={Activity}
          label="Active Repairs" 
          value={kpis.inShop} 
          sublabel="In workshop" 
          spark={[1, 1, 2, 1, 2, 1, 1]}
          color="#2563EB"
          tint="#EFF4FF"
        />
        <KpiTile 
          icon={Wrench}
          label="Completed Today" 
          value={kpis.completed} 
          sublabel="+4 this week" 
          spark={[2, 3, 4, 4, 5, 6, 7]}
          color="#059669"
          tint="#ECFDF5"
        />
        <KpiTile 
          icon={DollarSign}
          label="Total Maint. Cost" 
          value={`$${kpis.cost}`} 
          sublabel="This quarter" 
          spark={[1000, 1120, 980, 1340, 1320]}
          color="#059669"
          tint="#ECFDF5"
        />
        <KpiTile 
          icon={Clock}
          label="Avg Downtime" 
          value={1.8} 
          decimals={1}
          suffix=" Days"
          sublabel="Fleet benchmark 2.0d" 
          spark={[1.9, 1.8, 1.9, 1.8, 1.8]}
          color="#059669"
          tint="#ECFDF5"
        />
      </div>

      {/* Sticky search filter panel */}
      <div className="sticky top-0 z-15 bg-white border border-[#E5E7EB] p-4 rounded-[16px] flex flex-wrap items-center gap-3.5 cc-shadow-sm">
        <div className="flex items-center space-x-2 text-[#0A0A0A] border-r border-[#E5E7EB] pr-3.5 py-1 shrink-0">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-wider">Search & Filters</span>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search records, workshop, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] text-xs focus:bg-white focus:outline-none input-glow transition-all font-semibold text-[#4B5563]"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer focus:bg-white"
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
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer focus:bg-white"
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
          className="bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#4B5563] focus:outline-none cursor-pointer focus:bg-white"
        >
          <option value="All Priorities">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        {(searchQuery || selectedType !== 'All Types' || selectedStatus !== 'All Statuses' || selectedPriority !== 'All Priorities') && (
          <button onClick={handleResetFilters} className="px-2 py-1 text-xs font-bold text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer">
            Reset
          </button>
        )}
      </div>

      {/* Main dashboard columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 70% Columns: Records Table and analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden text-left">
            <div className="p-4.5 border-b border-[#E5E7EB]">
              <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase">Maintenance Database Table</h3>
              <p className="text-[11px] text-[#6B7280] mt-1">Servicing schedules, active repair work orders, and parts inventories.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
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
                <tbody className="divide-y divide-[#E5E7EB] text-[11px] font-semibold text-[#4B5563]">
                  {filteredRecords.map(rec => {
                    const isSelected = selectedRecord?.id === rec.id;
                    const isExpanded = !!expandedRows[rec.id];

                    return (
                      <React.Fragment key={rec.id}>
                        <tr
                          onClick={() => setSelectedRecord(rec)}
                          className={`hover:bg-[#F9FAFB]/50 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-[#EFF4FF]/30' : ''
                          }`}
                        >
                          <td className="p-3.5 pl-5 font-semibold text-[#0A0A0A]">
                            <div className="flex items-center space-x-2.5">
                              <button
                                onClick={(e) => toggleRowExpand(rec.id, e)}
                                className="p-1 rounded-[6px] hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#4B5563] transition-colors cursor-pointer"
                              >
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                              <span className="font-bold font-mono text-[#4B5563]">{rec.id}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold">
                            <div className="flex items-center space-x-1.5 text-[#4B5563]">
                              <Truck className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                              <span className="truncate block max-w-[120px]">{rec.vehicle}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-[#6B7280] font-semibold">{rec.type}</td>
                          <td className="p-3.5 font-bold text-[#4B5563]">{rec.workshop}</td>
                          <td className="p-3.5 font-medium text-[#4B5563]">{rec.mechanic}</td>
                          <td className="p-3.5 font-mono text-[#6B7280]">{rec.scheduledDate}</td>
                          <td className="p-3.5 font-mono text-[#0A0A0A]">${rec.estimatedCost}</td>
                          <td className="p-3.5">{getStatusBadge(rec.status)}</td>
                        </tr>

                        {/* Expandable record row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="p-0 bg-[#F9FAFB] border-t border-b border-[#E5E7EB]">
                              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-left text-xs font-semibold text-[#4B5563]">
                                <div className="bg-white border border-[#E5E7EB] p-4 rounded-[12px] space-y-3.5 cc-shadow-sm">
                                  <h4 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider">Technician Notes</h4>
                                  <p className="text-[#6B7280] text-[11px] leading-relaxed font-medium">
                                    {rec.notes || 'No notes added yet by diagnostic mechanic.'}
                                  </p>
                                </div>

                                <div className="bg-white border border-[#E5E7EB] p-4 rounded-[12px] space-y-3 cc-shadow-sm col-span-2">
                                  <h4 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider mb-2">Replacement Parts Used</h4>
                                  {rec.partsUsed && rec.partsUsed.length > 0 ? (
                                    <table className="w-full text-left">
                                      <thead>
                                        <tr className="border-b border-[#F3F4F6] text-[9px] font-bold text-[#9CA3AF] uppercase">
                                          <th className="pb-1.5">Part Name</th>
                                          <th className="pb-1.5">Qty</th>
                                          <th className="pb-1.5 text-right">Cost</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[#FBFCFD] text-[10px] text-[#4B5563] font-mono">
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
                                    <p className="text-[#9CA3AF] text-[10.5px] font-medium">No inventory parts allocated for this record.</p>
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
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
              <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2">
                Monthly Repair Expenses
              </h3>
              <div className="pt-2">
                <BarChart data={[240, 480, 310, 850, 620]} color="#2563EB" />
              </div>
            </div>

            {/* Vehicle Diagnostic Health circular widget */}
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2">
                  Diagnostic Fleet Health
                </h3>
                <p className="text-[10px] text-[#9CA3AF] font-semibold mt-1">Average health indexes across all active dispatches.</p>
              </div>

              <div className="flex items-center space-x-6 py-2">
                <Ring value={92} size={64} stroke={5.5} color="#2563EB" />
                <div className="text-xs font-semibold text-[#4B5563] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-0.5">Telemetry Rating</span>
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
                className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4"
              >
                <div className="pb-3 border-b border-[#E5E7EB]">
                  <span className="text-[9px] uppercase font-black text-[#9CA3AF] tracking-wider">Work Order Inspector</span>
                  <h3 className="text-sm font-black text-[#0A0A0A] tracking-tight leading-tight mt-1">{selectedRecord.id}</h3>
                  <span className="text-[10.5px] font-semibold text-[#6B7280] block mt-1">{selectedRecord.vehicle}</span>
                </div>

                <div className="space-y-3.5 text-[11px] font-semibold text-[#4B5563]">
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Service Type</span>
                    <span className="text-[#0A0A0A]">{selectedRecord.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Workshop Hub</span>
                    <span className="text-[#0A0A0A]">{selectedRecord.workshop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Assigned Mechanic</span>
                    <span className="text-[#0A0A0A]">{selectedRecord.mechanic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Est. Costs</span>
                    <span className="text-[#0A0A0A] font-mono">${selectedRecord.estimatedCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Scheduled Date</span>
                    <span className="text-[#0A0A0A] font-mono">{selectedRecord.scheduledDate}</span>
                  </div>
                </div>

                {/* Completion panel triggers */}
                {selectedRecord.status === 'In Progress' && (
                  <div className="pt-4 border-t border-[#E5E7EB]">
                    <button
                      onClick={() => {
                        setFinalCost(selectedRecord.estimatedCost.toString());
                        setTechNotes('');
                        setQualityChecked(false);
                        setShowCompletePanel(selectedRecord.id);
                      }}
                      className="w-full py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] transition-all cursor-pointer text-center shadow-sm"
                    >
                      Complete Repair Order
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-10 rounded-[16px] text-center text-[#9CA3AF] text-xs font-semibold py-20">
                Select a maintenance record to load workshop logs
              </div>
            )}
          </AnimatePresence>

          {/* AI Maintenance Insights */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
            <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
              <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Health Diagnostics
            </h3>

            <div className="space-y-3 text-[10.5px] font-semibold leading-normal">
              <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2 text-[#4B5563]">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Brake servicing recommended for vehicle TRK-201 within next 600 km due to harsh decelerations.
                </span>
              </div>
              <div className="p-3 bg-[#FEF2F2] border border-[#FBD5D5] rounded-[12px] flex items-start space-x-2 text-[#DC2626]">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>
                  Engine temperature anomaly detected in Ford Transit TRK-109. Preventive inspection advised.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* COMPLETE REPAIR WORK ORDER OVERLAY */}
      <ModalShell
        isOpen={!!showCompletePanel}
        onClose={() => setShowCompletePanel(null)}
        title="Complete Work Order"
        subtitle="Review repair outcomes and release the vehicle back into service"
        maxWidth="max-w-md"
      >
        {showCompletePanel && (
          <form onSubmit={(e) => handleCompleteSubmit(showCompletePanel, e)} className="space-y-4 text-left">
            <Field 
              label="Final Cost (USD)"
              type="number" 
              value={finalCost} 
              onChange={setFinalCost}
              required
            />

            <Field 
              label="Technician Quality Remarks"
              placeholder="e.g. Brake pads replaced. Test drive completed."
              value={techNotes} 
              onChange={setTechNotes}
              textarea
              required
            />

            <div className="flex items-center space-x-2 text-xs font-semibold text-[#4B5563] bg-[#F9FAFB]/50 p-2.5 border border-[#E5E7EB] rounded-[12px]">
              <input 
                type="checkbox" 
                checked={qualityChecked} 
                onChange={(e) => setQualityChecked(e.target.checked)}
                className="accent-primary"
              />
              <span>Confirm vehicle diagnostic verification passed.</span>
            </div>

            <div className="flex space-x-2 pt-2 border-t border-[#EEF1F4]">
              <button
                type="button"
                onClick={() => setShowCompletePanel(null)}
                className="flex-1 py-2 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#6B7280] text-xs font-bold rounded-[12px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cursor-pointer"
              >
                Release Vehicle
              </button>
            </div>
          </form>
        )}
      </ModalShell>

      {/* SCHEDULE SERVICE STEPPER MODAL */}
      {/* SCHEDULE SERVICE STEPPER MODAL */}
      <ModalShell
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Schedule Servicing — Step ${addStep} of 2`}
        subtitle="Configure servicing parameters and workshop targets for active assets"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
          {addStep === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <SelectField 
                label="Select Fleet Vehicle"
                value={selectedReg} 
                onChange={setSelectedReg}
                required
                options={[
                  { value: '', label: '-- Select active vehicle --' },
                  ...activeVehicles.map(veh => ({
                    value: veh.registrationNumber,
                    label: `${veh.name} (#${veh.registrationNumber})`
                  }))
                ]}
              />

              <SelectField 
                label="Maintenance Service Type"
                value={maintType} 
                onChange={(v) => setMaintType(v as any)}
                options={[
                  { value: 'General Service', label: 'General Service' },
                  { value: 'Oil Change', label: 'Oil Change' },
                  { value: 'Brake Service', label: 'Brake Service' },
                  { value: 'Engine Repair', label: 'Engine Repair' },
                  { value: 'Tyre Replacement', label: 'Tyre Replacement' },
                  { value: 'Battery', label: 'Battery Check' }
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Field 
                  label="Workshop Hub"
                  placeholder="e.g. Rapid Lube CHI" 
                  value={workshop} 
                  onChange={setWorkshop}
                  required
                />
                <Field 
                  label="Lead Mechanic"
                  placeholder="e.g. Tom Miller" 
                  value={mechanic} 
                  onChange={setMechanic}
                  required
                />
              </div>
            </motion.div>
          )}

          {addStep === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field 
                  label="Estimated Cost (USD)"
                  type="number" 
                  value={estCost} 
                  onChange={setEstCost}
                  required
                />
                <Field 
                  label="Scheduled Date"
                  type="date" 
                  value={schedDate} 
                  onChange={setSchedDate}
                  required
                />
              </div>

              <SelectField 
                label="Priority Level"
                value={priorityVal} 
                onChange={(v) => setPriorityVal(v as any)}
                options={[
                  { value: 'Low', label: 'Low Priority' },
                  { value: 'Medium', label: 'Medium Priority' },
                  { value: 'High', label: 'High Priority' }
                ]}
              />

              <Field 
                label="Servicing Remarks"
                placeholder="e.g. Schedule diagnostic check on cooling unit..."
                value={notes} 
                onChange={setNotes}
                textarea
              />
            </motion.div>
          )}

          {/* Footer Controls */}
          <div className="flex justify-between pt-4 border-t border-[#EEF1F4] select-none">
            <button
              type="button"
              onClick={() => addStep > 1 ? setAddStep(prev => prev - 1) : setShowAddModal(false)}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#6B7280] text-xs font-bold rounded-[12px] cursor-pointer"
            >
              {addStep === 1 ? 'Cancel' : 'Back'}
            </button>

            {addStep < 2 ? (
              <button
                type="button"
                onClick={() => setAddStep(prev => prev + 1)}
                className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] shadow-sm cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] shadow-sm cursor-pointer"
              >
                Schedule Servicing
              </button>
            )}
          </div>
        </form>
      </ModalShell>

    </Reveal>
  );
};
