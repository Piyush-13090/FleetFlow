import React from 'react';
import { 
  HeartPulse, 
  Wrench, 
  FileText, 
  Fuel, 
  DollarSign, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export const FleetHealth: React.FC = () => {
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
              <span className="text-[10px] font-mono font-bold text-slate-500">12 / 17 Serviced</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '70.5%' }} />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
              <span>Progress: 70.5% completed</span>
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
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[10.5px] font-semibold text-slate-700 block">Class A CDL (Sarah Davis)</span>
                  <span className="text-[9px] text-slate-400 font-medium">Compliance renewal required</span>
                </div>
                <span className="shrink-0 text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded-md flex items-center">
                  <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                  3 Days Left
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[10.5px] font-semibold text-slate-700 block">IFTA Permit (Asset #TRK-892)</span>
                  <span className="text-[9px] text-slate-400 font-medium">Quarterly taxation registry</span>
                </div>
                <span className="shrink-0 text-[9px] font-black bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-md">
                  14 Days Left
                </span>
              </div>
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
                <span className="text-lg font-black text-text-dark font-mono">6.8 MPG</span>
                <span className="text-[10px] text-slate-400 font-medium">Fleet Target: 7.5 MPG</span>
              </div>
              
              {/* Comparative efficiency bar */}
              <div className="relative w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-slate-400 rounded-full" style={{ width: '90%' }} />
                <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: '78%' }} />
              </div>
              <span className="text-[9px] text-slate-400 font-semibold block pt-0.5">Average efficiency: 9.3% below optimization target</span>
            </div>
          </div>

          {/* Card 4: High Cost Vehicles */}
          <div className="p-3 bg-slate-50 rounded-xl border border-border-gray/50 space-y-2">
            <div className="flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-primary mr-1.5" />
              <span className="text-[11px] font-bold text-slate-700">High Cost Assets (MTD)</span>
            </div>

            <div className="space-y-1.5 text-[10.5px]">
              <div className="flex justify-between items-center font-semibold text-slate-700">
                <span>Volvo VNL (#TRK-892)</span>
                <span className="font-bold text-rose-600 font-mono">$2,410.50</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-slate-700 border-t border-slate-200/50 pt-1.5">
                <span>Peterbilt 579 (#TRK-544)</span>
                <span className="font-bold text-slate-600 font-mono">$1,850.00</span>
              </div>
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
