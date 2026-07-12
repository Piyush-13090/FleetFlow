import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit2, 
  Wrench, 
  Download, 
  MoreHorizontal, 
  TrendingUp, 
  MapPin, 
  User, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Plus, 
  SlidersHorizontal,
  Compass,
  Truck
} from 'lucide-react';
import type { VehicleData } from './VehicleRegistry';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusPill } from '../ui/StatusPill';
import { Reveal } from '../ui/Reveal';
import { CardLabel } from '../ui/Card';

interface VehicleDetailsProps {
  vehicle: VehicleData;
  onClose: () => void;
  onEdit: (veh: VehicleData) => void;
  onShowToast: (msg: string) => void;
}

export const VehicleDetails: React.FC<VehicleDetailsProps> = ({
  vehicle,
  onClose,
  onEdit,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'maintenance' | 'trips' | 'fuel' | 'documents'>('maintenance');
  const [isDialOpen, setIsDialOpen] = useState(false);

  // Document Upload States
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedDocs, setUploadedDocs] = useState<string[]>(vehicle.documents || []);

  const handleDocumentUpload = (docType: string) => {
    setUploadProgress(prev => ({ ...prev, [docType]: 10 }));
    let progress = 10;
    const interval = setInterval(() => {
      progress += 30;
      setUploadProgress(prev => ({ ...prev, [docType]: Math.min(progress, 100) }));
      if (progress >= 100) {
        clearInterval(interval);
        setUploadedDocs(prev => [...prev, docType]);
        onShowToast(`Uploaded ${docType.replace('_', ' ')} successfully.`);
      }
    }, 200);
  };

  // Compute Total Cost
  const fuelCostSum = vehicle.fuelConsumption?.reduce((acc, curr) => acc + curr.cost, 0) || 0;
  const maintenanceCostSum = vehicle.maintenanceHistory?.reduce((acc, curr) => acc + curr.cost, 0) || 0;
  const totalCost = fuelCostSum + maintenanceCostSum + (vehicle.acquisitionCost * 0.05); // Simulated depreciation / other expenses

  // Fuel Efficiency (simulated calculation)
  const averageMpg = vehicle.specs?.mpg || 7.0;

  // Circular Health Circle Maths
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const healthOffset = circumference - (vehicle.health / 100) * circumference;

  return (
    <Reveal className="space-y-6 select-none relative text-left pb-20">
      
      {/* Sticky Action Header */}
      <SectionHeader
        title="Vehicle Details"
        subtitle="Monitor vehicle performance, operational history, maintenance, and expenses from one unified dashboard."
        onBack={onClose}
        actions={
          <>
            <button
              onClick={() => onEdit(vehicle)}
              className="px-3.5 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cc-shadow-sm hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Vehicle</span>
            </button>

            <button
              onClick={() => {
                onShowToast(`Scheduled maintenance check-in window for ${vehicle.registrationNumber}`);
              }}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-primary" />
              <span>Schedule Maintenance</span>
            </button>

            <button
              onClick={() => onShowToast('Exporting PDF operational summary report...')}
              className="px-3 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] rounded-[12px] transition-all cursor-pointer"
              title="Export Vehicle Report"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              className="p-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#9CA3AF] hover:text-[#4B5563] rounded-[12px] transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </>
        }
      />

      {/* Hero Vehicle Card */}
      <div className="bg-white border border-[#E5E7EB] p-6 rounded-[16px] cc-shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6 relative overflow-hidden">
        
        {/* Left: Illustration & Basic Specs */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row items-center gap-6">
          {/* Animated truck SVG illustration */}
          <div className="w-36 h-36 bg-[#0A0F1E] border border-slate-950 rounded-[12px] flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden group">
            <motion.div
              animate={vehicle.status === 'On Trip' ? { x: [-5, 5, -5] } : {}}
              transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
            >
              <svg width="100" height="70" viewBox="0 0 100 70" fill="none" stroke="#2563EB" strokeWidth="2.5" className="overflow-visible">
                <rect x="5" y="25" width="55" height="25" rx="2" />
                <path d="M60 30h12l14 10v10H60V30z" />
                <circle cx="22" cy="53" r="7" fill="#0A0F1E" stroke="#2563EB" strokeWidth="2.5" />
                <circle cx="72" cy="53" r="7" fill="#0A0F1E" stroke="#2563EB" strokeWidth="2.5" />
                <line x1="22" y1="53" x2="68" y2="53" />
              </svg>
            </motion.div>
            <div className="absolute top-2 left-2">
              <StatusPill status={vehicle.status} pulse={vehicle.status === 'Available'} />
            </div>
          </div>

          <div className="text-center sm:text-left space-y-2">
            <div>
              <h2 className="text-xl font-black text-[#0A0A0A] tracking-tight leading-tight">{vehicle.name}</h2>
              <span className="text-[10px] font-bold font-mono text-primary bg-[#EFF4FF] px-2 py-0.5 rounded-[4px] border border-[#DBE6FF] mt-1.5 inline-block">
                #{vehicle.registrationNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-semibold text-[#4B5563]">
              <div className="flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>{vehicle.type}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>{vehicle.region}</span>
              </div>
              <div className="flex items-center space-x-1.5 col-span-2">
                <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>Operator: <span className="text-[#0A0A0A] font-bold">{vehicle.assignedDriver}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Health Gauge & Counters */}
        <div className="border-t lg:border-t-0 lg:border-l border-[#F3F4F6] pt-6 lg:pt-0 lg:pl-6 flex items-center justify-between">
          <div className="space-y-4 flex-1 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider block font-sans">Odometer</span>
                <span className="text-base font-black text-[#0A0A0A] font-mono leading-none tabular-nums">
                  {vehicle.odometer.toLocaleString()} <span className="text-[9px] text-[#9CA3AF] font-bold font-sans">mi</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider block font-sans">Fuel Average</span>
                <span className="text-base font-black text-[#0A0A0A] font-mono leading-none tabular-nums">
                  {averageMpg} <span className="text-[9px] text-[#9CA3AF] font-bold font-sans">MPG</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider block font-sans">Operating Cost</span>
                <span className="text-base font-black text-[#0A0A0A] font-mono leading-none tabular-nums">
                  ${totalCost.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider block font-sans">Completed Trips</span>
                <span className="text-base font-black text-[#0A0A0A] font-mono leading-none tabular-nums">
                  {vehicle.tripsHistory?.filter(t => t.status === 'Completed').length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Circular Health Gauge */}
          <div className="relative w-20 h-20 shrink-0 ml-4 flex flex-col items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-[#F3F4F6]"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-primary"
                strokeWidth="5.5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={healthOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-[#0A0A0A] leading-none font-mono tabular-nums">{vehicle.health}%</span>
              <span className="text-[7.5px] uppercase font-bold text-[#9CA3AF] mt-0.5 tracking-wider font-sans">Health</span>
            </div>
          </div>

        </div>
      </div>

      {/* Two Column Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left col-span-2: Analytics & Workspace tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Performance Analytics Grid Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Chart 1: Fuel Efficiency Trend */}
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-[16px] cc-shadow-sm text-left">
              <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-2 mb-3">
                <CardLabel>Fuel Efficiency Trend</CardLabel>
                <span className="text-[9px] font-black text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#C7F0DC]">
                  Avg {averageMpg} MPG
                </span>
              </div>
              {/* Interactive Line Chart SVG */}
              <div className="h-44 w-full flex items-end relative pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="10" x2="200" y2="10" stroke="#F3F4F6" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#F3F4F6" strokeWidth="0.5" />
                  <line x1="0" y1="90" x2="200" y2="90" stroke="#E5E7EB" strokeWidth="0.5" />
                  
                  {/* Chart Path Area */}
                  <path d="M 10 90 L 10 70 L 50 65 L 90 75 L 130 55 L 170 45 L 190 50 L 190 90 Z" fill="url(#chartGrad)" />
                  {/* Chart Line */}
                  <path d="M 10 70 Q 30 67 50 65 T 90 75 T 130 55 T 170 45 T 190 50" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                  
                  {/* Interactive Nodes */}
                  <circle cx="170" cy="45" r="3" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1" />
                  
                  {/* X Axis Labels */}
                  <text x="10" y="99" fill="#9CA3AF" fontSize="6.5" fontWeight="bold">Feb</text>
                  <text x="50" y="99" fill="#9CA3AF" fontSize="6.5" fontWeight="bold">Mar</text>
                  <text x="90" y="99" fill="#9CA3AF" fontSize="6.5" fontWeight="bold">Apr</text>
                  <text x="130" y="99" fill="#9CA3AF" fontSize="6.5" fontWeight="bold">May</text>
                  <text x="170" y="99" fill="#9CA3AF" fontSize="6.5" fontWeight="bold">Jun</text>
                </svg>
              </div>
            </div>

            {/* Chart 2: Cost Stacked Bar Chart */}
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-[16px] cc-shadow-sm text-left">
              <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-2 mb-3">
                <CardLabel>Monthly Expense Stack ($)</CardLabel>
                <span className="text-[10px] font-bold text-[#4B5563] font-mono tabular-nums">
                  Total ${totalCost.toLocaleString()}
                </span>
              </div>
              {/* Stacked Bar Chart SVG */}
              <div className="h-44 w-full flex items-end relative pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
                  {/* Grid Lines */}
                  <line x1="0" y1="10" x2="200" y2="10" stroke="#F3F4F6" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#F3F4F6" strokeWidth="0.5" />
                  <line x1="0" y1="90" x2="200" y2="90" stroke="#E5E7EB" strokeWidth="0.5" />

                  {/* Bars (Fuel: Blue, Maintenance: Light-Blue, Tolls: Slate) */}
                  {/* Bar 1 (April) */}
                  <rect x="25" y="45" width="12" height="45" rx="1.5" fill="#2563EB" />
                  <rect x="25" y="30" width="12" height="15" rx="1" fill="#93C5FD" />
                  <rect x="25" y="20" width="12" height="10" rx="1" fill="#E5E7EB" />
                  
                  {/* Bar 2 (May) */}
                  <rect x="75" y="55" width="12" height="35" rx="1.5" fill="#2563EB" />
                  <rect x="75" y="40" width="12" height="15" rx="1" fill="#93C5FD" />
                  <rect x="75" y="32" width="12" height="8" rx="1" fill="#E5E7EB" />

                  {/* Bar 3 (June) */}
                  <rect x="125" y="35" width="12" height="55" rx="1.5" fill="#2563EB" />
                  <rect x="125" y="15" width="12" height="20" rx="1" fill="#93C5FD" />
                  <rect x="125" y="5" width="12" height="10" rx="1" fill="#E5E7EB" />

                  {/* Axis Labels */}
                  <text x="22" y="99" fill="#9CA3AF" fontSize="6.5" fontWeight="bold">April</text>
                  <text x="72" y="99" fill="#9CA3AF" fontSize="6.5" fontWeight="bold">May</text>
                  <text x="122" y="99" fill="#9CA3AF" fontSize="6.5" fontWeight="bold">June</text>

                  {/* Legends */}
                  <g transform="translate(150, 10)">
                    <rect width="5" height="5" fill="#2563EB" />
                    <text x="8" y="5" fill="#6B7280" fontSize="5.5" fontWeight="bold">Fuel</text>
                    <rect y="10" width="5" height="5" fill="#93C5FD" />
                    <text x="8" y="15" fill="#6B7280" fontSize="5.5" fontWeight="bold">Repairs</text>
                  </g>
                </svg>
              </div>
            </div>

          </div>

          {/* Operational Logs Workspace tab panel */}
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden text-left">
            
            {/* Tab Bar */}
            <div className="flex border-b border-[#E5E7EB] bg-[#F9FAFB]">
              {[
                { id: 'maintenance', label: 'Maintenance History' },
                { id: 'trips', label: 'Recent Trips' },
                { id: 'fuel', label: 'Fuel & Expense Logs' },
                { id: 'documents', label: 'Compliance Docs' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer focus:outline-none ${
                    activeTab === tab.id 
                      ? 'border-primary text-primary bg-white font-black' 
                      : 'border-transparent text-[#6B7280] hover:text-[#4B5563]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab contents */}
            <div className="p-5 min-h-[220px]">
              
              {/* TAB 1: MAINTENANCE TIMELINE */}
              {activeTab === 'maintenance' && (
                <div className="space-y-4">
                  {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-primary/10 space-y-5">
                      {vehicle.maintenanceHistory.map((item, idx) => (
                        <div key={idx} className="relative text-xs">
                          {/* Dot marker */}
                          <div className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 bg-blue-50 text-primary border border-[#DBE6FF] rounded-full flex items-center justify-center shadow-sm">
                            <Wrench className="w-2.5 h-2.5" />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <h5 className="font-bold text-[#0A0A0A] text-xs">{item.issue}</h5>
                            <span className="text-[11px] font-black font-mono text-[#0A0A0A] bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB] tabular-nums">
                              ${item.cost.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px] font-semibold text-[#4B5563] mt-2">
                            <div>
                              <span className="text-[#9CA3AF] block text-[9.5px] font-medium">Service Date</span>
                              <span className="text-[#0A0A0A] font-mono tabular-nums">{item.date}</span>
                            </div>
                            <div>
                              <span className="text-[#9CA3AF] block text-[9.5px] font-medium">Technician</span>
                              <span className="text-[#0A0A0A]">{item.shop}</span>
                            </div>
                            <div>
                              <span className="text-[#9CA3AF] block text-[9.5px] font-medium">Location</span>
                              <span className="text-[#0A0A0A]">Atlanta Hub Shop</span>
                            </div>
                            <div>
                              <span className="text-[#9CA3AF] block text-[9.5px] font-medium">Duration</span>
                              <span className="text-[#059669]">8.2 Hours (Complete)</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-[#9CA3AF] text-xs font-semibold">
                      No maintenance events logged for this asset.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: RECENT TRIPS TABLE */}
              {activeTab === 'trips' && (
                <div className="overflow-x-auto">
                  {vehicle.tripsHistory && vehicle.tripsHistory.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E5E7EB] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                          <th className="pb-2.5">Trip ID</th>
                          <th className="pb-2.5">Route</th>
                          <th className="pb-2.5">Dispatch Date</th>
                          <th className="pb-2.5">Cargo Load</th>
                          <th className="pb-2.5">Estimated Fuel</th>
                          <th className="pb-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        {vehicle.tripsHistory.map((trip) => (
                          <tr key={trip.id} className="hover:bg-[#F9FAFB]/50 transition-colors">
                            <td className="py-2.5 font-bold font-mono text-[#4B5563] tabular-nums">{trip.id}</td>
                            <td className="py-2.5 text-[#0A0A0A] font-bold">{trip.route}</td>
                            <td className="py-2.5 font-semibold text-[#6B7280] font-mono tabular-nums">{trip.date}</td>
                            <td className="py-2.5 font-mono text-[#4B5563] tabular-nums">42,000 lbs</td>
                            <td className="py-2.5 font-mono text-[#4B5563] tabular-nums">110 Gallons</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                                trip.status === 'Completed' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#EFF4FF] text-primary'
                              }`}>
                                {trip.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-10 text-[#9CA3AF] text-xs font-semibold">
                      No dispatch history available for this asset.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FUEL LOGS */}
              {activeTab === 'fuel' && (
                <div className="space-y-4">
                  {/* Fuel Quick statistics banner */}
                  <div className="grid grid-cols-3 gap-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] p-3 mb-4 text-xs font-semibold text-[#4B5563]">
                    <div>
                      <span className="text-[9.5px] text-[#9CA3AF] block font-medium">Total Fuel Used</span>
                      <span className="font-mono text-[#0A0A0A] font-bold tabular-nums">230 Gallons</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-[#9CA3AF] block font-medium">Average Cost / Gal</span>
                      <span className="font-mono text-[#0A0A0A] font-bold tabular-nums">$3.42</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-[#9CA3AF] block font-medium">Monthly Spend</span>
                      <span className="font-mono text-[#0A0A0A] font-bold tabular-nums">${fuelCostSum.toLocaleString()}</span>
                    </div>
                  </div>

                  {vehicle.fuelConsumption && vehicle.fuelConsumption.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {vehicle.fuelConsumption.map((fuel, idx) => (
                        <div key={idx} className="p-3 bg-white border border-[#E5E7EB] rounded-[12px] flex items-center justify-between shadow-sm">
                          <div>
                            <span className="text-[9.5px] text-[#9CA3AF] font-bold block font-mono tabular-nums">{fuel.date}</span>
                            <span className="text-xs font-black text-[#0A0A0A] mt-0.5 block font-mono tabular-nums">{fuel.gallons} Gallons Added</span>
                            <span className="text-[10px] text-[#6B7280] font-medium">Station: Pilot Travel Center</span>
                          </div>
                          <span className="text-xs font-black font-mono text-[#0A0A0A] bg-[#F3F4F6] px-2 py-1 rounded-[6px] border border-[#E5E7EB] tabular-nums">
                            ${fuel.cost.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-[#9CA3AF] text-xs font-semibold">
                      No fuel invoices logged for this vehicle.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DOCUMENT MANAGER */}
              {activeTab === 'documents' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'Insurance', name: 'Insurance Policy', expiry: '2026-11-20' },
                    { id: 'Registration', name: 'Registration Certificate', expiry: '2027-04-18' },
                    { id: 'Permits', name: 'IFTA Permits', expiry: '2026-09-12' }
                  ].map((doc) => {
                    const isUploaded = uploadedDocs.includes(doc.id);
                    const progress = uploadProgress[doc.id] || 0;

                    return (
                      <div key={doc.id} className="p-4 border border-[#E5E7EB] bg-white rounded-[12px] shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden text-left">
                        <div className="flex justify-between items-start">
                          <FileText className={`w-8 h-8 ${isUploaded ? 'text-primary' : 'text-[#9CA3AF]'}`} />
                          {isUploaded ? (
                            <span className="text-[9px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#C7F0DC]">Compliant</span>
                          ) : (
                            <span className="text-[9px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FBD5D5]">Missing</span>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-black text-[#0A0A0A] leading-tight">{doc.name}</h4>
                          <span className="text-[9.5px] text-[#9CA3AF] font-semibold block mt-1 font-mono tabular-nums">Expiry: {doc.expiry}</span>
                        </div>

                        {progress > 0 && progress < 100 && (
                          <div className="w-full bg-[#F3F4F6] h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                        )}

                        <div className="flex space-x-1.5 pt-2 border-t border-[#F3F4F6]">
                          <button
                            onClick={() => onShowToast(`Downloading ${doc.name}...`)}
                            disabled={!isUploaded}
                            className="flex-1 py-1.5 border border-[#E5E7EB] hover:bg-[#F9FAFB] disabled:opacity-40 text-[10px] font-black text-[#4B5563] rounded-[8px] cursor-pointer text-center"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDocumentUpload(doc.id)}
                            className="flex-1 py-1.5 bg-primary hover:bg-[#1D4ED8] text-[10px] font-black text-white rounded-[8px] cursor-pointer text-center"
                          >
                            Replace
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Column: AI insights, Smart alerts, Timelines */}
        <div className="space-y-6 text-left">
          
          {/* AI insights panel */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
            <h4 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
              <Compass className="w-4 h-4 text-primary mr-1.5" /> Fleet Intelligence
            </h4>

            <div className="space-y-3">
              <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2.5 text-xs text-[#4B5563] font-semibold">
                <TrendingUp className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0A0A0A]">Fuel efficiency drop</span>
                  <p className="text-[10px] text-[#6B7280] font-medium mt-0.5 leading-normal">
                    This Volvo D13 is reporting a 6% efficiency decrease this month. Injector diagnostic advised.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2.5 text-xs text-[#4B5563] font-semibold">
                <Wrench className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0A0A0A]">Service Recommended</span>
                  <p className="text-[10px] text-[#6B7280] font-medium mt-0.5 leading-normal font-mono tabular-nums">
                    Odometer has crossed 142k miles. Routine Class-A service due in 800 miles.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2.5 text-xs text-[#4B5563] font-semibold">
                <Activity className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0A0A0A]">Active Utilization</span>
                  <p className="text-[10px] text-[#6B7280] font-medium mt-0.5 leading-normal">
                    Daily dispatch rate is 18% above fleet average. Ensure driver rotations are logged.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Alerts list panel */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
            <h4 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2">
              Corporate Registry Alerts
            </h4>
            
            <div className="space-y-3">
              <div className="p-3 bg-[#FEF2F2] border-l-4 border-[#DC2626] rounded-r-[12px] flex items-start space-x-2 text-xs text-[#4B5563] font-semibold">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-[#DC2626] block leading-tight">Insurance Policy Warning</span>
                  <span className="text-[9.5px] text-[#9CA3AF] font-mono block mt-1 tabular-nums">Expiry Date: 2026-11-20</span>
                </div>
              </div>

              <div className="p-3 bg-[#FFFBEB] border-l-4 border-[#D97706] rounded-r-[12px] flex items-start space-x-2 text-xs text-[#4B5563] font-semibold">
                <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#D97706] block leading-tight">Low Fuel efficiency warning</span>
                  <span className="text-[9.5px] text-[#6B7280] font-medium block mt-1">Efficiency dropped by 6% since last service.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed vehicle chronological timeline */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
            <h4 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2">
              Vehicle Operational Timeline
            </h4>
            <div className="relative pl-5 space-y-4 border-l-2 border-primary/10 text-left">
              {vehicle.timeline?.map((item, idx) => (
                <div key={idx} className="relative text-[11px] font-semibold text-[#4B5563]">
                  {/* Dot indicator */}
                  <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
                  <span className="text-[#0A0A0A] block leading-tight">{item.event}</span>
                  <span className="text-[9px] text-[#9CA3AF] font-mono block mt-1 tabular-nums">{item.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Floating Speed Dial quick actions */}
      <div className="fixed bottom-6 right-20 z-40 select-none">
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {isDialOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-14 flex flex-col space-y-2 shrink-0 animate-shake"
              >
                <button
                  onClick={() => { onShowToast('Fuel entry log interface initiated.'); setIsDialOpen(false); }}
                  className="px-3.5 py-2 bg-white hover:bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] text-[11px] font-bold rounded-[12px] cc-shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer hover:text-[#0A0A0A]"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Log Fuel invoice</span>
                </button>
                <button
                  onClick={() => { onShowToast('Scheduling next oil/engine checks...'); setIsDialOpen(false); }}
                  className="px-3.5 py-2 bg-white hover:bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] text-[11px] font-bold rounded-[12px] cc-shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer hover:text-[#0A0A0A]"
                >
                  <Wrench className="w-3.5 h-3.5 text-primary" />
                  <span>Schedule Service</span>
                </button>
                <button
                  onClick={() => { onShowToast('Assign operator workflow...'); setIsDialOpen(false); }}
                  className="px-3.5 py-2 bg-white hover:bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB] text-[11px] font-bold rounded-[12px] cc-shadow-lg flex items-center space-x-1.5 whitespace-nowrap cursor-pointer hover:text-[#0A0A0A]"
                >
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Assign Driver</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onMouseEnter={() => setIsDialOpen(true)}
            onMouseLeave={() => setIsDialOpen(false)}
            onClick={() => setIsDialOpen(!isDialOpen)}
            className="w-12 h-12 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all border border-[#E5E7EB] cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Reveal>
  );
};
