import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertTriangle, 
  Upload, 
  FileText, 
  Image as ImageIcon,
  Trash2, 
  ShieldAlert, 
  Info,
  Truck,
  SlidersHorizontal
} from 'lucide-react';
import type { VehicleData } from './VehicleRegistry';

interface AddEditVehicleProps {
  initialData?: VehicleData | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  existingVehicles: VehicleData[];
}

interface UploadedDoc {
  type: string;
  name: string;
  progress: number;
  completed: boolean;
}

export const AddEditVehicle: React.FC<AddEditVehicleProps> = ({
  initialData,
  onClose,
  onShowToast,
  existingVehicles
}) => {
  const isEditMode = !!initialData;
  const [currentStep, setCurrentStep] = useState(1);

  // Form Field States
  const [regNum, setRegNum] = useState(initialData?.registrationNumber || '');
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'Semi-Truck');
  const [manufacturer, setManufacturer] = useState('');
  const [mfgYear, setMfgYear] = useState('2025');
  const [color, setColor] = useState('White');
  const [vin, setVin] = useState('');

  const [capacity, setCapacity] = useState(initialData?.capacity.toString() || '40000');
  const [odometer, setOdometer] = useState(initialData?.odometer.toString() || '100000');
  const [cost, setCost] = useState(initialData?.acquisitionCost.toString() || '120000');
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || new Date().toISOString().split('T')[0]);
  const [fuelType, setFuelType] = useState(initialData?.specs?.fuelType || 'Diesel');
  const [transmission, setTransmission] = useState('Automatic');
  const [engineNumber, setEngineNumber] = useState('');
  const [fuelCap, setFuelCap] = useState(initialData?.specs?.fuelCapacity.toString() || '120');
  const [region, setRegion] = useState(initialData?.region || 'East Coast');

  const [status, setStatus] = useState<VehicleData['status']>(initialData?.status || 'Available');

  // Documents & Image uploads states
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [images, setImages] = useState<UploadedDoc[]>([]);

  // Validation States
  const [isRegUnique, setIsRegUnique] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [shakeFields, setShakeFields] = useState<Record<string, boolean>>({});

  // Modals Outcomes
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill some fields in edit mode
  useEffect(() => {
    if (initialData) {
      setManufacturer(initialData.name.split(' ')[0] || '');
      setVin('1VWBP98Y7FP' + Math.floor(100000 + Math.random() * 900000));
      setEngineNumber('ENG-' + Math.floor(100000 + Math.random() * 900000));
    }
  }, [initialData]);

  // Real-time unique Registration validation
  useEffect(() => {
    if (!regNum.trim()) {
      setIsRegUnique(null);
      return;
    }
    // If edit mode and registration is same as original, it's valid
    if (isEditMode && regNum.toUpperCase() === initialData?.registrationNumber.toUpperCase()) {
      setIsRegUnique(true);
      return;
    }

    const match = existingVehicles.some(v => v.registrationNumber.toUpperCase() === regNum.trim().toUpperCase());
    setIsRegUnique(!match);
  }, [regNum, existingVehicles, isEditMode, initialData]);

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    const newShake: Record<string, boolean> = {};

    if (step === 1) {
      if (!regNum.trim()) {
        errors.push('Registration Number is required');
        newShake.regNum = true;
      } else if (isRegUnique === false) {
        errors.push('Registration Number already exists in database');
        newShake.regNum = true;
      }

      if (!name.trim()) {
        errors.push('Vehicle Name/Model is required');
        newShake.name = true;
      }

      if (vin.trim() && vin.length !== 17) {
        errors.push('VIN / Chassis Number must be exactly 17 characters');
        newShake.vin = true;
      }
    }

    if (step === 2) {
      if (Number(capacity) <= 0 || isNaN(Number(capacity))) {
        errors.push('Maximum Load Capacity cannot be zero or empty');
        newShake.capacity = true;
      }
      if (!cost.trim() || Number(cost) <= 0) {
        errors.push('Acquisition Cost is required and must be greater than zero');
        newShake.cost = true;
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShakeFields(newShake);
      setTimeout(() => setShakeFields({}), 500);
      return false;
    }

    setValidationErrors([]);
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Simulate file uploads with progress bar loops
  const handleFileUpload = (docType: string, isImage: boolean = false) => {
    const newDoc: UploadedDoc = {
      type: docType,
      name: `${docType.replace('_', ' ')}_${Math.floor(100 + Math.random() * 900)}.${isImage ? 'jpg' : 'pdf'}`,
      progress: 0,
      completed: false
    };

    if (isImage) {
      setImages(prev => [...prev, newDoc]);
    } else {
      setDocuments(prev => [...prev, newDoc]);
    }

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      
      const updateList = (prevList: UploadedDoc[]) => 
        prevList.map(doc => {
          if (doc.name === newDoc.name) {
            return {
              ...doc,
              progress: currentProgress,
              completed: currentProgress >= 100
            };
          }
          return doc;
        });

      if (isImage) {
        setImages(updateList);
      } else {
        setDocuments(updateList);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        onShowToast(`${docType.replace('_', ' ')} uploaded successfully.`);
      }
    }, 200);
  };

  const handleRemoveDoc = (name: string, isImage: boolean) => {
    if (isImage) {
      setImages(prev => prev.filter(img => img.name !== name));
    } else {
      setDocuments(prev => prev.filter(doc => doc.name !== name));
    }
  };

  const handleSubmitForm = async () => {
    // Validate final step
    if (!validateStep(1) || !validateStep(2)) {
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    
    // Assemble vehicle payload
    const payload = {
      registrationNumber: regNum.toUpperCase(),
      name,
      type,
      capacity,
      odometer,
      acquisitionCost: cost,
      region,
      engine: engineNumber || 'Cummins ISX15 450HP',
      fuelType,
      mpg: type === 'Delivery Van' ? '14.5' : '7.0',
      fuelCapacity: Number(fuelCap) || 120
    };

    try {
      let res;
      if (isEditMode) {
        // Mock edit update
        res = await fetch(`/api/fleet/vehicles/${initialData.registrationNumber}`, { method: 'DELETE' });
        if (res.ok) {
          res = await fetch('/api/fleet/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } else {
        res = await fetch('/api/fleet/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setShowSuccessModal(true);
      } else {
        setValidationErrors([data.message || 'Server error occurred during registry.']);
        setShowErrorModal(true);
      }
    } catch {
      setValidationErrors(['Could not connect to database server.']);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 select-none relative text-left">
      {/* Sticky Top Header Actions ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-gray/50 bg-white/80 backdrop-blur sticky top-16 z-20">
        <div>
          <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">
            {isEditMode ? 'Edit Fleet Vehicle' : 'Register New Vehicle'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
            {isEditMode ? 'Modify operational parameters and compliance status' : 'Add a new fleet vehicle with complete operational details and compliance information.'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onShowToast('Draft saved successfully.')}
            className="px-3.5 py-2 border border-border-gray bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmitForm}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary hover:bg-primary/95 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow hover:scale-102 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isEditMode ? 'Save Vehicle' : 'Register Vehicle'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Stepper indicator ribbon */}
      <div className="max-w-4xl mx-auto bg-white border border-border-gray p-4 rounded-2xl flex items-center justify-between shadow-sm">
        {[
          { step: 1, label: 'Basic Info' },
          { step: 2, label: 'Operational' },
          { step: 3, label: 'Compliance' },
          { step: 4, label: 'Status' }
        ].map((item) => {
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;

          return (
            <div key={item.step} className="flex items-center flex-1 last:flex-initial">
              <button
                onClick={() => currentStep > item.step && setCurrentStep(item.step)}
                disabled={currentStep < item.step}
                className="flex items-center space-x-2 focus:outline-none cursor-pointer text-left"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                  isDone 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : isActive 
                      ? 'bg-primary text-white' 
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : item.step}
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </button>
              
              {item.step < 4 && (
                <div className="flex-1 mx-4 h-0.5 bg-slate-100 hidden sm:block">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: isDone ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Two Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border-gray p-6 rounded-2xl shadow-sm min-h-[400px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: BASIC INFORMATION */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-text-dark border-b border-slate-100 pb-2 flex items-center">
                    <Info className="w-4 h-4 text-primary mr-1.5" /> Step 1 — Basic Identification
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Reg Number with real-time check */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        Registration Number
                        {isRegUnique === true && <span className="text-emerald-600 font-bold ml-1.5">✓ Unique</span>}
                        {isRegUnique === false && <span className="text-rose-500 font-bold ml-1.5">✗ Duplicate Registry</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TRK-980"
                        value={regNum}
                        onChange={(e) => setRegNum(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none transition-all input-glow ${
                          shakeFields.regNum ? 'border-rose-500 animate-shake' : 'border-border-gray'
                        }`}
                        required
                      />
                    </div>

                    {/* Model Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle Name / Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Kenworth T680"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none transition-all input-glow ${
                          shakeFields.name ? 'border-rose-500 animate-shake' : 'border-border-gray'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle Configuration</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="Semi-Truck">Semi-Truck</option>
                        <option value="Box Truck">Box Truck</option>
                        <option value="Delivery Van">Delivery Van</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manufacturer</label>
                      <input
                        type="text"
                        placeholder="e.g. Kenworth, Volvo"
                        value={manufacturer}
                        onChange={(e) => setManufacturer(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none input-glow"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mfg Year</label>
                      <input
                        type="number"
                        value={mfgYear}
                        onChange={(e) => setMfgYear(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none input-glow"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle Color</label>
                      <input
                        type="text"
                        placeholder="e.g. Arctic White"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none input-glow"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">VIN / Chassis Number (17-chars)</label>
                      <input
                        type="text"
                        placeholder="17 character alpha-numeric ID"
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        maxLength={17}
                        className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none transition-all input-glow ${
                          shakeFields.vin ? 'border-rose-500 animate-shake' : 'border-border-gray'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Smart Hint Card */}
                  <div className="p-3 bg-blue-50/50 border border-primary/20 rounded-xl flex items-start space-x-2 text-slate-600 mt-4">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-[10.5px] font-semibold leading-relaxed">
                      Registration numbers must be unique to map telemetry points. Chassis number will be validated against active insurance documents on submission.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: OPERATIONAL DETAILS */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-text-dark border-b border-slate-100 pb-2 flex items-center">
                    <SlidersHorizontal className="w-4 h-4 text-primary mr-1.5" /> Step 2 — Operational Metrics
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Max Load Capacity (lbs)</label>
                      <input
                        type="number"
                        placeholder="Capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none transition-all input-glow ${
                          shakeFields.capacity ? 'border-rose-500 animate-shake' : 'border-border-gray'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Initial Odometer (mi)</label>
                      <input
                        type="number"
                        placeholder="Odometer"
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none input-glow"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acquisition Cost ($)</label>
                      <input
                        type="number"
                        placeholder="Purchase price"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none transition-all input-glow ${
                          shakeFields.cost ? 'border-rose-500 animate-shake' : 'border-border-gray'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purchase Date</label>
                      <input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fuel Configuration</label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="Diesel">Diesel</option>
                        <option value="Gasoline">Gasoline</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transmission</label>
                      <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engine Block Number</label>
                      <input
                        type="text"
                        placeholder="e.g. DD15-891002"
                        value={engineNumber}
                        onChange={(e) => setEngineNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none input-glow"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tank Capacity (Gal)</label>
                      <input
                        type="number"
                        placeholder="e.g. 120"
                        value={fuelCap}
                        onChange={(e) => setFuelCap(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none input-glow"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="East Coast">East Coast</option>
                        <option value="West Coast">West Coast</option>
                        <option value="Midwest">Midwest</option>
                        <option value="South">South</option>
                      </select>
                    </div>
                  </div>

                  {/* Smart Hint Card */}
                  <div className="p-3 bg-blue-50/50 border border-primary/20 rounded-xl flex items-start space-x-2 text-slate-600 mt-4">
                    <SlidersHorizontal className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-[10.5px] font-semibold leading-relaxed">
                      Maximum Load Capacity determines routing options. Heavy-duty loads require Class A configurations.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: COMPLIANCE DOCUMENTS & FILE UPLOADS */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-text-dark border-b border-slate-100 pb-2 flex items-center">
                    <FileText className="w-4 h-4 text-primary mr-1.5" /> Step 3 — Compliance & Documents
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Document Upload Card 1 */}
                    <div className="border border-border-gray hover:border-primary/45 p-4 rounded-xl text-center space-y-2 cursor-pointer transition-all bg-slate-50/50"
                         onClick={() => handleFileUpload('Registration_Certificate')}>
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-700">Registration Certificate</h4>
                      <p className="text-[9.5px] text-slate-400 font-semibold">Click to upload PDF / Image</p>
                    </div>

                    {/* Document Upload Card 2 */}
                    <div className="border border-border-gray hover:border-primary/45 p-4 rounded-xl text-center space-y-2 cursor-pointer transition-all bg-slate-50/50"
                         onClick={() => handleFileUpload('Insurance_Policy')}>
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-700">Insurance Policy</h4>
                      <p className="text-[9.5px] text-slate-400 font-semibold">Click to upload PDF / Image</p>
                    </div>

                    {/* Document Upload Card 3 */}
                    <div className="border border-border-gray hover:border-primary/45 p-4 rounded-xl text-center space-y-2 cursor-pointer transition-all bg-slate-50/50"
                         onClick={() => handleFileUpload('Vehicle_Images', true)}>
                      <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-700">Vehicle Photos</h4>
                      <p className="text-[9.5px] text-slate-400 font-semibold">Click to drag photos grid</p>
                    </div>

                    {/* Document Upload Card 4 */}
                    <div className="border border-border-gray hover:border-primary/45 p-4 rounded-xl text-center space-y-2 cursor-pointer transition-all bg-slate-50/50"
                         onClick={() => handleFileUpload('IFTA_Permits')}>
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-700">IFTA Permits</h4>
                      <p className="text-[9.5px] text-slate-400 font-semibold">Click to upload PDF / Image</p>
                    </div>
                  </div>

                  {/* Active Uploads List */}
                  {([...documents, ...images].length > 0) && (
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Uploads</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[...documents, ...images].map((doc) => (
                          <div key={doc.name} className="p-3 bg-white border border-border-gray rounded-xl flex items-center justify-between shadow-inner">
                            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                              <FileText className="w-4 h-4 text-primary shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[10.5px] font-bold text-slate-700 truncate block leading-none">{doc.name}</span>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${doc.progress}%` }} />
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveDoc(doc.name, images.includes(doc))}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors ml-4 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 4: STATUS SELECTOR */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-text-dark border-b border-slate-100 pb-2 flex items-center">
                    <Truck className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 4 — Initial Dispatch Status
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { 
                        id: 'Available', 
                        label: 'Available', 
                        desc: 'Vehicle is ready for immediate dispatch assignment.', 
                        color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-50/10 text-emerald-600'
                      },
                      { 
                        id: 'On Trip', 
                        label: 'On Trip', 
                        desc: 'Vehicle is actively executing a route.', 
                        color: 'border-blue-200 hover:border-blue-500 bg-blue-50/10 text-blue-600'
                      },
                      { 
                        id: 'In Shop', 
                        label: 'In Shop', 
                        desc: 'Vehicle is undergoing maintenance checks. Excluded from dispatches.', 
                        color: 'border-rose-200 hover:border-rose-500 bg-rose-50/10 text-rose-600'
                      },
                      { 
                        id: 'Retired', 
                        label: 'Retired', 
                        desc: 'Vehicle is permanently decommissioned.', 
                        color: 'border-slate-200 hover:border-slate-500 bg-slate-50/10 text-slate-500'
                      }
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setStatus(item.id as VehicleData['status'])}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${item.color} ${
                          status === item.id ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                      >
                        <h4 className="font-bold text-xs">{item.label}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Smart Hint Card */}
                  {(status === 'In Shop' || status === 'Retired') && (
                    <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-600 mt-4 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-[10.5px] font-semibold leading-relaxed">
                        Warning: Vehicles marked "In Shop" or "Retired" are excluded from active dispatches and cannot be scheduled on trips.
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* Bottom Form Steps Navigation buttons */}
            <div className="flex justify-between pt-6 border-t border-slate-100 mt-6 select-none">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-3.5 py-2 border border-border-gray hover:bg-slate-50 disabled:opacity-40 text-slate-600 text-xs font-bold rounded-xl flex items-center space-x-1 transition-all cursor-pointer focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl flex items-center space-x-1 transition-all cursor-pointer focus:outline-none shadow-sm"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitForm}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer focus:outline-none shadow-sm"
                >
                  <Check className="w-4.5 h-4.5" strokeWidth={3} />
                  <span>{isEditMode ? 'Save Vehicle' : 'Register Vehicle'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview Summary Card */}
        <div className="space-y-6">
          <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
            <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2">
              Live Preview Summary
            </h3>

            {/* Vector animated truck icon placeholder */}
            <div className="relative bg-slate-900 border border-slate-950 rounded-xl h-36 flex items-center justify-center shadow-inner overflow-hidden">
              <motion.div
                animate={status === 'On Trip' ? { x: [-10, 10, -10] } : {}}
                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                className="text-primary opacity-90"
              >
                <svg width="120" height="90" viewBox="0 0 100 70" fill="none" stroke="#2563EB" strokeWidth="2" className="overflow-visible">
                  <rect x="5" y="25" width="55" height="25" rx="2" />
                  <path d="M60 30h12l14 10v10H60V30z" />
                  <circle cx="22" cy="53" r="7" fill="#1E293B" stroke="#2563EB" strokeWidth="2" />
                  <circle cx="72" cy="53" r="7" fill="#1E293B" stroke="#2563EB" strokeWidth="2" />
                  <line x1="22" y1="53" x2="68" y2="53" />
                  {/* Smoke rings if on trip */}
                  {status === 'On Trip' && (
                    <motion.circle 
                      cx="-5" 
                      cy="45" 
                      r="2" 
                      fill="#FFFFFF" 
                      animate={{ x: [-2, -20], y: [0, -5], opacity: [1, 0] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }} 
                    />
                  )}
                </svg>
              </motion.div>
              <div className="absolute top-3 right-3">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  status === 'Available' ? 'bg-emerald-500 text-white' : 
                  status === 'On Trip' ? 'bg-blue-500 text-white' :
                  status === 'In Shop' ? 'bg-rose-500 text-white' : 'bg-slate-400 text-white'
                }`}>
                  {status}
                </span>
              </div>
            </div>

            {/* Spec details preview */}
            <div className="space-y-3.5 text-[11px] font-semibold text-slate-700">
              <div className="flex justify-between items-baseline border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Model Description</span>
                <span className="truncate max-w-[130px]">{name || '—'}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Registration Code</span>
                <span className="font-mono font-bold text-slate-600">{regNum.toUpperCase() || '—'}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Odometer Reading</span>
                <span className="font-mono">{Number(odometer).toLocaleString()} miles</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Load Capacity</span>
                <span className="font-mono">{Number(capacity).toLocaleString()} lbs</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Acquisition Cost</span>
                <span className="font-mono">${Number(cost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 font-medium">Logistics Region</span>
                <span>{region}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400 font-medium">Fuel system</span>
                <span>{fuelType}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Outcome Success Dialog Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center p-8 z-10 space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="w-16 h-16 bg-emerald-50 text-success-green border border-emerald-100 rounded-full flex items-center justify-center mx-auto"
              >
                <Check className="w-8 h-8" strokeWidth={3} />
              </motion.div>
              <div>
                <h3 className="text-base font-bold text-text-dark">Vehicle Successfully Registered</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Asset is now recorded in database registry and available for active route dispatch.
                </p>
              </div>

              <div className="pt-4 flex flex-col space-y-2">
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Go to Registry
                </button>
                <button
                  onClick={() => {
                    // Reset page to add another
                    setRegNum('');
                    setName('');
                    setCapacity('40000');
                    setOdometer('100000');
                    setCost('120000');
                    setVin('');
                    setCurrentStep(1);
                    setShowSuccessModal(false);
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Register Another Vehicle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Outcome Error / Warning Dialog Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowErrorModal(false)}
              className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 z-10 text-left space-y-4"
            >
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-black text-text-dark uppercase">Registry Validation Failed</h3>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500">Correct the following validation errors before finalizing dispatch:</p>
                <ul className="list-disc pl-5 text-[11px] font-bold text-rose-500 space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {(isRegUnique === false) && <li>Registration Number Already Exists</li>}
                </ul>
              </div>

              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full mt-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
              >
                Go Back and Fix
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
