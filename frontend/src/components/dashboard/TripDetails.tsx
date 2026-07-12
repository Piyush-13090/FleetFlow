import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Sparkles,
  Truck,
  MapPin,
  Layers,
  History,
  DollarSign
} from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusPill } from '../ui/StatusPill';
import { Reveal } from '../ui/Reveal';
import { Field, SelectField } from '../ui/Field';

interface TripDetailsProps {
  trip: any;
  onClose: () => void;
  onEdit: () => void;
  onShowToast: (msg: string) => void;
  onUpdateStatus: (tripId: string, newStatus: 'Completed' | 'Cancelled') => void;
}

// Custom pure SVG Donut Chart for expense breakdown
const DonutChart: React.FC<{ fuel: number; tolls: number; maintenance: number; misc: number }> = ({ fuel, tolls, maintenance, misc }) => {
  const total = fuel + tolls + maintenance + misc || 1;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  
  const fuelP = (fuel / total) * 100;
  const tollsP = (tolls / total) * 100;
  const maintP = (maintenance / total) * 100;
  
  const fuelOffset = circumference;
  const tollsOffset = circumference - (fuelP / 100) * circumference;
  const maintOffset = tollsOffset - (tollsP / 100) * circumference;
  const miscOffset = maintOffset - (maintP / 100) * circumference;

  return (
    <svg width="100%" height="80" viewBox="0 0 100 80" className="overflow-visible select-none">
      <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#E2E8F0" strokeWidth="4.5" />
      {/* Fuel slice (blue-600) */}
      <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#2563EB" strokeWidth="4.5" strokeDasharray={circumference} strokeDashoffset={fuelOffset} transform="rotate(-90 40 40)" />
      {/* Tolls slice (blue-400) */}
      <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#3B82F6" strokeWidth="4.5" strokeDasharray={circumference} strokeDashoffset={tollsOffset} transform="rotate(-90 40 40)" />
      {/* Maintenance slice (blue-200) */}
      <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#DBEAFE" strokeWidth="4.5" strokeDasharray={circumference} strokeDashoffset={maintOffset} transform="rotate(-90 40 40)" />
      {/* Misc slice (slate-400) */}
      <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#94A3B8" strokeWidth="4.5" strokeDasharray={circumference} strokeDashoffset={miscOffset} transform="rotate(-90 40 40)" />
      
      <g transform="translate(75, 20)" className="text-[7.5px] font-bold text-slate-600 space-y-1">
        <text x="0" y="0" fill="#2563EB">Fuel</text>
        <text x="0" y="10" fill="#3B82F6">Tolls</text>
        <text x="0" y="20" fill="#64748B">Misc</text>
      </g>
    </svg>
  );
};

export const TripDetails: React.FC<TripDetailsProps> = ({
  trip,
  onClose,
  onEdit,
  onShowToast,
  onUpdateStatus
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'timeline'>('overview');
  
  // Completion form states
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [finalOdo, setFinalOdo] = useState('142800');
  const [fuelConsumed, setFuelConsumed] = useState('42');
  const [notes, setNotes] = useState('');
  const [deliverySign, setDeliverySign] = useState(false);

  // Cancellation form states
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('Mechanical Failure');
  const [cancelComments, setCancelComments] = useState('');

  const isDispatched = trip.status === 'Dispatched' || trip.status === 'On Trip' || trip.status === 'Delayed';

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverySign) {
      onShowToast('Customer delivery signature confirmation is required.');
      return;
    }
    onUpdateStatus(trip.id, 'Completed');
    setShowCompleteForm(false);
    onShowToast(`Trip #${trip.id} completed. Vehicle & Driver returned to Available status.`);
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(trip.id, 'Cancelled');
    setShowCancelForm(false);
    onShowToast(`Trip #${trip.id} cancelled. Vehicle & Driver returned to Available status.`);
  };

  // SVG circular readiness progress math
  const safetyScore = 95;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safetyScore / 100) * circumference;

  return (
    <Reveal className="space-y-6 select-none relative text-left">
      
      {/* Sticky top action header */}
      <SectionHeader
        title="Trip Details Command Center"
        subtitle="Track every stage of a transport operation from dispatch to completion with complete operational visibility."
        onBack={onClose}
        actions={
          <>
            {isDispatched && (
              <>
                <button
                  onClick={() => { setShowCancelForm(false); setShowCompleteForm(true); }}
                  className="px-3.5 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] transition-all cursor-pointer shadow-sm"
                >
                  Complete Trip
                </button>
                <button
                  onClick={() => { setShowCompleteForm(false); setShowCancelForm(true); }}
                  className="px-3.5 py-2 border border-rose-205 bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEF2F2]/80 text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm"
                >
                  Cancel Trip
                </button>
              </>
            )}

            <button
              onClick={onEdit}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm"
            >
              Edit Trip
            </button>

            <button
              onClick={() => onShowToast('Exporting operational route manifest...')}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm"
            >
              Export Report
            </button>
          </>
        }
      />

      {/* Hero Trip Card */}
      <div className="bg-white border border-[#E5E7EB] p-6 rounded-[16px] cc-shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
        <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-[#F3F4F6] pb-5 md:pb-0 md:pr-6 flex flex-col justify-between text-left space-y-3.5">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold font-mono text-[#9CA3AF] uppercase tracking-wider block">Trip ID</span>
              <StatusPill status={trip.status} pulse={isDispatched} />
            </div>
            <h2 className="text-lg font-black text-[#0A0A0A] tracking-tight leading-tight mt-1 font-mono">{trip.id}</h2>
            <p className="text-xs text-[#4B5563] font-semibold mt-1">{trip.route}</p>
          </div>

          <div className="space-y-1.5 text-[11px] font-semibold text-[#4B5563]">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>Region: {trip.region}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span className="font-mono tabular-nums">Cargo Weight: {trip.cargoWeight} lbs</span>
            </div>
          </div>
        </div>

        {/* Route Illustration Map */}
        <div className="md:col-span-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] p-4 flex flex-col justify-between relative overflow-hidden h-36">
          <svg className="absolute inset-0 w-full h-full select-none">
            <path d="M 40,70 Q 150,20 280,70" fill="none" stroke="#DBEAFE" strokeWidth="4" strokeLinecap="round" />
            <path d="M 40,70 Q 150,20 280,70" fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
            <circle cx="40" cy="70" r="5" fill="#2563EB" />
            <circle cx="280" cy="70" r="5" fill="#2563EB" />
          </svg>
          <div className="absolute top-1/2 left-[40px] -translate-y-1/2 bg-white px-2 py-1 border border-[#E5E7EB] rounded-[8px] text-[9px] font-black cc-shadow-sm">
            Source Depot
          </div>
          <div className="absolute top-1/2 right-[40px] -translate-y-1/2 bg-white px-2 py-1 border border-[#E5E7EB] rounded-[8px] text-[9px] font-black cc-shadow-sm">
            Destination Hub
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex space-x-1 border-b border-[#E5E7EB] pb-px">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'finance', label: 'Fuel & Expenses', icon: DollarSign },
          { id: 'timeline', label: 'Trip Timeline Logs', icon: History }
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 border-b-2 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer focus:outline-none ${
                isActive 
                  ? 'border-primary text-primary font-black' 
                  : 'border-transparent text-[#9CA3AF] hover:text-[#4B5563]'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT WIDGETS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dispatch Assets details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                
                {/* Driver information */}
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
                    <User className="w-4 h-4 text-primary mr-1.5" /> Assigned Driver Profile
                  </h3>

                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#EFF4FF] text-primary border border-[#DBE6FF] flex items-center justify-center shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#0A0A0A] leading-tight">{trip.driver}</h4>
                      <span className="text-[9.5px] text-[#9CA3AF] block font-semibold mt-0.5">CDL-A License Compliant</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F3F4F6] flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase">Safety Rating</span>
                    <span className="text-xs font-black text-primary">95% (Excellent)</span>
                  </div>
                </div>

                {/* Vehicle specifications */}
                <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
                    <Truck className="w-4 h-4 text-primary mr-1.5" /> Assigned Vehicle specs
                  </h3>

                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-[12px] bg-[#F9FAFB] text-primary border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#0A0A0A] leading-tight font-mono">{trip.vehicle}</h4>
                      <span className="text-[9.5px] text-[#9CA3AF] block font-semibold mt-0.5">{trip.vehicleType}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#F3F4F6] flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase">Health Index</span>
                    <span className="text-xs font-black text-[#059669]">92% Healthy</span>
                  </div>
                </div>

              </div>

              {/* Completion and Cancellation panels */}
              <AnimatePresence>
                {showCompleteForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4 text-left overflow-hidden"
                  >
                    <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center text-primary">
                      <CheckCircle2 className="w-4.5 h-4.5 mr-1.5" /> Complete Trip Wizard
                    </h3>
                    
                    <form onSubmit={handleCompleteSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Field 
                          label="Final Odometer Reading (mi)"
                          type="number" 
                          value={finalOdo} 
                          onChange={setFinalOdo}
                          required
                        />
                        <Field 
                          label="Total Fuel Consumed (Gal)"
                          type="number" 
                          value={fuelConsumed} 
                          onChange={setFuelConsumed}
                          required
                        />
                      </div>

                      <Field 
                        label="Delivery Notes / Comments"
                        placeholder="e.g. Delivered on time. Container seal verified secure."
                        value={notes} 
                        onChange={setNotes}
                        textarea
                      />

                      <div className="flex items-center space-x-2 text-xs font-semibold text-[#4B5563] bg-[#F9FAFB]/50 p-2.5 border border-[#E5E7EB] rounded-[12px]">
                        <input 
                          type="checkbox" 
                          checked={deliverySign} 
                          onChange={(e) => setDeliverySign(e.target.checked)}
                          className="accent-primary"
                        />
                        <span>I confirm that the customer signature for delivery receipt has been uploaded.</span>
                      </div>

                      <div className="flex justify-end space-x-2 pt-2 border-t border-[#F3F4F6]">
                        <button
                          type="button"
                          onClick={() => setShowCompleteForm(false)}
                          className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#6B7280] text-xs font-bold rounded-[12px] cursor-pointer"
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] shadow-sm cursor-pointer cc-shadow-sm"
                        >
                          Complete Trip Now
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {showCancelForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm space-y-4 text-left overflow-hidden"
                  >
                    <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center text-[#DC2626]">
                      <XCircle className="w-4.5 h-4.5 mr-1.5" /> Cancel Trip Wizard
                    </h3>

                    <form onSubmit={handleCancelSubmit} className="space-y-4">
                      <SelectField 
                        label="Cancellation Reason Category"
                        value={cancelReason} 
                        onChange={setCancelReason}
                        options={[
                          { value: 'Mechanical Failure', label: 'Mechanical Failure / Vehicle Breakdown' },
                          { value: 'Traffic Lock', label: 'Severe Weather / Road Closures' },
                          { value: 'Customer Request', label: 'Customer Request Cancellation' },
                          { value: 'Staff Shortage', label: 'Staff Shortage / Driver Shift Delay' }
                        ]}
                      />

                      <Field 
                        label="Cancellation Comments"
                        placeholder="e.g. Engine coolant leaking. Tow scheduled."
                        value={cancelComments} 
                        onChange={setCancelComments}
                        textarea
                        required
                      />

                      <div className="flex justify-end space-x-2 pt-2 border-t border-[#F3F4F6]">
                        <button
                          type="button"
                          onClick={() => setShowCancelForm(false)}
                          className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#6B7280] text-xs font-bold rounded-[12px] cursor-pointer"
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-[12px] shadow-sm cursor-pointer cc-shadow-sm"
                        >
                          Cancel Trip Now
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Right side: Insights and Readiness */}
            <div className="space-y-6 text-left">
              
              {/* Driver Safety Score Circle */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-center space-y-4">
                <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 text-left">
                  Operator Safety Dials
                </h3>

                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} className="stroke-[#F3F4F6]" strokeWidth="5.5" fill="transparent" />
                    <circle cx="48" cy="48" r={radius} className="stroke-primary" strokeWidth="5.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none leading-none">
                    <span className="text-lg font-black text-[#0A0A0A] font-mono tabular-nums">{safetyScore}%</span>
                    <span className="text-[8px] text-[#9CA3AF] font-bold uppercase mt-1">Safety Rating</span>
                  </div>
                </div>

                <p className="text-[10px] font-bold text-[#9CA3AF] leading-normal">
                  Excellent defensive driving logs recorded during last dispatch.
                </p>
              </div>

              {/* AI Performance Insights */}
              <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
                <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
                  <Sparkles className="w-4 h-4 text-primary mr-1.5" /> AI Route Insights
                </h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2 text-[#4B5563]">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                    <span className="text-[10.5px] leading-normal font-semibold">
                      Trip is progressing on schedule. Expected delivery arrival in 48 minutes.
                    </span>
                  </div>
                  <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2 text-[#4B5563]">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                    <span className="text-[10.5px] leading-normal font-semibold">
                      Suggested refueling hub: Pilot Station 12 miles ahead offers the best MPG fleet price.
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: FUEL & EXPENSES */}
        {activeTab === 'finance' && (
          <motion.div
            key="finance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              
              {/* Fuel Logs Table */}
              <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="p-4 border-b border-[#F3F4F6]">
                    <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase">Operational Refueling Logs</h3>
                  </div>

                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[9.5px] text-[#9CA3AF] font-bold uppercase tracking-wider">
                        <th className="p-3 pl-5 text-left">Date</th>
                        <th className="p-3 text-left">Refueling Station</th>
                        <th className="p-3 text-left">Fuel Qty</th>
                        <th className="p-3 text-right pr-5">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6] text-[10.5px] font-semibold text-[#4B5563]">
                      <tr>
                        <td className="p-3 pl-5">2026-07-12</td>
                        <td className="p-3">Love's Travel Stop #102</td>
                        <td className="p-3">45 Gal</td>
                        <td className="p-3 text-right pr-5 font-mono text-[#0A0A0A]">$162.00</td>
                      </tr>
                      <tr>
                        <td className="p-3 pl-5">2026-07-11</td>
                        <td className="p-3">Pilot Refueling depot</td>
                        <td className="p-3">50 Gal</td>
                        <td className="p-3 text-right pr-5 font-mono text-[#0A0A0A]">$180.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex justify-between items-center text-xs font-bold text-[#4B5563]">
                  <span>Total Refueling Costs</span>
                  <span className="font-mono text-primary text-sm font-black">$342.00</span>
                </div>
              </div>

              {/* Expense Logs */}
              <div className="bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm overflow-hidden flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="p-4 border-b border-[#F3F4F6]">
                    <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase">Tolls & Maintenance Expenses</h3>
                  </div>

                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[9.5px] text-[#9CA3AF] font-bold uppercase tracking-wider">
                        <th className="p-3 pl-5 text-left">Expense Type</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-right pr-5">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6] text-[10.5px] font-semibold text-[#4B5563]">
                      <tr>
                        <td className="p-3 pl-5">Midwest Turnpike Tolls</td>
                        <td className="p-3">2026-07-12</td>
                        <td className="p-3">Tolls</td>
                        <td className="p-3 text-right pr-5 font-mono text-[#0A0A0A]">$45.00</td>
                      </tr>
                      <tr>
                        <td className="p-3 pl-5">Brake Pad Fluid Check</td>
                        <td className="p-3">2026-07-10</td>
                        <td className="p-3">Maintenance</td>
                        <td className="p-3 text-right pr-5 font-mono text-[#0A0A0A]">$85.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex justify-between items-center text-xs font-bold text-[#4B5563]">
                  <span>Total Non-Fuel Expenses</span>
                  <span className="font-mono text-primary text-sm font-black">$130.00</span>
                </div>
              </div>

            </div>

            {/* Expense Breakdown Donut Chart */}
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left max-w-sm">
              <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2">
                Operational Expense Split
              </h3>
              <div className="pt-4 flex items-center justify-between">
                <div className="w-1/2">
                  <DonutChart fuel={342} tolls={45} maintenance={85} misc={0} />
                </div>
                <div className="w-1/2 text-xs font-semibold text-[#4B5563] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Fuel</span>
                    <span className="font-mono font-bold text-[#0A0A0A]">$342.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Tolls</span>
                    <span className="font-mono font-bold text-[#0A0A0A]">$45.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF] font-medium">Maint.</span>
                    <span className="font-mono font-bold text-[#0A0A0A]">$85.00</span>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 3: TIMELINE */}
        {activeTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4"
          >
            <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2">Trip Dispatch Timeline</h3>
            
            <div className="relative pl-5 space-y-5 border-l-2 border-primary/10 max-w-xl">
              {[
                { time: '08:30 AM', event: 'Trip Created & Logged', desc: 'Route generated from CHI to ATL terminal.', user: 'System Agent' },
                { time: '09:00 AM', event: 'Asset Dispatched from Terminal', desc: 'Vehicle checked out and driver CDL confirmed.', user: 'Fleet Manager (Acme)' },
                { time: '11:15 AM', event: 'Refueling Logged', desc: '45 gallons added at Love\'s Stop #102.', user: trip.driver }
              ].map((item, idx) => (
                <div key={idx} className="relative text-xs font-semibold text-[#4B5563]">
                  <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full animate-ping" />
                  <div className="absolute -left-[26px] top-1 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
                  <span className="text-sm font-bold text-[#0A0A0A] block leading-tight">{item.event}</span>
                  <p className="text-[11px] text-[#6B7280] font-medium mt-1 leading-normal">{item.desc}</p>
                  <div className="flex space-x-2 text-[9px] text-[#9CA3AF] font-mono mt-1">
                    <span>{item.time}</span>
                    <span>•</span>
                    <span>Operator: {item.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </Reveal>
  );
};
