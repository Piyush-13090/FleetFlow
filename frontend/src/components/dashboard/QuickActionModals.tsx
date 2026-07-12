import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Route, 
  Truck, 
  UserPlus, 
  Wrench, 
  Fuel, 
  PlusCircle, 
  Check 
} from 'lucide-react';
import type { TableRowData } from './OperationsTable';

interface QuickActionModalsProps {
  isOpen: boolean;
  onClose: () => void;
  activeActionTab: string;
  setActiveActionTab: (tab: string) => void;
  onSubmitTrip: (newTrip: TableRowData) => void;
  onSubmitVehicle: (newVehicle: { id: string; type: string }) => void;
  onSubmitDriver: (driverName: string) => void;
  availableDrivers: string[];
}

export const QuickActionModals: React.FC<QuickActionModalsProps> = ({
  isOpen,
  onClose,
  activeActionTab,
  setActiveActionTab,
  onSubmitTrip,
  onSubmitVehicle,
  onSubmitDriver,
  availableDrivers,
}) => {
  // Trip Form States
  const [tripVehicle, setTripVehicle] = useState('Volvo VNL (#TRK-892)');
  const [tripVehicleType, setTripVehicleType] = useState('Semi-Truck');
  const [tripDriver, setTripDriver] = useState(availableDrivers[0] || 'John Doe');
  const [tripRoute, setTripRoute] = useState('BOS-Hub ➔ JFK-NY');
  const [tripCargo, setTripCargo] = useState('General Goods');
  const [tripEta, setTripEta] = useState('2.5 Hours');
  const [tripRegion, setTripRegion] = useState('East Coast');

  // Vehicle Form States
  const [vehId, setVehId] = useState('TRK-988');
  const [vehName, setVehName] = useState('Peterbilt 389');
  const [vehType, setVehType] = useState('Semi-Truck');

  // Driver Form States
  const [driverName, setDriverName] = useState('');
  const [driverLicense, setDriverLicense] = useState('');

  // Maintenance Form States
  const [maintAsset, setMaintAsset] = useState('Volvo VNL (#TRK-892)');
  const [maintIssue, setMaintIssue] = useState('Oil Change');

  // Fuel Form States
  const [fuelAsset, setFuelAsset] = useState('Volvo VNL (#TRK-892)');
  const [fuelGallons, setFuelGallons] = useState('65');
  const [fuelCost, setFuelCost] = useState('210.50');

  const [isSuccess, setIsSuccess] = useState(false);

  const tabs = [
    { id: 'trip', label: 'Create Trip', icon: Route },
    { id: 'vehicle', label: 'Register Vehicle', icon: Truck },
    { id: 'driver', label: 'Add Driver', icon: UserPlus },
    { id: 'maintenance', label: 'Maintenance Log', icon: Wrench },
    { id: 'fuel', label: 'Fuel Entry', icon: Fuel }
  ];

  const handleTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrip: TableRowData = {
      id: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicle: `${tripVehicle}`,
      vehicleType: tripVehicleType,
      driver: tripDriver,
      route: tripRoute,
      status: 'On Trip',
      cargo: tripCargo,
      eta: tripEta,
      health: 100,
      region: tripRegion
    };
    onSubmitTrip(newTrip);
    triggerSuccess();
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitVehicle({
      id: `${vehName} (#${vehId})`,
      type: vehType
    });
    triggerSuccess();
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim()) return;
    onSubmitDriver(driverName);
    triggerSuccess();
  };

  const handleMaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSuccess();
  };

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset forms
      setDriverName('');
      setDriverLicense('');
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center select-none">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white border border-border-gray rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg border border-border-gray hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Success Overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  className="w-16 h-16 bg-emerald-50 text-success-green border border-emerald-100 rounded-full flex items-center justify-center mb-4"
                >
                  <Check className="w-8 h-8" strokeWidth={3} />
                </motion.div>
                <h4 className="text-base font-bold text-text-dark">Logistics Record Saved</h4>
                <p className="text-xs text-slate-500 mt-1">Operational databases synced successfully.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header & Tabs */}
          <div className="bg-slate-50 border-b border-border-gray/70 p-4 pb-0 text-left">
            <h3 className="text-sm font-black text-text-dark tracking-tight uppercase flex items-center">
              <PlusCircle className="w-4.5 h-4.5 text-primary mr-1.5" />
              Quick Action Dispatcher
            </h3>
            
            {/* Tab row */}
            <div className="flex space-x-1.5 overflow-x-auto mt-4 scrollbar-none pb-2">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeActionTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveActionTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold border transition-colors flex items-center space-x-1 shrink-0 cursor-pointer focus:outline-none ${
                      isActive 
                        ? 'bg-primary border-primary text-white shadow-sm' 
                        : 'bg-white border-border-gray text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-5 overflow-y-auto max-h-[60vh] text-left">
            {activeActionTab === 'trip' && (
              <form onSubmit={handleTripSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Vehicle</label>
                    <select 
                      value={tripVehicle} 
                      onChange={(e) => setTripVehicle(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    >
                      <option value="Volvo VNL (#TRK-892)">Volvo VNL (#TRK-892)</option>
                      <option value="Freightliner Cascadia (#TRK-201)">Freightliner Cascadia (#TRK-201)</option>
                      <option value="Peterbilt 579 (#TRK-544)">Peterbilt 579 (#TRK-544)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle Type</label>
                    <select 
                      value={tripVehicleType} 
                      onChange={(e) => setTripVehicleType(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    >
                      <option value="Semi-Truck">Semi-Truck</option>
                      <option value="Box Truck">Box Truck</option>
                      <option value="Delivery Van">Delivery Van</option>
                      <option value="Container Carrier">Container Carrier</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assign Driver</label>
                    <select 
                      value={tripDriver} 
                      onChange={(e) => setTripDriver(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    >
                      {availableDrivers.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logistics Region</label>
                    <select 
                      value={tripRegion} 
                      onChange={(e) => setTripRegion(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    >
                      <option value="East Coast">East Coast</option>
                      <option value="West Coast">West Coast</option>
                      <option value="Midwest">Midwest</option>
                      <option value="South">South</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dispatch Route</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CHI-Hub ➔ ORD-A" 
                    value={tripRoute}
                    onChange={(e) => setTripRoute(e.target.value)}
                    className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cargo Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Medical Supplies" 
                      value={tripCargo}
                      onChange={(e) => setTripCargo(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimated Transit (ETA)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 3.2 Hours" 
                      value={tripEta}
                      onChange={(e) => setTripEta(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer text-center"
                >
                  Confirm Dispatch Schedule
                </button>
              </form>
            )}

            {activeActionTab === 'vehicle' && (
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asset ID / Plate</label>
                    <input 
                      type="text" 
                      placeholder="e.g. TRK-404" 
                      value={vehId}
                      onChange={(e) => setVehId(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle Model</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Kenworth T680" 
                      value={vehName}
                      onChange={(e) => setVehName(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicle Configuration</label>
                  <select 
                    value={vehType} 
                    onChange={(e) => setVehType(e.target.value)}
                    className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="Semi-Truck">Semi-Truck</option>
                    <option value="Box Truck">Box Truck</option>
                    <option value="Delivery Van">Delivery Van</option>
                    <option value="Container Carrier">Container Carrier</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer text-center"
                >
                  Register Fleet Asset
                </button>
              </form>
            )}

            {activeActionTab === 'driver' && (
              <form onSubmit={handleDriverSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Driver Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Richard Hendricks" 
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Class A CDL License #</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CDL-TX-880291" 
                    value={driverLicense}
                    onChange={(e) => setDriverLicense(e.target.value)}
                    className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer text-center"
                >
                  Add Operator Credentials
                </button>
              </form>
            )}

            {activeActionTab === 'maintenance' && (
              <form onSubmit={handleMaintSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Asset</label>
                  <select 
                    value={maintAsset} 
                    onChange={(e) => setMaintAsset(e.target.value)}
                    className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="Volvo VNL (#TRK-892)">Volvo VNL (#TRK-892)</option>
                    <option value="Freightliner Cascadia (#TRK-201)">Freightliner Cascadia (#TRK-201)</option>
                    <option value="Peterbilt 579 (#TRK-544)">Peterbilt 579 (#TRK-544)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Issue Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Brake grinding, Oil filter change" 
                    value={maintIssue}
                    onChange={(e) => setMaintIssue(e.target.value)}
                    className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer text-center"
                >
                  Schedule Shop Visit
                </button>
              </form>
            )}

            {activeActionTab === 'fuel' && (
              <form onSubmit={handleFuelSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Asset</label>
                  <select 
                    value={fuelAsset} 
                    onChange={(e) => setFuelAsset(e.target.value)}
                    className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    <option value="Volvo VNL (#TRK-892)">Volvo VNL (#TRK-892)</option>
                    <option value="Freightliner Cascadia (#TRK-201)">Freightliner Cascadia (#TRK-201)</option>
                    <option value="Peterbilt 579 (#TRK-544)">Peterbilt 579 (#TRK-544)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gallons Added</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 70" 
                      value={fuelGallons}
                      onChange={(e) => setFuelGallons(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Invoice Cost ($)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 235.00" 
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                      className="w-full bg-slate-50 border border-border-gray rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer text-center"
                >
                  File Fuel Purchase
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
