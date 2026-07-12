import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Wrench, 
  FileText, 
  Fuel, 
  DollarSign, 
  AlertTriangle,
  ChevronRight
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
    <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm select-none h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-50 text-primary">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-dark">Fleet Health Panel</h3>
            <p className="text-[10px] text-slate-500 font-medium">Telemetry and compliance diagnostics</p>
          </div>
        </div>

        <div className="space-y-4 text-left">
          {/* Card 1: Maintenance Progress */}
          <div className="p-3 bg-slate-50 rounded-xl border border-border-gray/50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-700 flex items-center">
                <Wrench className="w-3.5 h-3.5 text-primary mr-1.5" />
                Scheduled Maintenance
              </span>
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
              </span>
            </div>
          </div>

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
          </div>

          {/* Card 4: High Cost Vehicles */}
          <div className="p-3 bg-slate-50 rounded-xl border border-border-gray/50 space-y-2">
            <div className="flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-primary mr-1.5" />
              <span className="text-[11px] font-bold text-slate-700">High Cost Assets (MTD)</span>
            </div>

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
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-border-gray/50 text-center">
        <span className="text-[9.5px] font-black uppercase text-primary hover:underline cursor-pointer">
          Download Diagnostics Report (.pdf)
        </span>
      </div>
    </div>
  );
};
