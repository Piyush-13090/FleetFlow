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
import { SectionHeader } from '../ui/SectionHeader';
import { Field, SelectField } from '../ui/Field';
import { ModalShell } from '../ui/ModalShell';
import { Reveal } from '../ui/Reveal';

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
    <Reveal className="space-y-6 select-none relative text-left">
      
      {/* Sticky top action header */}
      <SectionHeader
        title={isEditMode ? 'Edit Driver Profile' : 'Register New Driver'}
        subtitle="Create and manage professional driver profiles with complete compliance and safety information."
        onBack={onClose}
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
              className="px-4 py-2 bg-primary hover:bg-[#1D4ED8] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white text-xs font-bold rounded-[12px] cc-shadow-sm hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isEditMode ? 'Save Profile' : 'Register Driver'}</span>
              )}
            </button>
          </>
        }
      />

      {/* Stepper progress indicator ribbon */}
      <div className="max-w-4xl mx-auto bg-white border border-[#E5E7EB] p-4 rounded-[16px] flex items-center justify-between cc-shadow-sm">
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
                className="flex items-center space-x-2.5 focus:outline-none cursor-pointer text-left"
              >
                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-xs font-black transition-all ${
                  isDone 
                    ? 'bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC]' 
                    : isActive 
                      ? 'bg-primary text-white ring-4 ring-primary/10' 
                      : 'bg-[#F3F4F6] text-[#9CA3AF]'
                }`}>
                  {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : item.step}
                </div>
                <span className={`text-xs font-bold transition-colors ${isActive ? 'text-primary' : 'text-[#4B5563]'}`}>
                  {item.label}
                </span>
              </button>
              {item.step < 4 && (
                <div className="flex-1 mx-4 h-0.5 bg-[#F3F4F6] hidden sm:block" />
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
                  <h3 className="text-sm font-bold text-[#0A0A0A] border-b border-[#F3F4F6] pb-2 flex items-center">
                    <User className="w-4 h-4 text-primary mr-1.5" /> Step 1 — Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field 
                      label="Driver Full Name" 
                      placeholder="e.g. Robert Johnson" 
                      value={name}
                      onChange={setName}
                      error={shakeFields.name ? 'Driver Full Name is required.' : undefined}
                      required
                    />
                    <Field 
                      label="Employee ID" 
                      value={empId}
                      onChange={setEmpId}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field 
                      label="Phone Number" 
                      placeholder="+1 (555) 010-9090" 
                      value={phone}
                      onChange={setPhone}
                      error={shakeFields.phone ? 'Phone Number is invalid.' : undefined}
                    />
                    <Field 
                      label="Email Address" 
                      type="email" 
                      placeholder="e.g. robert@fleetflow.io" 
                      value={email}
                      onChange={setEmail}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field 
                      label="Date of Birth" 
                      type="date" 
                      value={dob}
                      onChange={setDob}
                    />
                    <SelectField 
                      label="Gender"
                      value={gender}
                      onChange={setGender}
                      options={[
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' }
                      ]}
                    />
                  </div>

                  <Field 
                    label="Street Address" 
                    placeholder="e.g. 120 Logistics Way" 
                    value={address}
                    onChange={setAddress}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field 
                      label="City" 
                      placeholder="e.g. Austin" 
                      value={city}
                      onChange={setCity}
                    />
                    <Field 
                      label="State" 
                      placeholder="e.g. TX" 
                      value={state}
                      onChange={setState}
                    />
                    <Field 
                      label="Postal / ZIP Code" 
                      placeholder="ZIP" 
                      value={zip}
                      onChange={setZip}
                    />
                  </div>

                  <div className="pt-3 border-t border-[#F3F4F6] space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider leading-none">Emergency Contact</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Field 
                        label="Contact Full Name" 
                        placeholder="e.g. Mary Johnson (Spouse)" 
                        value={emergencyName}
                        onChange={setEmergencyName}
                      />
                      <Field 
                        label="Contact Number" 
                        placeholder="+1 (555) 010-9091" 
                        value={emergencyPhone}
                        onChange={setEmergencyPhone}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: LICENSE INFORMATION */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <h3 className="text-sm font-bold text-[#0A0A0A] border-b border-[#F3F4F6] pb-2 flex items-center">
                    <SlidersHorizontal className="w-4 h-4 text-primary mr-1.5" /> Step 2 — Commercial License Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field 
                      label="License Number" 
                      placeholder="e.g. CDL-TX89012" 
                      value={licenseNum}
                      onChange={(val) => setLicenseNum(val.toUpperCase())}
                      error={shakeFields.licenseNum ? (isLicenseUnique === false ? 'License Number already exists.' : 'License Number is required.') : undefined}
                      right={
                        isLicenseUnique === true ? (
                          <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#C7F0DC]">✓ Unique</span>
                        ) : isLicenseUnique === false ? (
                          <span className="text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FBD5D5]">✗ Duplicate</span>
                        ) : null
                      }
                      required
                    />
                    <SelectField 
                      label="CDL Category"
                      value={category}
                      onChange={setCategory}
                      options={[
                        { value: 'CDL-A', label: 'Class A CDL' },
                        { value: 'CDL-B', label: 'Class B CDL' }
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field 
                      label="License Issue Date" 
                      type="date" 
                      value={issueDate}
                      onChange={setIssueDate}
                    />
                    <Field 
                      label="License Expiry Date" 
                      type="date" 
                      value={expiryDate}
                      onChange={setExpiryDate}
                      error={shakeFields.expiryDate ? 'License has expired.' : undefined}
                    />
                    <Field 
                      label="Experience (Years)" 
                      type="number" 
                      value={experience}
                      onChange={setExperience}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field 
                      label="Issuing Authority" 
                      value={issuingAuthority}
                      onChange={setIssuingAuthority}
                    />
                    <Field 
                      label="License Country" 
                      value={licenseCountry}
                      onChange={setLicenseCountry}
                    />
                    <Field 
                      label="License State" 
                      value={licenseState}
                      onChange={setLicenseState}
                    />
                  </div>

                  {/* Licensing validation warning checkmarks */}
                  <div className="pt-3 border-t border-[#F3F4F6]">
                    {expiryInfo.status === 'expired' ? (
                      <div className="p-3 bg-[#FEF2F2] border border-[#FBD5D5] rounded-[12px] flex items-start space-x-2 text-[#DC2626] animate-pulse">
                        <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <span className="text-[10.5px] font-semibold">
                          Driver cannot be assigned until license is renewed. Current expiry status: {expiryInfo.label}.
                        </span>
                      </div>
                    ) : expiryInfo.status === 'expiring_soon' ? (
                      <div className="p-3 bg-[#FFFBEB] border border-[#FDE8C4] rounded-[12px] flex items-start space-x-2 text-[#D97706]">
                        <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                        <span className="text-[10.5px] font-semibold">
                          License expires soon: {expiryInfo.label}. Ensure renewal document uploads are queued.
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#EFF4FF] border border-[#DBE6FF] rounded-[12px] flex items-start space-x-2 text-[#4B5563]">
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
                  <h3 className="text-sm font-bold text-[#0A0A0A] border-b border-[#F3F4F6] pb-2 flex items-center">
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
                        <div key={doc.id} className="border border-[#E5E7EB] hover:border-primary/45 p-4 rounded-[12px] text-center space-y-2.5 bg-[#F9FAFB]/40 relative transition-all">
                          <Upload className="w-5.5 h-5.5 text-[#9CA3AF] mx-auto" />
                          <div>
                            <h4 className="text-[11px] font-bold text-[#4B5563] leading-tight">{doc.label}</h4>
                            {isUploaded ? (
                              <span className="text-[8.5px] font-black text-[#059669] mt-1 block">Verified</span>
                            ) : progress > 0 ? (
                              <div className="w-full bg-[#E5E7EB] h-1 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                              </div>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => handleDocumentUpload(doc.id)}
                                className="text-[9px] font-black text-primary hover:text-[#1D4ED8] mt-1 cursor-pointer block mx-auto focus:outline-none"
                              >
                                Upload File
                              </button>
                            )}
                          </div>
                          {isUploaded && (
                            <button
                              onClick={() => handleRemoveDoc(doc.id)}
                              className="absolute top-2 right-2 p-1 text-[#9CA3AF] hover:text-[#DC2626] rounded hover:bg-[#F3F4F6] transition-all cursor-pointer"
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
                  <h3 className="text-sm font-bold text-[#0A0A0A] border-b border-[#F3F4F6] pb-2 flex items-center">
                    <User className="w-4.5 h-4.5 text-primary mr-1.5" /> Step 4 — Safety Rating & Availability
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-[#4B5563]">
                      <span>Initial Safety Score Setting</span>
                      <span className={`${safetyCategory.color} font-mono`}>{safetyScore}% ({safetyCategory.label})</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      step="1"
                      value={safetyScore}
                      onChange={(e) => setSafetyScore(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer h-1.5 rounded-lg bg-[#E5E7EB]"
                    />
                  </div>

                  <div className="space-y-1">
                    <SelectField 
                      label="Corporate Hub Region"
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-[#F3F4F6]">
                    {[
                      { id: 'Available', label: 'Available', desc: 'Driver is active and ready for route assignment.' },
                      { id: 'Off Duty', label: 'Off Duty', desc: 'Driver is off duty for rest periods.' },
                      { id: 'Suspended', label: 'Suspended', desc: 'Dossier is suspended for safety audits.' }
                    ].map(item => (
                      <div
                        key={item.id}
                        onClick={() => setStatus(item.id as any)}
                        className={`p-3 border rounded-[12px] cursor-pointer transition-all text-left ${
                          status === item.id ? 'border-primary ring-2 ring-primary bg-blue-50/5' : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                        }`}
                      >
                        <h4 className="font-bold text-xs text-[#0A0A0A]">{item.label}</h4>
                        <p className="text-[9.5px] text-[#6B7280] mt-1 leading-tight">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Stepper actions footer */}
            <div className="flex justify-between pt-6 border-t border-[#F3F4F6] mt-6 select-none">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="px-3.5 py-2 border border-[#E5E7EB] hover:bg-[#F9FAFB] disabled:opacity-40 text-[#4B5563] text-xs font-bold rounded-[12px] flex items-center space-x-1 transition-all cursor-pointer focus:outline-none"
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
                  <span>Register Driver</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Live Preview Panel */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm text-left space-y-4">
              <h3 className="text-xs font-black text-[#0A0A0A] tracking-tight uppercase border-b border-[#F3F4F6] pb-2">Onboarding Live Preview</h3>
              
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-[#EFF4FF] text-primary border border-[#DBE6FF] flex items-center justify-center shrink-0 shadow-inner">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0A0A0A] text-xs">{name || '—'}</h4>
                  <span className="text-[10px] font-bold font-mono text-[#9CA3AF] mt-1 block uppercase">{licenseNum || '—'} ({category})</span>
                </div>
              </div>

              {/* Document checklist status updates */}
              <div className="pt-4 border-t border-[#F3F4F6] space-y-2">
                <h4 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider">Compliance Checklist</h4>
                <div className="space-y-1.5 text-[10.5px] font-bold text-[#4B5563]">
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
                        <span className="flex items-center text-[#6B7280] font-semibold">{doc.name}</span>
                        {active ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-[#D1D5DB]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Readiness score ring */}
              <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider leading-none">Readiness score</h4>
                  <span className="text-[10.5px] text-[#6B7280] font-bold block mt-1.5">
                    {readinessScore >= 90 ? 'Ready for Assignment' : 'Requires Review'}
                  </span>
                </div>
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r={readinessRadius} className="stroke-[#F3F4F6]" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r={readinessRadius} className={readinessScore >= 90 ? 'stroke-primary' : 'stroke-[#D97706]'} strokeWidth="4" fill="transparent" strokeDasharray={readinessCircumference} strokeDashoffset={readinessOffset} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#0A0A0A] font-mono tabular-nums">
                    {readinessScore}%
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Outcome Success Dialog Modal */}
        <ModalShell
          isOpen={showSuccessModal}
          onClose={onClose}
          title="Driver Onboarded"
          subtitle="Safety dossier initialized."
          footer={
            <div className="w-full flex flex-col space-y-2">
              <button
                onClick={onClose}
                className="w-full py-2 bg-primary hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[12px] transition-colors cursor-pointer cc-shadow-sm"
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
                className="w-full py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] text-xs font-bold rounded-[12px] transition-colors cursor-pointer"
              >
                Enroll Another Operator
              </button>
            </div>
          }
        >
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-[#ECFDF5] text-[#059669] border border-[#C7F0DC] rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" strokeWidth={3} />
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Safety dossier initialized. Driver record has been updated and released to dispatch registry pool.
            </p>
          </div>
        </ModalShell>

        {/* Outcome Error Modal */}
        <ModalShell
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Registry Validation Failed"
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
      </div>
    </Reveal>
  );
};
