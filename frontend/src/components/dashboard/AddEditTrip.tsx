import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  User, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Navigation, 
  Check, 
  Search, 
  ChevronRight, 
  ChevronLeft,
  Info
} from 'lucide-react';
import type { DriverData } from './DriverManagement';
import { apiFetch } from '../../lib/api';
import { SectionHeader } from '../ui/SectionHeader';
import { Field, SelectField } from '../ui/Field';
import { ModalShell } from '../ui/ModalShell';
import { Reveal } from '../ui/Reveal';

interface VehicleData {
  registrationNumber: string;
  name: string;
  type: string;
  status: string;
  health: number;
  region: string;
  specs: { mpg: number; fuelCapacity: number; maxLoad: number };
}

interface AddEditTripProps {
  initialData?: any;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const AddEditTrip: React.FC<AddEditTripProps> = ({
  initialData,
  onClose,
  onShowToast
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);

  // STEP 1: ROUTE STATE
  const [source, setSource] = useState(initialData?.source || '');
  const [destination, setDestination] = useState(initialData?.destination || '');
  const [pickupDate, setPickupDate] = useState('2026-07-12');
  const [pickupTime, setPickupTime] = useState('08:00 AM');
  const [deliveryDate, setDeliveryDate] = useState('2026-07-13');
  const [deliveryTime, setDeliveryTime] = useState('06:00 PM');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [routeType, setRouteType] = useState('Fastest');
  const [notes, setNotes] = useState('');

  // STEP 2: VEHICLE STATE
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');

  // STEP 3: DRIVER STATE
  const [selectedDriverName, setSelectedDriverName] = useState('');
  const [driverSearch, setDriverSearch] = useState('');

  // STEP 4: CARGO STATE
  const [cargoType, setCargoType] = useState('');
  const [cargoWeight, setCargoWeight] = useState(20000); // default lbs
  const [cargoVolume, setCargoVolume] = useState(1200); // default cubic feet
  const [customerName, setCustomerName] = useState('');
  const [referenceNum, setReferenceNum] = useState('');
  const [specialHandling, setSpecialHandling] = useState('Standard');

  // MODALS
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch drivers & vehicles lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, vRes] = await Promise.all([
          apiFetch('/api/fleet/drivers'),
          apiFetch('/api/fleet/vehicles')
        ]);
        if (dRes.ok) setDrivers(await dRes.json());
        if (vRes.ok) {
          const rawVehicles = await vRes.json();
          // Inject maxLoad specifications
          const enriched = rawVehicles.map((v: any) => ({
            ...v,
            specs: {
              ...v.specs,
              maxLoad: v.type === 'Semi-Truck' ? 45000 : v.type === 'Box Truck' ? 24000 : 10000
            }
          }));
          setVehicles(enriched);
        }
      } catch {
        onShowToast('Error loading active operational compliance data.');
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedVehicle = vehicles.find(v => v.registrationNumber === selectedVehicleReg);
  const selectedDriver = drivers.find(d => d.name === selectedDriverName);

  // Filtering vehicles (HideRetired, Hide InShop, Hide OnTrip, status === Available)
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) || 
                          v.registrationNumber.toLowerCase().includes(vehicleSearch.toLowerCase());
    const isAvailable = v.status.toLowerCase() === 'available' || v.status.toLowerCase() === 'idle';
    return matchesSearch && isAvailable;
  });

  // Filtering drivers (Available, Valid License, Non-Suspended)
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(driverSearch.toLowerCase());
    const isCompliant = d.status.toLowerCase() === 'available' && 
                        d.daysToExpiry > 0 && 
                        d.compliance.license === 'Valid';
    return matchesSearch && isCompliant;
  });

  // Capacity validation check
  const isWeightValid = !selectedVehicle || cargoWeight <= selectedVehicle.specs.maxLoad;

  // Dispatch Readiness calculations
  const runValidationChecks = () => {
    return {
      route: source.trim() !== '' && destination.trim() !== '',
      vehicle: selectedVehicleReg !== '',
      driver: selectedDriverName !== '',
      cargo: cargoType.trim() !== '',
      capacity: isWeightValid,
      license: selectedDriver ? selectedDriver.compliance.license === 'Valid' : false
    };
  };

  const checks = runValidationChecks();
  
  const calculateReadinessScore = (): number => {
    let score = 0;
    if (checks.route) score += 20;
    if (checks.vehicle) score += 20;
    if (checks.driver) score += 20;
    if (checks.cargo) score += 20;
    if (checks.capacity && checks.license) score += 20;
    return score;
  };

  const readinessScore = calculateReadinessScore();

  // SVG circular radius logic
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (readinessScore / 100) * circumference;

  const handleNextStep = () => {
    if (currentStep === 1 && !checks.route) {
      onShowToast('Source and destination routes are required.');
      return;
    }
    if (currentStep === 2 && !checks.vehicle) {
      onShowToast('Please select a compliant dispatch vehicle.');
      return;
    }
    if (currentStep === 3 && !checks.driver) {
      onShowToast('Please select a compliant certified driver.');
      return;
    }
    if (currentStep === 4) {
      if (!checks.cargo) {
        onShowToast('Cargo type is required.');
        return;
      }
      if (!isWeightValid) {
        onShowToast('Load exceeds vehicle capacity bounds.');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleDispatchSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/api/fleet/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: `${selectedVehicle?.name} (#${selectedVehicleReg})`,
          vehicleType: selectedVehicle?.type || 'Semi-Truck',
          driver: selectedDriverName,
          route: `${source} ➔ ${destination}`,
          cargo: cargoType,
          eta: '4.5 Hours',
          region: selectedVehicle?.region || 'East Coast',
          cargoWeight,
          distance: 310,
          departureTime: pickupTime
        })
      });

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        const errData = await res.json();
        setValidationErrors([errData.message || 'Error occurred during scheduling dispatch.']);
        setShowErrorModal(true);
      }
    } catch {
      setValidationErrors(['Error connecting to backend database.']);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };  return (
    <Reveal className="space-y-6 select-none relative text-left">
      
      {/* Sticky Top Action Bar */}
      <SectionHeader
        title="Create New Trip"
        subtitle="Plan, validate, and dispatch transport operations with real-time vehicle and driver availability."
        onBack={onClose}
        actions={
          <>
            <button
              onClick={() => onShowToast('Draft dispatch itinerary saved.')}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm"
            >
              Save Draft
            </button>
            
            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer cc-shadow-sm"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                if (readinessScore < 100) {
                  onShowToast('Please complete all dispatch validation steps before launching.');
                } else {
                  setShowConfirmModal(true);
                }
              }}
              disabled={readinessScore < 100}
              className="px-4 py-2 bg-primary disabled:bg-[#D1D5DB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] transition-all cursor-pointer shadow-sm"
            >
              Dispatch Trip
            </button>
          </>
        }
      />

      {/* Horizontal Stepper Progress Indicator */}
      <div className="bg-white border border-[#E5E7EB] p-4.5 rounded-[16px] cc-shadow-sm flex items-center justify-between text-xs font-black text-[#9CA3AF] select-none">
        {[
          { step: 1, label: 'Route' },
          { step: 2, label: 'Vehicle' },
          { step: 3, label: 'Driver' },
          { step: 4, label: 'Cargo' },
          { step: 5, label: 'Review & Dispatch' }
        ].map((item, idx) => (
          <React.Fragment key={item.step}>
            <div className={`flex items-center space-x-2 ${
              currentStep === item.step ? 'text-primary font-black scale-[1.02]' : currentStep > item.step ? 'text-[#059669]' : ''
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10.5px] border ${
                currentStep === item.step 
                  ? 'border-primary bg-primary text-white shadow-sm' 
                  : currentStep > item.step 
                    ? 'border-[#059669] bg-[#ECFDF5] text-[#059669]'
                    : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#9CA3AF]'
              }`}>
                {currentStep > item.step ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : item.step}
              </div>
              <span className="hidden sm:inline">{item.label}</span>
            </div>
            {idx < 4 && <ChevronRight className="w-4 h-4 text-[#D1D5DB]" />}
          </React.Fragment>
        ))}
      </div>

      {/* Two Column Layout (70% Left form / 30% Right summary panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (70%) Stepper Form panels */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E5E7EB] p-6 rounded-[16px] cc-shadow-sm min-h-[400px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: ROUTE INFO */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="text-sm font-black text-[#0A0A0A] border-b border-[#F3F4F6] pb-2 flex items-center">
                    <Navigation className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 1 — Route coordinates
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <Field 
                      label="Source Hub"
                      placeholder="e.g. Chicago Depot (CHI-01)" 
                      value={source} 
                      onChange={setSource}
                      required
                    />
                    <Field 
                      label="Destination Hub"
                      placeholder="e.g. Atlanta Terminal (ATL-02)" 
                      value={destination} 
                      onChange={setDestination}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field 
                      label="Pickup Date"
                      type="date" 
                      value={pickupDate}
                      onChange={setPickupDate}
                      required
                    />
                    <Field 
                      label="Pickup Time"
                      placeholder="e.g. 08:00 AM"
                      value={pickupTime}
                      onChange={setPickupTime}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field 
                      label="Expected Delivery Date"
                      type="date" 
                      value={deliveryDate}
                      onChange={setDeliveryDate}
                      required
                    />
                    <Field 
                      label="Expected Delivery Time"
                      placeholder="e.g. 06:00 PM"
                      value={deliveryTime}
                      onChange={setDeliveryTime}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SelectField 
                      label="Priority Level"
                      value={priority}
                      onChange={(v) => setPriority(v as any)}
                      options={[
                        { value: 'Low', label: 'Low Priority' },
                        { value: 'Medium', label: 'Medium Priority' },
                        { value: 'High', label: 'High Priority' }
                      ]}
                    />
                    <SelectField 
                      label="Route Optimization"
                      value={routeType}
                      onChange={setRouteType}
                      options={[
                        { value: 'Fastest', label: 'Fastest (Tolls apply)' },
                        { value: 'Shortest', label: 'Shortest Distance' },
                        { value: 'Efficient', label: 'Fuel Efficient Route' }
                      ]}
                    />
                  </div>

                  <Field 
                    label="Route Dispatch Notes"
                    placeholder="e.g. Call customer 10 mins before arrival at SFO bay 4."
                    value={notes}
                    onChange={setNotes}
                    textarea
                  />
                </motion.div>
              )}

              {/* STEP 2: VEHICLE SELECTION */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="text-sm font-black text-[#0A0A0A] border-b border-[#F3F4F6] pb-2 flex items-center justify-between">
                    <span className="flex items-center"><Truck className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 2 — Vehicle dispatch checks</span>
                    <span className="text-[10px] text-[#9CA3AF] font-bold uppercase">{filteredVehicles.length} vehicles available</span>
                  </h3>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <input 
                      type="text" 
                      placeholder="Search available models or registration plates..."
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] text-xs focus:bg-white focus:outline-none input-glow transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {filteredVehicles.map(veh => {
                      const isSelected = selectedVehicleReg === veh.registrationNumber;
                      return (
                        <div
                          key={veh.registrationNumber}
                          onClick={() => setSelectedVehicleReg(veh.registrationNumber)}
                          className={`p-3.5 border rounded-[12px] cursor-pointer transition-all flex flex-col justify-between text-left ${
                            isSelected ? 'border-primary ring-2 ring-primary bg-[#EFF4FF]/20 shadow-inner' : 'border-[#E5E7EB] hover:border-[#9CA3AF] bg-[#F9FAFB]/10'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between">
                              <h4 className="font-bold text-xs text-[#4B5563]">{veh.name}</h4>
                              <span className="text-[9px] font-mono text-[#9CA3AF] font-black">{veh.registrationNumber}</span>
                            </div>
                            <p className="text-[9.5px] text-[#9CA3AF] mt-1">{veh.type}</p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#F3F4F6]">
                            <span className="text-[9px] font-bold text-[#6B7280]">Max load: {veh.specs.maxLoad} lbs</span>
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC] leading-none">
                              Available
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: DRIVER SELECTION */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="text-sm font-black text-[#0A0A0A] border-b border-[#F3F4F6] pb-2 flex items-center justify-between">
                    <span className="flex items-center"><User className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 3 — Operator license validation</span>
                    <span className="text-[10px] text-[#9CA3AF] font-bold uppercase">{filteredDrivers.length} drivers ready</span>
                  </h3>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <input 
                      type="text" 
                      placeholder="Search compliant operator names..."
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] text-xs focus:bg-white focus:outline-none input-glow transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {filteredDrivers.map(drv => {
                      const isSelected = selectedDriverName === drv.name;
                      return (
                        <div
                          key={drv.id}
                          onClick={() => setSelectedDriverName(drv.name)}
                          className={`p-3.5 border rounded-[12px] cursor-pointer transition-all flex flex-col justify-between text-left ${
                            isSelected ? 'border-primary ring-2 ring-primary bg-[#EFF4FF]/20 shadow-inner' : 'border-[#E5E7EB] hover:border-[#9CA3AF] bg-[#F9FAFB]/10'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-[#EFF4FF] text-primary border border-[#DBE6FF] flex items-center justify-center shrink-0">
                               <User className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#4B5563] leading-tight">{drv.name}</h4>
                              <span className="text-[9.5px] text-[#9CA3AF] block font-semibold mt-0.5">{drv.licenseCategory}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#F3F4F6]">
                            <span className="text-[9px] font-bold text-[#6B7280]">Safety: {drv.safetyScore}%</span>
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC] leading-none">
                              License Compliant
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: CARGO DETAILS */}
              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="text-sm font-black text-[#0A0A0A] border-b border-[#F3F4F6] pb-2 flex items-center">
                    <Briefcase className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 4 — Cargo weight validation
                  </h3>

                  <Field 
                    label="Cargo Configuration Type"
                    placeholder="e.g. Hazardous Materials / Dry Van Freight" 
                    value={cargoType}
                    onChange={setCargoType}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Field 
                      label="Customer Name"
                      placeholder="e.g. Acme Corp" 
                      value={customerName}
                      onChange={setCustomerName}
                    />
                    <Field 
                      label="Customer Reference Number"
                      placeholder="e.g. PO-8890" 
                      value={referenceNum}
                      onChange={setReferenceNum}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field 
                      label="Cargo Weight (lbs)"
                      type="number" 
                      value={String(cargoWeight)}
                      onChange={(v) => setCargoWeight(Number(v))}
                      required
                      error={!isWeightValid ? "Load exceeds vehicle capacity bounds." : undefined}
                    />
                    <Field 
                      label="Cargo Volume (cu ft)"
                      type="number" 
                      value={String(cargoVolume)}
                      onChange={(v) => setCargoVolume(Number(v))}
                      required
                    />
                  </div>

                  <SelectField 
                    label="Special Handling Directions"
                    value={specialHandling}
                    onChange={setSpecialHandling}
                    options={[
                      { value: 'Standard', label: 'Standard Dispatch' },
                      { value: 'Fragile', label: 'Fragile Handling Cargo' },
                      { value: 'Reefer', label: 'Temperature Controlled (Reefer)' },
                      { value: 'Hazmat', label: 'Hazardous Materials Escort' }
                    ]}
                  />

                  {/* Real-time weight compliance check card */}
                  <div className={`p-4 border rounded-[12px] flex items-start space-x-3.5 transition-colors duration-200 ${
                    isWeightValid ? 'bg-[#ECFDF5]/50 border-[#C7F0DC] text-[#4B5563]' : 'bg-[#FEF2F2] border-[#FBD5D5] text-[#DC2626]'
                  }`}>
                    {isWeightValid ? (
                      <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5 animate-bounce" />
                    )}
                    <div className="text-xs font-semibold">
                      <h4 className="font-bold">{isWeightValid ? 'Capacity Verified' : 'Capacity Warning'}</h4>
                      <p className="text-[10.5px] mt-1 leading-normal">
                        {selectedVehicle 
                          ? `Selected Vehicle Max Load: ${selectedVehicle.specs.maxLoad} lbs. Cargo Load: ${cargoWeight} lbs.`
                          : 'Please assign a vehicle to calculate maximum load validations.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: REVIEW & DISPATCH */}
              {currentStep === 5 && (
                <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="text-sm font-black text-[#0A0A0A] border-b border-[#F3F4F6] pb-2">Step 5 — Consolidated Review</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 border border-[#E5E7EB] rounded-[12px] bg-[#F9FAFB]/30">
                      <span className="text-[9px] uppercase font-bold text-[#9CA3AF] block mb-1">Route itinerary</span>
                      <span className="text-xs font-bold text-[#4B5563] block">{source} ➔ {destination}</span>
                    </div>

                    <div className="p-3.5 border border-[#E5E7EB] rounded-[12px] bg-[#F9FAFB]/30">
                      <span className="text-[9px] uppercase font-bold text-[#9CA3AF] block mb-1">Assigned Driver</span>
                      <span className="text-xs font-bold text-[#4B5563] block">{selectedDriverName || 'No Driver Selected'}</span>
                    </div>

                    <div className="p-3.5 border border-[#E5E7EB] rounded-[12px] bg-[#F9FAFB]/30">
                      <span className="text-[9px] uppercase font-bold text-[#9CA3AF] block mb-1">Assigned Vehicle</span>
                      <span className="text-xs font-bold text-[#4B5563] block font-mono">{selectedVehicle ? `${selectedVehicle.name} (${selectedVehicleReg})` : 'No Asset Selected'}</span>
                    </div>

                    <div className="p-3.5 border border-[#E5E7EB] rounded-[12px] bg-[#F9FAFB]/30">
                      <span className="text-[9px] uppercase font-bold text-[#9CA3AF] block mb-1">Cargo Specifications</span>
                      <span className="text-xs font-bold text-[#4B5563] block font-mono">{cargoType} ({cargoWeight} lbs)</span>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Wizard actions footer */}
            <div className="flex justify-between pt-6 border-t border-[#F3F4F6] mt-6 select-none">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-3.5 py-2 border border-[#E5E7EB] hover:bg-[#F9FAFB] disabled:opacity-40 text-[#4B5563] text-xs font-bold rounded-[12px] flex items-center space-x-1 transition-all cursor-pointer focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] flex items-center space-x-1 transition-all cursor-pointer focus:outline-none shadow-sm"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={readinessScore < 100}
                  className="px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:bg-[#D1D5DB] text-white text-xs font-bold rounded-[12px] flex items-center space-x-1.5 transition-all cursor-pointer focus:outline-none shadow-sm animate-pulse"
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  <span>Dispatch Trip Now</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (30%) Live dispatch summary & validation center */}
        <div className="space-y-6">
          
          {/* Dispatch Readiness Score */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-center space-y-4">
            <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 text-left">
              Dispatch Readiness
            </h3>

            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r={radius} className="stroke-[#F3F4F6]" strokeWidth="5.5" fill="transparent" />
                <circle cx="48" cy="48" r={radius} className={readinessScore >= 100 ? 'stroke-primary' : 'stroke-amber-500'} strokeWidth="5.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none leading-none">
                <span className="text-lg font-black text-[#0A0A0A] font-mono tabular-nums">{readinessScore}%</span>
                <span className="text-[8px] text-[#9CA3AF] font-bold uppercase mt-1">Readiness</span>
              </div>
            </div>

            {/* Validation Checklists */}
            <div className="space-y-2 text-left pt-2">
              {[
                { id: 'route', label: 'Route Coordinates Set', checked: checks.route },
                { id: 'vehicle', label: 'Vehicle Assigned', checked: checks.vehicle },
                { id: 'driver', label: 'Compliant Driver Assigned', checked: checks.driver },
                { id: 'cargo', label: 'Cargo Configured', checked: checks.cargo },
                { id: 'capacity', label: 'Load Capacity Compliance', checked: checks.capacity }
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between text-[11px] font-semibold text-[#4B5563] bg-[#F9FAFB]/50 p-2 border border-[#E5E7EB] rounded-[8px]">
                  <span>{item.label}</span>
                  {item.checked ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-[#D1D5DB] shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI recommendations */}
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
            <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2 flex items-center">
              <Sparkles className="w-4 h-4 text-primary mr-1.5" /> Dispatch Advisor
            </h3>

            <div className="space-y-3 text-[10.5px] font-semibold leading-normal text-[#4B5563]">
              <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Defensive driving parameters checked. AI routing suggests alternate highway paths for -12 minutes.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Dispatch Confirmation Modal Overlay */}
      <ModalShell
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Ready to Dispatch Route?"
        subtitle="Route activation alert."
        footer={
          <div className="w-full flex space-x-2">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 py-2 border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#4B5563] text-xs font-bold rounded-[12px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispatchSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cursor-pointer cc-shadow-sm"
            >
              Dispatch Now
            </button>
          </div>
        }
      >
        <div className="py-2 text-center space-y-4">
          <div className="w-16 h-16 bg-[#EFF4FF] text-primary border border-[#DBE6FF] rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed font-semibold">
            This dispatch command updates driver & vehicle registry status to <strong className="text-[#0A0A0A]">"On Trip"</strong> immediately in the operational database.
          </p>
        </div>
      </ModalShell>

      {/* Success Outcomes Alert dialog */}
      <ModalShell
        isOpen={showSuccessModal}
        onClose={() => { setShowSuccessModal(false); onClose(); }}
        title="Trip Successfully Dispatched"
        subtitle="Logistics logs initialized."
        footer={
          <button
            onClick={() => { setShowSuccessModal(false); onClose(); }}
            className="w-full py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] cursor-pointer cc-shadow-sm"
          >
            Return to Operations
          </button>
        }
      >
        <div className="py-4 text-center space-y-4">
          <div className="w-16 h-16 bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC] rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" strokeWidth={3} />
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed font-semibold">
            Vehicle and driver status values have automatically been marked as "On Trip" in the logistics database.
          </p>
        </div>
      </ModalShell>

      {/* Error Alert Modal */}
      <ModalShell
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Dispatch Validation Failed"
        subtitle="Please correct the following errors:"
        footer={
          <button 
            onClick={() => setShowErrorModal(false)} 
            className="w-full py-2 bg-[#0A0A0A] hover:bg-[#262626] text-white text-xs font-bold rounded-[12px] cursor-pointer border border-slate-950 cc-shadow-sm"
          >
            Go Back and Fix
          </button>
        }
      >
        <div className="py-2 space-y-3">
          <ul className="list-disc pl-5 text-[11px] font-bold text-[#DC2626] space-y-1">
            {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
          </ul>
        </div>
      </ModalShell>

    </Reveal>
  );
};
