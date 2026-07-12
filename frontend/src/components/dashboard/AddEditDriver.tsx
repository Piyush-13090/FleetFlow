import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertTriangle, 
  Upload, 
  FileText, 
  Trash2, 
  User, 
  Info,
  SlidersHorizontal,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import type { DriverData } from './DriverManagement';
import { apiFetch } from '../../lib/api';

interface AddEditDriverProps {
  initialData?: DriverData | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  existingDrivers: DriverData[];
}

interface UploadedFile {
  id: string;
  name: string;
  progress: number;
  completed: boolean;
}

export const AddEditDriver: React.FC<AddEditDriverProps> = ({
  initialData,
  onClose,
  onShowToast,
  existingDrivers
}) => {
  const isEditMode = !!initialData;
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields States
  const [name, setName] = useState(initialData?.name || '');
  const [empId, setEmpId] = useState(initialData?.id || 'EMP-' + Math.floor(1000 + Math.random() * 9000));
  const [phone, setPhone] = useState(initialData?.contactNumber || '');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('1990-01-01');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [emergencyName, setEmergencyName] = useState(initialData?.emergencyContact?.split(' - ')[0] || '');
  const [emergencyPhone, setEmergencyPhone] = useState(initialData?.emergencyContact?.split(' - ')[1] || '');

  const [licenseNum, setLicenseNum] = useState(initialData?.licenseNumber || '');
  const [category, setCategory] = useState(initialData?.licenseCategory || 'CDL-A');
  const [issueDate, setIssueDate] = useState('2022-01-01');
  const [expiryDate, setExpiryDate] = useState(initialData?.licenseExpiry || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [issuingAuthority, setIssuingAuthority] = useState('DMV Texas');
  const [experience, setExperience] = useState(initialData?.experience?.toString() || '5');
  const [licenseCountry, setLicenseCountry] = useState('United States');
  const [licenseState, setLicenseState] = useState('Texas');

  const [status, setStatus] = useState<DriverData['status']>(initialData?.status || 'Available');
  const [safetyScore, setSafetyScore] = useState<number>(initialData?.safetyScore || 100);
  const [region, setRegion] = useState(initialData?.region || 'East Coast');

  // Documents State
  const [documents, setDocuments] = useState<Record<string, UploadedFile>>({});

  // Validation States
  const [isLicenseUnique, setIsLicenseUnique] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [shakeFields, setShakeFields] = useState<Record<string, boolean>>({});

  // Modals Outcomes
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill documents in edit mode
  useEffect(() => {
    if (isEditMode && initialData?.compliance) {
      const mockDocs: Record<string, UploadedFile> = {};
      if (initialData.compliance.medical === 'Valid') {
        mockDocs.Medical = { id: 'Medical', name: 'medical_cert.pdf', progress: 100, completed: true };
      }
      if (initialData.compliance.background === 'Cleared') {
        mockDocs.Background = { id: 'Background', name: 'bgc_clearance.pdf', progress: 100, completed: true };
      }
      if (initialData.compliance.training === 'Completed') {
        mockDocs.Training = { id: 'Training', name: 'safety_training.pdf', progress: 100, completed: true };
      }
      mockDocs.License = { id: 'License', name: 'driving_license_scan.pdf', progress: 100, completed: true };
      mockDocs.GovID = { id: 'GovID', name: 'passport_scan.pdf', progress: 100, completed: true };
      
      setDocuments(mockDocs);
    }
  }, [initialData, isEditMode]);

  // Real-time license uniqueness validation
  useEffect(() => {
    if (!licenseNum.trim()) {
      setIsLicenseUnique(null);
      return;
    }
    if (isEditMode && licenseNum.toUpperCase() === initialData?.licenseNumber.toUpperCase()) {
      setIsLicenseUnique(true);
      return;
    }
    const match = existingDrivers.some(d => d.licenseNumber.toUpperCase() === licenseNum.trim().toUpperCase());
    setIsLicenseUnique(!match);
  }, [licenseNum, existingDrivers, isEditMode, initialData]);

  // Expiry Countdown Helper
  const getLicenseExpiryInfo = () => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return { status: 'expired', label: `Expired ${Math.abs(daysDiff)} days ago`, color: 'text-rose-500' };
    }
    if (daysDiff <= 30) {
      return { status: 'expiring_soon', label: `Expires soon in ${daysDiff} days`, color: 'text-amber-500' };
    }
    return { status: 'valid', label: `Valid for ${daysDiff} days`, color: 'text-emerald-500' };
  };

  const expiryInfo = getLicenseExpiryInfo();

  // Dynamic Driver Readiness Score Calculation
  const calculateReadinessScore = (): number => {
    let score = 0;
    
    // 1. Documents contribution (15% per document uploaded, up to 75%)
    const docsCount = Object.values(documents).filter(d => d.completed).length;
    score += docsCount * 15;

    // 2. License Expiry contribution (10% if valid)
    if (expiryInfo.status !== 'expired') {
      score += 10;
    }

    // 3. Safety Score contribution (15% if score >= 90, 5% if >= 70)
    if (safetyScore >= 90) {
      score += 15;
    } else if (safetyScore >= 70) {
      score += 5;
    }

    return score;
  };

  const readinessScore = calculateReadinessScore();

  // Safety Score status text
  const getSafetyCategory = () => {
    if (safetyScore >= 90) return { label: 'Excellent', color: 'text-emerald-600' };
    if (safetyScore >= 70) return { label: 'Good', color: 'text-blue-600' };
    if (safetyScore >= 60) return { label: 'Needs Review', color: 'text-amber-500' };
    return { label: 'High Risk', color: 'text-rose-500 animate-pulse' };
  };

  const safetyCategory = getSafetyCategory();

  const handleDocumentUpload = (docId: string) => {
    const mockFile: UploadedFile = {
      id: docId,
      name: `${docId.toLowerCase()}_cert_${Math.floor(100 + Math.random() * 900)}.pdf`,
      progress: 0,
      completed: false
    };

    setDocuments(prev => ({ ...prev, [docId]: mockFile }));

    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setDocuments(prev => {
        const file = prev[docId];
        if (!file) return prev;
        return {
          ...prev,
          [docId]: {
            ...file,
            progress: p,
            completed: p >= 100
          }
        };
      });

      if (p >= 100) {
        clearInterval(interval);
        onShowToast(`${docId.replace('_', ' ')} uploaded successfully.`);
      }
    }, 200);
  };

  const handleRemoveDoc = (docId: string) => {
    setDocuments(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    const newShake: Record<string, boolean> = {};

    if (step === 1) {
      if (!name.trim()) {
        errors.push('Driver Full Name is required.');
        newShake.name = true;
      }
      if (phone.trim() && phone.length < 10) {
        errors.push('Phone Number must contain a valid 10-digit number.');
        newShake.phone = true;
      }
    }

    if (step === 2) {
      if (!licenseNum.trim()) {
        errors.push('License Number is required.');
        newShake.licenseNum = true;
      } else if (isLicenseUnique === false) {
        errors.push('License Number already exists in safety registry.');
        newShake.licenseNum = true;
      }
      if (expiryInfo.status === 'expired') {
        errors.push('Driver cannot be registered with an expired commercial license.');
        newShake.expiryDate = true;
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

  const handleSubmitForm = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name,
      licenseNumber: licenseNum.toUpperCase(),
      licenseCategory: category,
      contactNumber: phone || '+1 (555) 010-0000',
      region,
      experience: Number(experience) || 5,
      safetyScore
    };

    try {
      let res;
      if (isEditMode) {
        res = await apiFetch(`/api/fleet/drivers/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiFetch('/api/fleet/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setShowSuccessModal(true);
      } else {
        setValidationErrors([data.message || 'Error occurred during database save.']);
        setShowErrorModal(true);
      }
    } catch {
      setValidationErrors(['Error communicating with backend database.']);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SVG Circular progress mathematics
  const readinessRadius = 35;
  const readinessCircumference = 2 * Math.PI * readinessRadius;
  const readinessOffset = readinessCircumference - (readinessScore / 100) * readinessCircumference;

  return (
    <div className="space-y-6 select-none relative text-left">
      
      {/* Sticky top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-gray/50 bg-white/80 backdrop-blur sticky top-16 z-20">
        <div>
          <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">
            {isEditMode ? 'Edit Driver Profile' : 'Register New Driver'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
            Create and manage professional driver profiles with complete compliance and safety information.
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
            className="px-4 py-2 bg-primary hover:bg-primary/95 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-sm hover:scale-102 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isEditMode ? 'Save Profile' : 'Register Driver'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Stepper progress indicator ribbon */}
      <div className="max-w-4xl mx-auto bg-white border border-border-gray p-4 rounded-2xl flex items-center justify-between shadow-sm">
        {[
          { step: 1, label: 'Personal Details' },
          { step: 2, label: 'License Info' },
          { step: 3, label: 'Compliance Docs' },
          { step: 4, label: 'Availability & Status' }
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
                  isDone ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : item.step}
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </button>
              {item.step < 4 && (
                <div className="flex-1 mx-4 h-0.5 bg-slate-100 hidden sm:block" />
              )}
            </div>
          );
        })}
      </div>

      {/* Two-column responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border-gray p-6 rounded-2xl shadow-sm min-h-[400px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: PERSONAL INFORMATION */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <h3 className="text-sm font-bold text-text-dark border-b border-slate-100 pb-2 flex items-center">
                    <User className="w-4 h-4 text-primary mr-1.5" /> Step 1 — Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Driver Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Robert Johnson" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none transition-all input-glow ${
                          shakeFields.name ? 'border-rose-500 animate-shake' : 'border-border-gray'
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee ID</label>
                      <input 
                        type="text" 
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="text" 
                        placeholder="+1 (555) 010-9090" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none transition-all input-glow ${
                          shakeFields.phone ? 'border-rose-500 animate-shake' : 'border-border-gray'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. robert@transitops.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                      <input 
                        type="date" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Street Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 120 Logistics Way" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">City</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Austin" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">State</label>
                      <input 
                        type="text" 
                        placeholder="e.g. TX" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Postal / ZIP Code</label>
                      <input 
                        type="text" 
                        placeholder="ZIP" 
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none">Emergency Contact</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Mary Johnson (Spouse)" 
                          value={emergencyName}
                          onChange={(e) => setEmergencyName(e.target.value)}
                          className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                        <input 
                          type="text" 
                          placeholder="+1 (555) 010-9091" 
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: LICENSE INFORMATION */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <h3 className="text-sm font-bold text-text-dark border-b border-slate-100 pb-2 flex items-center">
                    <SlidersHorizontal className="w-4 h-4 text-primary mr-1.5" /> Step 2 — Commercial License Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                        License Number
                        {isLicenseUnique === true && <span className="text-emerald-600 font-bold ml-1.5">✓ Unique</span>}
                        {isLicenseUnique === false && <span className="text-rose-500 font-bold ml-1.5">✗ Duplicate</span>}
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. CDL-TX89012" 
                        value={licenseNum}
                        onChange={(e) => setLicenseNum(e.target.value.toUpperCase())}
                        className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none transition-all input-glow ${
                          shakeFields.licenseNum ? 'border-rose-500 animate-shake' : 'border-border-gray'
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CDL Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="CDL-A">Class A CDL</option>
                        <option value="CDL-B">Class B CDL</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">License Issue Date</label>
                      <input 
                        type="date" 
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">License Expiry Date</label>
                      <input 
                        type="date" 
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none cursor-pointer ${
                          shakeFields.expiryDate ? 'border-rose-500 animate-shake' : 'border-border-gray'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience (Years)</label>
                      <input 
                        type="number" 
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Issuing Authority</label>
                      <input 
                        type="text" 
                        value={issuingAuthority}
                        onChange={(e) => setIssuingAuthority(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">License Country</label>
                      <input 
                        type="text" 
                        value={licenseCountry}
                        onChange={(e) => setLicenseCountry(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">License State</label>
                      <input 
                        type="text" 
                        value={licenseState}
                        onChange={(e) => setLicenseState(e.target.value)}
                        className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Licensing validation warning checkmarks */}
                  <div className="pt-3 border-t border-slate-100">
                    {expiryInfo.status === 'expired' ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-600 animate-pulse">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="text-[10.5px] font-semibold">
                          Driver cannot be assigned until license is renewed. Current expiry states: {expiryInfo.label}.
                        </span>
                      </div>
                    ) : expiryInfo.status === 'expiring_soon' ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-amber-600">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-[10.5px] font-semibold">
                          License expires soon: {expiryInfo.label}. Ensure renewal document uploads are queued.
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50/50 border border-primary/20 rounded-xl flex items-start space-x-2 text-slate-600">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-[10.5px] font-semibold">
                          CDL Credential valid: {expiryInfo.label}.
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: COMPLIANCE DOCUMENTS */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <h3 className="text-sm font-bold text-text-dark border-b border-slate-100 pb-2 flex items-center">
                    <FileText className="w-4 h-4 text-primary mr-1.5" /> Step 3 — Compliance Dossier Checks
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'License', label: 'CDL License Scan' },
                      { id: 'GovID', label: 'Government Passport / ID' },
                      { id: 'Medical', label: 'Medical Cert Check' },
                      { id: 'Background', label: 'Background Clearance' },
                      { id: 'Training', label: 'Safety Seminar Cert' }
                    ].map((doc) => {
                      const file = documents[doc.id];
                      const isUploaded = !!file?.completed;
                      const progress = file?.progress || 0;

                      return (
                        <div key={doc.id} className="border border-border-gray hover:border-primary/45 p-4 rounded-xl text-center space-y-2.5 bg-slate-50/40 relative">
                          <Upload className="w-5.5 h-5.5 text-slate-400 mx-auto" />
                          <div>
                            <h4 className="text-[11px] font-bold text-slate-700 leading-tight">{doc.label}</h4>
                            {isUploaded ? (
                              <span className="text-[8.5px] font-black text-emerald-600 mt-1 block">Verified</span>
                            ) : progress > 0 ? (
                              <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                              </div>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => handleDocumentUpload(doc.id)}
                                className="text-[9px] font-black text-primary hover:text-primary/80 mt-1 cursor-pointer block mx-auto focus:outline-none"
                              >
                                Upload File
                              </button>
                            )}
                          </div>
                          {isUploaded && (
                            <button
                              onClick={() => handleRemoveDoc(doc.id)}
                              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: AVAILABILITY & STATUS */}
              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <h3 className="text-sm font-bold text-text-dark border-b border-slate-100 pb-2 flex items-center">
                    <User className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 4 — Safety Rating & Availability
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Initial Safety Score Setting</span>
                      <span className={safetyCategory.color}>{safetyScore}% ({safetyCategory.label})</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      step="1"
                      value={safetyScore}
                      onChange={(e) => setSafetyScore(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer h-1.5 rounded-lg bg-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Corporate Hub Region</label>
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-slate-100">
                    {[
                      { id: 'Available', label: 'Available', desc: 'Driver is active and ready for route assignment.' },
                      { id: 'Off Duty', label: 'Off Duty', desc: 'Driver is off duty for rest periods.' },
                      { id: 'Suspended', label: 'Suspended', desc: 'Dossier is suspended for safety audits.' }
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={() => setStatus(item.id as any)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all text-left ${
                          status === item.id ? 'border-primary ring-2 ring-primary bg-blue-50/5' : 'border-border-gray hover:border-slate-350'
                        }`}
                      >
                        <h4 className="font-bold text-xs">{item.label}</h4>
                        <p className="text-[9.5px] text-slate-500 mt-1 leading-tight">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Stepper actions footer */}
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
                  <span>Register Driver</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Live Preview Panel */}
          <div className="space-y-6">
            <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm text-left space-y-4">
              <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-2">Onboarding Live Preview</h3>
              
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-text-dark text-xs">{name || '—'}</h4>
                  <span className="text-[10px] font-bold font-mono text-slate-400 mt-1 block uppercase">{licenseNum || '—'} ({category})</span>
                </div>
              </div>

              {/* Document checklist status updates */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Compliance Checklist</h4>
                <div className="space-y-1.5 text-[10.5px] font-bold text-slate-600">
                  {[
                    { id: 'License', name: 'CDL License Scan' },
                    { id: 'Medical', name: 'Medical Card' },
                    { id: 'Background', name: 'Background Clearance' },
                    { id: 'Training', name: 'Safety Seminars' },
                    { id: 'GovID', name: 'Passport ID' }
                  ].map(doc => {
                    const active = !!documents[doc.id]?.completed;
                    return (
                      <div key={doc.id} className="flex justify-between items-center">
                        <span className="flex items-center text-slate-500 font-semibold">{doc.name}</span>
                        {active ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Readiness score ring */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none">Readiness score</h4>
                  <span className="text-[10.5px] text-slate-500 font-bold block mt-1.5">
                    {readinessScore >= 90 ? 'Ready for Assignment' : 'Requires Review'}
                  </span>
                </div>
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r={readinessRadius} className="stroke-slate-100" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r={readinessRadius} className={readinessScore >= 90 ? 'stroke-primary' : 'stroke-amber-500'} strokeWidth="4" fill="transparent" strokeDasharray={readinessCircumference} strokeDashoffset={readinessOffset} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-text-dark">
                    {readinessScore}%
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Outcome Success Dialog Modal */}
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
                  <h3 className="text-base font-bold text-text-dark">Driver Onboarded</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Safety dossier initialized. Driver record has been updated and released to dispatch registry pool.
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
                      setName('');
                      setLicenseNum('');
                      setPhone('');
                      setCurrentStep(1);
                      setDocuments({});
                      setShowSuccessModal(false);
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Enroll Another Operator
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Outcome Error Modal */}
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
                  <h3 className="text-sm font-black text-text-dark uppercase">Registry Validation Failed</h3>
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
    </div>
  );
};
