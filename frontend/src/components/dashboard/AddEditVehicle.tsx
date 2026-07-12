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
import { apiFetch } from '../../lib/api';
import { SectionHeader } from '../ui/SectionHeader';
import { Field, SelectField } from '../ui/Field';
import { ModalShell } from '../ui/ModalShell';
import { Reveal } from '../ui/Reveal';
import { CardLabel } from '../ui/Card';
import { StatusPill } from '../ui/StatusPill';

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
    if (!validateStep(1) || !validateStep(2)) {
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    
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
        res = await apiFetch(`/api/fleet/vehicles/${initialData.registrationNumber}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch('/api/fleet/vehicles', {
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
    <Reveal className="space-y-6 select-none relative text-left">
      {/* Sticky Top Header Actions ribbon */}
      <SectionHeader
        title={isEditMode ? 'Edit Fleet Vehicle' : 'Register New Vehicle'}
        subtitle={isEditMode ? 'Modify operational parameters and compliance status' : 'Add a new fleet vehicle with complete operational details and compliance information.'}
        actions={
          <>
            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onShowToast('Draft saved successfully.')}
              className="px-3.5 py-2 border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#0A0A0A] text-xs font-bold rounded-[12px] transition-all cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmitForm}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] disabled:bg-slate-300 text-white text-xs font-bold rounded-[12px] cc-shadow-sm hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isEditMode ? 'Save Vehicle' : 'Register Vehicle'}</span>
              )}
            </button>
          </>
        }
      />

      {/* Stepper indicator ribbon */}
      <div className="max-w-4xl mx-auto bg-white border border-[#E5E7EB] p-4 rounded-[16px] flex items-center justify-between cc-shadow-sm">
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
                <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center text-xs font-black transition-all ${
                  isDone 
                    ? 'bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC]' 
                    : isActive 
                      ? 'bg-primary text-white animate-pulse' 
                      : 'bg-[#F3F4F6] text-[#9CA3AF]'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : item.step}
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-[#6B7280]'}`}>
                  {item.label}
                </span>
              </button>
              
              {item.step < 4 && (
                <div className="flex-1 mx-4 h-0.5 bg-[#F3F4F6] hidden sm:block">
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
          <div className="bg-white border border-[#E5E7EB] p-6 rounded-[16px] cc-shadow-sm min-h-[400px] flex flex-col justify-between">
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
                  <h3 className="text-sm font-bold text-[#0A0A0A] border-b border-[#E5E7EB] pb-2 flex items-center">
                    <Info className="w-4 h-4 text-primary mr-1.5" /> Step 1 — Basic Identification
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Reg Number with real-time check */}
                    <Field
                      label="Registration Number"
                      value={regNum}
                      onChange={setRegNum}
                      placeholder="e.g. TRK-980"
                      required
                      error={shakeFields.regNum ? 'Registration Number is required' : undefined}
                      hint={isRegUnique === false ? 'Duplicate Registry' : isRegUnique === true ? 'Unique Registry' : undefined}
                      className={shakeFields.regNum ? 'animate-shake' : ''}
                    />

                    {/* Model Name */}
                    <Field
                      label="Vehicle Name / Model"
                      value={name}
                      onChange={setName}
                      placeholder="e.g. Kenworth T680"
                      required
                      error={shakeFields.name ? 'Vehicle Name/Model is required' : undefined}
                      className={shakeFields.name ? 'animate-shake' : ''}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectField
                      label="Vehicle Configuration"
                      value={type}
                      onChange={setType}
                      options={[
                        { value: 'Semi-Truck', label: 'Semi-Truck' },
                        { value: 'Box Truck', label: 'Box Truck' },
                        { value: 'Delivery Van', label: 'Delivery Van' }
                      ]}
                    />

                    <Field
                      label="Manufacturer"
                      value={manufacturer}
                      onChange={setManufacturer}
                      placeholder="e.g. Kenworth, Volvo"
                    />

                    <Field
                      label="Mfg Year"
                      value={mfgYear}
                      onChange={setMfgYear}
                      type="number"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Vehicle Color"
                      value={color}
                      onChange={setColor}
                      placeholder="e.g. Arctic White"
                    />

                    <Field
                      label="VIN / Chassis Number (17-chars)"
                      value={vin}
                      onChange={(v) => setVin(v.toUpperCase())}
                      placeholder="17 character ID"
                      error={shakeFields.vin ? 'VIN must be exactly 17 characters' : undefined}
                      className={shakeFields.vin ? 'animate-shake' : ''}
                    />
                  </div>

                  {/* Smart Hint Card */}
                  <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2 text-[#4B5563] mt-4">
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
                  <h3 className="text-sm font-bold text-[#0A0A0A] border-b border-[#E5E7EB] pb-2 flex items-center">
                    <SlidersHorizontal className="w-4 h-4 text-primary mr-1.5" /> Step 2 — Operational Metrics
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field
                      label="Max Load Capacity (lbs)"
                      value={capacity}
                      onChange={setCapacity}
                      type="number"
                      placeholder="Capacity"
                      error={shakeFields.capacity ? 'Capacity cannot be zero' : undefined}
                      className={shakeFields.capacity ? 'animate-shake' : ''}
                    />

                    <Field
                      label="Initial Odometer (mi)"
                      value={odometer}
                      onChange={setOdometer}
                      type="number"
                      placeholder="Odometer"
                    />

                    <Field
                      label="Acquisition Cost ($)"
                      value={cost}
                      onChange={setCost}
                      type="number"
                      placeholder="Purchase price"
                      error={shakeFields.cost ? 'Cost must be greater than zero' : undefined}
                      className={shakeFields.cost ? 'animate-shake' : ''}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field
                      label="Purchase Date"
                      value={purchaseDate}
                      onChange={setPurchaseDate}
                      type="date"
                    />

                    <SelectField
                      label="Fuel Configuration"
                      value={fuelType}
                      onChange={setFuelType}
                      options={[
                        { value: 'Diesel', label: 'Diesel' },
                        { value: 'Gasoline', label: 'Gasoline' },
                        { value: 'Electric', label: 'Electric' },
                        { value: 'Hybrid', label: 'Hybrid' }
                      ]}
                    />

                    <SelectField
                      label="Transmission"
                      value={transmission}
                      onChange={setTransmission}
                      options={[
                        { value: 'Automatic', label: 'Automatic' },
                        { value: 'Manual', label: 'Manual' }
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field
                      label="Engine Block Number"
                      value={engineNumber}
                      onChange={setEngineNumber}
                      placeholder="e.g. DD15-891002"
                    />

                    <Field
                      label="Tank Capacity (Gal)"
                      value={fuelCap}
                      onChange={setFuelCap}
                      type="number"
                      placeholder="e.g. 120"
                    />

                    <SelectField
                      label="Assigned Region"
                      value={region}
                      onChange={setRegion}
                      options={[
                        { value: 'East Coast', label: 'East Coast' },
                        { value: 'West Coast', label: 'West Coast' },
                        { value: 'Midwest', label: 'Midwest' },
                        { value: 'South', label: 'South' }
                      ]}
                    />
                  </div>

                  {/* Smart Hint Card */}
                  <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2 text-[#4B5563] mt-4">
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
                  <h3 className="text-sm font-bold text-[#0A0A0A] border-b border-[#E5E7EB] pb-2 flex items-center">
                    <FileText className="w-4 h-4 text-primary mr-1.5" /> Step 3 — Compliance & Documents
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-[#E5E7EB] hover:border-primary/45 p-4 rounded-[12px] text-center space-y-2 cursor-pointer transition-all bg-[#F9FAFB]/50"
                         onClick={() => handleFileUpload('Registration_Certificate')}>
                      <Upload className="w-6 h-6 text-[#9CA3AF] mx-auto" />
                      <h4 className="text-xs font-bold text-[#4B5563]">Registration Certificate</h4>
                      <p className="text-[9.5px] text-[#9CA3AF] font-semibold">Click to upload PDF / Image</p>
                    </div>

                    <div className="border border-[#E5E7EB] hover:border-primary/45 p-4 rounded-[12px] text-center space-y-2 cursor-pointer transition-all bg-[#F9FAFB]/50"
                         onClick={() => handleFileUpload('Insurance_Policy')}>
                      <Upload className="w-6 h-6 text-[#9CA3AF] mx-auto" />
                      <h4 className="text-xs font-bold text-[#4B5563]">Insurance Policy</h4>
                      <p className="text-[9.5px] text-[#9CA3AF] font-semibold">Click to upload PDF / Image</p>
                    </div>

                    <div className="border border-[#E5E7EB] hover:border-primary/45 p-4 rounded-[12px] text-center space-y-2 cursor-pointer transition-all bg-[#F9FAFB]/50"
                         onClick={() => handleFileUpload('Vehicle_Images', true)}>
                      <ImageIcon className="w-6 h-6 text-[#9CA3AF] mx-auto" />
                      <h4 className="text-xs font-bold text-[#4B5563]">Vehicle Photos</h4>
                      <p className="text-[9.5px] text-[#9CA3AF] font-semibold">Click to drag photos grid</p>
                    </div>

                    <div className="border border-[#E5E7EB] hover:border-primary/45 p-4 rounded-[12px] text-center space-y-2 cursor-pointer transition-all bg-[#F9FAFB]/50"
                         onClick={() => handleFileUpload('IFTA_Permits')}>
                      <Upload className="w-6 h-6 text-[#9CA3AF] mx-auto" />
                      <h4 className="text-xs font-bold text-[#4B5563]">IFTA Permits</h4>
                      <p className="text-[9.5px] text-[#9CA3AF] font-semibold">Click to upload PDF / Image</p>
                    </div>
                  </div>

                  {/* Active Uploads List */}
                  {([...documents, ...images].length > 0) && (
                    <div className="space-y-2.5 pt-3 border-t border-[#E5E7EB]">
                      <CardLabel className="mb-2.5">Active Uploads</CardLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[...documents, ...images].map((doc) => (
                          <div key={doc.name} className="p-3 bg-white border border-[#E5E7EB] rounded-[12px] flex items-center justify-between shadow-inner">
                            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                              <FileText className="w-4 h-4 text-primary shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[10.5px] font-bold text-[#4B5563] truncate block leading-none">{doc.name}</span>
                                <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full mt-1.5 overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${doc.progress}%` }} />
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveDoc(doc.name, images.includes(doc))}
                              className="p-1 text-[#9CA3AF] hover:text-[#DC2626] rounded-[8px] hover:bg-[#F9FAFB] transition-colors ml-4 cursor-pointer shrink-0"
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
                  <h3 className="text-sm font-bold text-[#0A0A0A] border-b border-[#E5E7EB] pb-2 flex items-center">
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
                        className={`p-4 border rounded-[12px] cursor-pointer transition-all ${item.color} ${
                          status === item.id ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                      >
                        <h4 className="font-bold text-xs">{item.label}</h4>
                        <p className="text-[10px] text-[#6B7280] mt-1 leading-tight">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Warning message card */}
                  {(status === 'In Shop' || status === 'Retired') && (
                    <div className="p-3 bg-[#FEF2F2] border border-[#FBD5D5] rounded-[12px] flex items-start space-x-2 text-[#DC2626] mt-4 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                      <span className="text-[10.5px] font-semibold leading-relaxed">
                        Warning: Vehicles marked "In Shop" or "Retired" are excluded from active dispatches and cannot be scheduled on trips.
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* Bottom Form Steps Navigation buttons */}
            <div className="flex justify-between pt-6 border-t border-[#E5E7EB] mt-6 select-none">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-3.5 py-2 border border-[#E5E7EB] hover:bg-[#F9FAFB] disabled:opacity-40 text-[#6B7280] text-xs font-bold rounded-[12px] flex items-center space-x-1 transition-all cursor-pointer focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] flex items-center space-x-1 transition-all cursor-pointer focus:outline-none shadow-sm"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitForm}
                  className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] flex items-center space-x-1.5 transition-all cursor-pointer focus:outline-none shadow-sm"
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
          <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
            <CardLabel>Live Preview Summary</CardLabel>

            {/* Vector animated truck icon placeholder */}
            <div className="relative bg-[#0A0F1E] border border-slate-950 rounded-[12px] h-36 flex items-center justify-center shadow-inner overflow-hidden">
              <motion.div
                animate={status === 'On Trip' ? { x: [-5, 5, -5] } : {}}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="text-primary opacity-90"
              >
                <svg width="120" height="90" viewBox="0 0 100 70" fill="none" stroke="#2563EB" strokeWidth="2.5" className="overflow-visible">
                  <rect x="5" y="25" width="55" height="25" rx="2" />
                  <path d="M60 30h12l14 10v10H60V30z" />
                  <circle cx="22" cy="53" r="7" fill="#0A0F1E" stroke="#2563EB" strokeWidth="2.5" />
                  <circle cx="72" cy="53" r="7" fill="#0A0F1E" stroke="#2563EB" strokeWidth="2.5" />
                  <line x1="22" y1="53" x2="68" y2="53" />
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
                <StatusPill status={status} pulse={status === 'Available'} />
              </div>
            </div>

            {/* Spec details preview */}
            <div className="space-y-3.5 text-[11px] font-semibold text-[#4B5563]">
              <div className="flex justify-between items-baseline border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#9CA3AF] font-medium">Model Description</span>
                <span className="truncate max-w-[130px] text-[#0A0A0A]">{name || '—'}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#9CA3AF] font-medium">Registration Code</span>
                <span className="font-mono font-bold text-[#0A0A0A]">{regNum.toUpperCase() || '—'}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#9CA3AF] font-medium">Odometer Reading</span>
                <span className="font-mono text-[#0A0A0A] tabular-nums">{Number(odometer).toLocaleString()} miles</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#9CA3AF] font-medium">Load Capacity</span>
                <span className="font-mono text-[#0A0A0A] tabular-nums">{Number(capacity).toLocaleString()} lbs</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#9CA3AF] font-medium">Acquisition Cost</span>
                <span className="font-mono text-[#0A0A0A] tabular-nums">${Number(cost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-[#F3F4F6] pb-1.5">
                <span className="text-[#9CA3AF] font-medium">Logistics Region</span>
                <span className="text-[#0A0A0A]">{region}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#9CA3AF] font-medium">Fuel system</span>
                <span className="text-[#0A0A0A]">{fuelType}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Outcome Success Dialog Modal */}
      <ModalShell
        isOpen={showSuccessModal}
        onClose={onClose}
        title="Vehicle Successfully Registered"
        subtitle="Asset is now recorded in database registry and available for active route dispatch."
        footer={
          <div className="w-full flex flex-col space-y-2">
            <button
              onClick={onClose}
              className="w-full py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] transition-colors cursor-pointer"
            >
              Go to Registry
            </button>
            <button
              onClick={() => {
                setRegNum('');
                setName('');
                setCapacity('40000');
                setOdometer('100000');
                setCost('120000');
                setVin('');
                setCurrentStep(1);
                setShowSuccessModal(false);
              }}
              className="w-full py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] text-xs font-bold rounded-[12px] transition-colors cursor-pointer"
            >
              Register Another Vehicle
            </button>
          </div>
        }
      >
        <div className="w-16 h-16 bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC] rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8" strokeWidth={3} />
        </div>
      </ModalShell>

      {/* Outcome Error / Warning Dialog Modal */}
      <ModalShell
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Registry Validation Failed"
        subtitle="Correct the following validation errors before finalizing registry:"
        footer={
          <button
            onClick={() => setShowErrorModal(false)}
            className="w-full py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] transition-colors cursor-pointer text-center"
          >
            Go Back and Fix
          </button>
        }
      >
        <div className="flex items-center space-x-2 pb-2 border-b border-[#E5E7EB] mb-3">
          <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
          <span className="text-xs font-bold text-[#0A0A0A] uppercase">Validation Details</span>
        </div>
        <ul className="list-disc pl-5 text-[11px] font-semibold text-[#DC2626] space-y-1 text-left">
          {validationErrors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
          {(isRegUnique === false) && <li>Registration Number Already Exists</li>}
        </ul>
      </ModalShell>
    </Reveal>
  );
};
