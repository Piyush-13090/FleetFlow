<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Wrench, 
  FileText, 
  Fuel, 
  DollarSign, 
=======
import React from 'react';
import {
  HeartPulse,
  Wrench,
  FileText,
  Fuel,
  DollarSign,
>>>>>>> fc83281 (Resolve merge conflicts after pull)
  AlertTriangle,
  ChevronRight,
  Download,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface HealthData {
  maintenanceInProgress: number;
  maintenanceTotal: number;
  averageFuelEfficiency: number;
  upcomingLicenses: Array<{ name: string; daysToExpiry: number; licenseCategory: string }>;
  highCostAssets: Array<{ registrationNumber: string; name: string; cost: number }>;
}

export const FleetHealth: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHealth = async () => {
    try {
      const res = await apiFetch('/api/fleet/health');
      if (res.ok) {
        setHealthData(await res.json());
      }
    } catch (err) {
      console.error('Failed to load health telemetry', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm select-none">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-[10px] bg-[#EFF4FF] border border-[#DBE6FF] text-[#2563EB] flex items-center justify-center">
          <HeartPulse className="w-4.5 h-4.5" />
        </div>
        <div>
          <h3 className="text-[15px] cc-display font-semibold text-[#0A0A0A] leading-tight">Fleet Health Panel</h3>
          <p className="text-[11px] text-[#6B7280]">Telemetry and compliance diagnostics</p>
        </div>
      </div>

      <div className="space-y-3 text-left">
        {/* Scheduled Maintenance */}
        <div className="p-4 bg-[#FBFCFD] rounded-[12px] border border-[#EEF1F4] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-semibold text-[#0A0A0A] flex items-center">
              <Wrench className="w-3.5 h-3.5 text-[#2563EB] mr-1.5" />
              Scheduled Maintenance
            </span>
            <span className="text-[11px] font-semibold text-[#6B7280] tabular-nums">12 / 17 Serviced</span>
          </div>
          <div className="w-full h-2 bg-[#EEF1F4] rounded-full overflow-hidden">
            <div className="h-full bg-[#2563EB] rounded-full" style={{ width: '70.5%' }} />
          </div>
          <div className="flex justify-between text-[10px] text-[#9CA3AF] font-medium">
            <span className="tabular-nums">Progress: 70.5% completed</span>
            <button className="cc-focus text-[#2563EB] font-semibold hover:underline flex items-center">
              View Schedule <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* License Expiry Alerts */}
        <div className="p-4 bg-[#FBFCFD] rounded-[12px] border border-[#EEF1F4] space-y-3">
          <div className="flex items-center">
            <FileText className="w-3.5 h-3.5 text-[#2563EB] mr-1.5" />
            <span className="text-[12px] font-semibold text-[#0A0A0A]">License Expiry Alerts</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[12px] font-semibold text-[#0A0A0A] block truncate">Class A CDL (Sarah Davis)</span>
                <span className="text-[10px] text-[#9CA3AF]">Compliance renewal required</span>
              </div>
              <span className="shrink-0 text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FBD5D5] px-2 py-1 rounded-full flex items-center">
                <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                3 Days Left
              </span>
<<<<<<< HEAD
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {isLoading ? '...' : `${healthData ? healthData.maintenanceTotal - healthData.maintenanceInProgress : 0} / ${healthData ? healthData.maintenanceTotal : 0} Serviced`}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ 
                  width: `${healthData && healthData.maintenanceTotal ? Math.round(((healthData.maintenanceTotal - healthData.maintenanceInProgress) / healthData.maintenanceTotal) * 100) : 0}%` 
                }} 
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
              <span>Progress: {healthData && healthData.maintenanceTotal ? Math.round(((healthData.maintenanceTotal - healthData.maintenanceInProgress) / healthData.maintenanceTotal) * 100) : 0}% completed</span>
              <span className="text-primary hover:underline cursor-pointer flex items-center">
                View Schedule <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
=======
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[12px] font-semibold text-[#0A0A0A] block truncate">IFTA Permit (Asset #TRK-892)</span>
                <span className="text-[10px] text-[#9CA3AF]">Quarterly taxation registry</span>
              </div>
              <span className="shrink-0 text-[10px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE8B0] px-2 py-1 rounded-full">
                14 Days Left
>>>>>>> fc83281 (Resolve merge conflicts after pull)
              </span>
            </div>
          </div>
        </div>

<<<<<<< HEAD
          {/* Card 2: License Expiry Alerts */}
          <div className="p-3 bg-slate-50 rounded-xl border border-border-gray/50 space-y-2.5">
            <div className="flex items-center">
              <FileText className="w-3.5 h-3.5 text-primary mr-1.5" />
              <span className="text-[11px] font-bold text-slate-700">License Expiry Alerts</span>
            </div>
            
            {/* Alert items */}
            <div className="space-y-2">
              {isLoading ? (
                <span className="text-[10.5px] text-slate-400 font-medium">Checking compliance...</span>
              ) : !healthData || healthData.upcomingLicenses.length === 0 ? (
                <span className="text-[10.5px] text-slate-400 font-medium">No expiring licenses.</span>
              ) : (
                healthData.upcomingLicenses.slice(0, 3).map((lic) => (
                  <div key={lic.name} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-[10.5px] font-semibold text-slate-700 block">{lic.licenseCategory} ({lic.name})</span>
                      <span className="text-[9px] text-slate-400 font-medium">Compliance renewal required</span>
                    </div>
                    <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center ${lic.daysToExpiry <= 7 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                      {lic.daysToExpiry <= 7 && <AlertTriangle className="w-2.5 h-2.5 mr-1" />}
                      {lic.daysToExpiry < 0 ? 'Expired' : `${lic.daysToExpiry} Days Left`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 3: Fuel Consumption */}
          <div className="p-3 bg-slate-50 rounded-xl border border-border-gray/50 space-y-2">
            <div className="flex items-center">
              <Fuel className="w-3.5 h-3.5 text-primary mr-1.5" />
              <span className="text-[11px] font-bold text-slate-700">Fuel Consumption Index</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-black text-text-dark font-mono">
                  {isLoading ? '...' : `${healthData ? healthData.averageFuelEfficiency : 0} MPG`}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Fleet Target: 7.5 MPG</span>
              </div>
              
              {/* Comparative efficiency bar */}
              <div className="relative w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-slate-400 rounded-full" style={{ width: '90%' }} />
                <div 
                  className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                  style={{ width: `${healthData ? Math.min(Math.round((healthData.averageFuelEfficiency / 7.5) * 78), 100) : 0}%` }} 
                />
              </div>
              <span className="text-[9px] text-slate-400 font-semibold block pt-0.5">
                {healthData && healthData.averageFuelEfficiency < 7.5 
                  ? `Average efficiency: ${Math.round(((7.5 - healthData.averageFuelEfficiency) / 7.5) * 100)}% below optimization target` 
                  : 'Average efficiency: Meeting optimization target'}
              </span>
            </div>
=======
        {/* Fuel Consumption Index */}
        <div className="p-4 bg-[#FBFCFD] rounded-[12px] border border-[#EEF1F4] space-y-2">
          <div className="flex items-center">
            <Fuel className="w-3.5 h-3.5 text-[#2563EB] mr-1.5" />
            <span className="text-[12px] font-semibold text-[#0A0A0A]">Fuel Consumption Index</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="cc-display text-[20px] font-bold text-[#0A0A0A] tabular-nums">6.8 <span className="text-[12px] text-[#6B7280] font-semibold">MPG</span></span>
            <span className="text-[11px] text-[#9CA3AF] tabular-nums">Target: 7.5 MPG</span>
>>>>>>> fc83281 (Resolve merge conflicts after pull)
          </div>
          <div className="relative w-full h-1.5 bg-[#EEF1F4] rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#CBD5E1] rounded-full" style={{ width: '90%' }} />
            <div className="absolute top-0 left-0 h-full bg-[#2563EB] rounded-full" style={{ width: '78%' }} />
          </div>
          <span className="text-[10px] text-[#9CA3AF] block pt-0.5">Average efficiency: 9.3% below optimization target</span>
        </div>

        {/* High Cost Assets */}
        <div className="p-4 bg-[#FBFCFD] rounded-[12px] border border-[#EEF1F4] space-y-2.5">
          <div className="flex items-center">
            <DollarSign className="w-3.5 h-3.5 text-[#2563EB] mr-1.5" />
            <span className="text-[12px] font-semibold text-[#0A0A0A]">High Cost Assets (MTD)</span>
          </div>
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between items-center font-medium text-[#4B5563]">
              <span>Volvo VNL (#TRK-892)</span>
              <span className="font-bold text-[#DC2626] tabular-nums">$2,410.50</span>
            </div>
<<<<<<< HEAD

            <div className="space-y-1.5 text-[10.5px]">
              {isLoading ? (
                <span className="text-[10.5px] text-slate-400 font-medium">Calculating costs...</span>
              ) : !healthData || healthData.highCostAssets.length === 0 ? (
                <span className="text-[10.5px] text-slate-400 font-medium">No recorded operational expenses.</span>
              ) : (
                healthData.highCostAssets.map((asset, index) => (
                  <div key={asset.registrationNumber} className={`flex justify-between items-center font-semibold text-slate-700 ${index > 0 ? 'border-t border-slate-200/50 pt-1.5' : ''}`}>
                    <span>{asset.name} (#{asset.registrationNumber})</span>
                    <span className="font-bold text-rose-600 font-mono">${asset.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))
              )}
=======
            <div className="flex justify-between items-center font-medium text-[#4B5563] border-t border-[#EEF1F4] pt-2">
              <span>Peterbilt 579 (#TRK-544)</span>
              <span className="font-bold text-[#0A0A0A] tabular-nums">$1,850.00</span>
>>>>>>> fc83281 (Resolve merge conflicts after pull)
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <button className="cc-focus mt-4 w-full min-h-[40px] flex items-center justify-center gap-2 rounded-[12px] border border-[#E5E7EB] text-[12px] font-semibold text-[#2563EB] hover:bg-[#EFF4FF] transition-colors">
        <Download className="w-3.5 h-3.5" />
        Download Diagnostics Report (.pdf)
      </button>
    </div>
  );
};
