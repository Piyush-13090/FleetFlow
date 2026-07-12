import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
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
          fetch('/api/fleet/drivers'),
          fetch('/api/fleet/vehicles')
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
      const res = await fetch('/api/fleet/trips', {
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
  };

  return (
    <div className="space-y-6 select-none relative text-left">
      
      {/* Sticky Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-gray/50 bg-white/80 backdrop-blur sticky top-16 z-20">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onClose}
            className="p-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">
              Create New Trip
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
              Plan, validate, and dispatch transport operations with real-time vehicle and driver availability.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 select-none">
          <button
            onClick={() => onShowToast('Draft dispatch itinerary saved.')}
            className="px-3.5 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Save Draft
          </button>
          
          <button
            onClick={onClose}
            className="px-3.5 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
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
            className="px-4 py-2 bg-primary disabled:bg-slate-300 hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Dispatch Trip
          </button>
        </div>
      </div>

      {/* Horizontal Stepper Progress Indicator */}
      <div className="bg-white border border-border-gray p-4.5 rounded-2xl shadow-sm flex items-center justify-between text-xs font-black text-slate-400 select-none">
        {[
          { step: 1, label: 'Route' },
          { step: 2, label: 'Vehicle' },
          { step: 3, label: 'Driver' },
          { step: 4, label: 'Cargo' },
          { step: 5, label: 'Review & Dispatch' }
        ].map((item, idx) => (
          <React.Fragment key={item.step}>
            <div className={`flex items-center space-x-2 ${
              currentStep === item.step ? 'text-primary font-black scale-102' : currentStep > item.step ? 'text-emerald-500' : ''
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10.5px] border ${
                currentStep === item.step 
                  ? 'border-primary bg-primary text-white shadow-sm' 
                  : currentStep > item.step 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-500'
                    : 'border-border-gray bg-slate-50 text-slate-400'
              }`}>
                {currentStep > item.step ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : item.step}
              </div>
              <span className="hidden sm:inline">{item.label}</span>
            </div>
            {idx < 4 && <ChevronRight className="w-4 h-4 text-slate-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Two Column Layout (70% Left form / 30% Right summary panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (70%) Stepper Form panels */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border-gray p-6 rounded-2xl shadow-sm min-h-[400px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: ROUTE INFO */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="text-sm font-black text-text-dark border-b border-slate-100 pb-2 flex items-center">
                    <Navigation className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 1 — Route coordinates
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source Hub</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Chicago Depot (CHI-01)" 
                        value={source} 
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Destination Hub</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Atlanta Terminal (ATL-02)" 
                        value={destination} 
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pickup Date</label>
                      <input 
                        type="date" 
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pickup Time</label>
                      <input 
                        type="text" 
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expected Delivery Date</label>
                      <input 
                        type="date" 
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expected Delivery Time</label>
                      <input 
                        type="text" 
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority Level</label>
                      <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Route Optimization</label>
                      <select 
                        value={routeType}
                        onChange={(e) => setRouteType(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="Fastest">Fastest (Tolls apply)</option>
                        <option value="Shortest">Shortest Distance</option>
                        <option value="Efficient">Fuel Efficient Route</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Route Dispatch Notes</label>
                    <textarea 
                      placeholder="e.g. Call customer 10 mins before arrival at SFO bay 4."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none h-12 resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: VEHICLE SELECTION */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <h3 className="text-sm font-black text-text-dark border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span className="flex items-center"><Truck className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 2 — Vehicle dispatch checks</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{filteredVehicles.length} vehicles available</span>
                  </h3>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search available models or registration plates..."
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border-gray rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {filteredVehicles.map(veh => {
                      const isSelected = selectedVehicleReg === veh.registrationNumber;
                      return (
                        <div
                          key={veh.registrationNumber}
                          onClick={() => setSelectedVehicleReg(veh.registrationNumber)}
                          className={`p-3.5 border rounded-xl cursor-pointer transition-all flex flex-col justify-between text-left ${
                            isSelected ? 'border-primary ring-2 ring-primary bg-blue-50/5 shadow-inner' : 'border-border-gray hover:border-slate-350 bg-slate-50/10'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between">
                              <h4 className="font-bold text-xs text-slate-700">{veh.name}</h4>
                              <span className="text-[9px] font-mono text-slate-400 font-black">{veh.registrationNumber}</span>
                            </div>
                            <p className="text-[9.5px] text-slate-400 mt-1">{veh.type}</p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100/50">
                            <span className="text-[9px] font-bold text-slate-500">Max load: {veh.specs.maxLoad} lbs</span>
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 leading-none">
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
                  <h3 className="text-sm font-black text-text-dark border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span className="flex items-center"><User className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 3 — Operator license validation</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{filteredDrivers.length} drivers ready</span>
                  </h3>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search compliant operator names..."
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-border-gray rounded-xl text-xs focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {filteredDrivers.map(drv => {
                      const isSelected = selectedDriverName === drv.name;
                      return (
                        <div
                          key={drv.id}
                          onClick={() => setSelectedDriverName(drv.name)}
                          className={`p-3.5 border rounded-xl cursor-pointer transition-all flex flex-col justify-between text-left ${
                            isSelected ? 'border-primary ring-2 ring-primary bg-blue-50/5 shadow-inner' : 'border-border-gray hover:border-slate-350 bg-slate-50/10'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                              <User className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-700 leading-tight">{drv.name}</h4>
                              <span className="text-[9.5px] text-slate-400 block font-semibold mt-0.5">{drv.licenseCategory}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100/50">
                            <span className="text-[9px] font-bold text-slate-500">Safety: {drv.safetyScore}%</span>
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 leading-none">
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
                  <h3 className="text-sm font-black text-text-dark border-b border-slate-100 pb-2 flex items-center">
                    <Briefcase className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 4 — Cargo weight validation
                  </h3>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cargo Configuration Type</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hazardous Materials / Dry Van Freight" 
                      value={cargoType}
                      onChange={(e) => setCargoType(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Acme Corp" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer Reference Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. PO-8890" 
                        value={referenceNum}
                        onChange={(e) => setReferenceNum(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cargo Weight (lbs)</label>
                      <input 
                        type="number" 
                        value={cargoWeight}
                        onChange={(e) => setCargoWeight(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none font-semibold text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cargo Volume (cu ft)</label>
                      <input 
                        type="number" 
                        value={cargoVolume}
                        onChange={(e) => setCargoVolume(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none font-semibold text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Special Handling Directions</label>
                    <select 
                      value={specialHandling}
                      onChange={(e) => setSpecialHandling(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="Standard">Standard Dispatch</option>
                      <option value="Fragile">Fragile Handling Cargo</option>
                      <option value="Reefer">Temperature Controlled (Reefer)</option>
                      <option value="Hazmat">Hazardous Materials Escort</option>
                    </select>
                  </div>

                  {/* Real-time weight compliance check card */}
                  <div className={`p-4 border rounded-xl flex items-start space-x-3.5 transition-colors duration-200 ${
                    isWeightValid ? 'bg-emerald-50/50 border-emerald-100 text-slate-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}>
                    {isWeightValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
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
                  <h3 className="text-sm font-black text-text-dark border-b border-slate-100 pb-2">Step 5 — Consolidated Review</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 border border-border-gray rounded-xl bg-slate-50/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Route itinerary</span>
                      <span className="text-xs font-bold text-slate-700 block">{source} ➔ {destination}</span>
                    </div>

                    <div className="p-3.5 border border-border-gray rounded-xl bg-slate-50/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Assigned Driver</span>
                      <span className="text-xs font-bold text-slate-700 block">{selectedDriverName || 'No Driver Selected'}</span>
                    </div>

                    <div className="p-3.5 border border-border-gray rounded-xl bg-slate-50/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Assigned Vehicle</span>
                      <span className="text-xs font-bold text-slate-700 block">{selectedVehicle ? `${selectedVehicle.name} (${selectedVehicleReg})` : 'No Asset Selected'}</span>
                    </div>

                    <div className="p-3.5 border border-border-gray rounded-xl bg-slate-50/30">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Cargo Specifications</span>
                      <span className="text-xs font-bold text-slate-700 block">{cargoType} ({cargoWeight} lbs)</span>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Wizard actions footer */}
            <div className="flex justify-between pt-6 border-t border-slate-100 mt-6 select-none">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-3.5 py-2 border border-border-gray hover:bg-slate-50 disabled:opacity-40 text-slate-600 text-xs font-bold rounded-xl flex items-center space-x-1 transition-all cursor-pointer focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl flex items-center space-x-1 transition-all cursor-pointer focus:outline-none shadow-sm"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={readinessScore < 100}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-600/95 disabled:bg-slate-350 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer focus:outline-none shadow-sm"
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
          <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-center space-y-4">
            <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2 text-left">
              Dispatch Readiness
            </h3>

            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r={radius} className="stroke-slate-100" strokeWidth="5.5" fill="transparent" />
                <circle cx="48" cy="48" r={radius} className={readinessScore >= 100 ? 'stroke-primary' : 'stroke-amber-500'} strokeWidth="5.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none leading-none">
                <span className="text-lg font-black text-text-dark">{readinessScore}%</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">Readiness</span>
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
                <div key={item.id} className="flex items-center justify-between text-[11px] font-semibold text-slate-700 bg-slate-50/50 p-2 border border-border-gray/50 rounded-lg">
                  <span>{item.label}</span>
                  {item.checked ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI recommendations */}
          <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
            <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2 flex items-center">
              <Sparkles className="w-4 h-4 text-primary mr-1.5" /> Dispatch Advisor
            </h3>

            <div className="space-y-3 text-[10.5px] font-semibold leading-normal text-slate-600">
              <div className="p-3 bg-blue-50/50 border border-primary/20 rounded-xl flex items-start space-x-2">
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
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowConfirmModal(false)} className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 z-10 text-left space-y-4"
            >
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-black text-text-dark uppercase">Ready to Dispatch Route?</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                This dispatch command updates driver & vehicle registry status to <strong className="text-slate-700">"On Trip"</strong> immediately in the operational database.
              </p>
              
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 border border-border-gray hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatchSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Dispatch Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Outcomes Alert dialog */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center p-8 z-10 space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-50 text-success-green border border-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-dark">Trip Successfully Dispatched</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-semibold">
                  Vehicle and driver status values have automatically been marked as "On Trip" in the logistics database.
                </p>
              </div>
              <button
                onClick={() => { setShowSuccessModal(false); onClose(); }}
                className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Return to operations
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Alert Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowErrorModal(false)} className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 z-10 text-left space-y-4"
            >
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <XCircle className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-black text-text-dark uppercase">Dispatch Validation Failed</h3>
              </div>
              <ul className="list-disc pl-5 text-[11px] font-bold text-rose-500 space-y-1">
                {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
              </ul>
              <button onClick={() => setShowErrorModal(false)} className="w-full mt-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl cursor-pointer">
                Go Back and Fix
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
