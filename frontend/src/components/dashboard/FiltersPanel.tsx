import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X, Check, Filter } from 'lucide-react';

interface FiltersState {
  type: string;
  status: string;
  region: string;
  driver: string;
}

interface FiltersPanelProps {
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  onReset: () => void;
  availableDrivers: string[];
}

const vehicleTypes = ['All Types', 'Semi-Truck', 'Box Truck', 'Delivery Van', 'Container Carrier'];
const vehicleStatuses = ['All Statuses', 'Available', 'On Trip', 'Maintenance', 'Delayed', 'Completed'];
const regions = ['All Regions', 'East Coast', 'West Coast', 'Midwest', 'South'];

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  setFilters,
  onReset,
  availableDrivers,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [driverSearch, setDriverSearch] = useState('');

  const toggleDropdown = (name: string) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
    }
  };

  const handleSelect = (field: keyof FiltersState, value: string) => {
    setFilters({
      ...filters,
      [field]: value
    });
    setOpenDropdown(null);
  };

  const filteredDrivers = ['All Drivers', ...availableDrivers].filter(d =>
    d.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const activeFiltersCount = Object.entries(filters).filter(
    ([_, value]) => value && !value.startsWith('All')
  ).length;

  return (
    <div className="cc-body bg-white border border-[#E5E7EB] p-3.5 rounded-[16px] flex flex-wrap items-center gap-3 cc-shadow-sm relative z-20 select-none">
      <div className="flex items-center gap-2 text-[#0A0A0A] border-r border-[#E5E7EB] pr-3.5 py-1">
        <Filter className="w-4 h-4 text-[#2563EB]" />
        <span className="text-[13px] font-semibold">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="px-2 py-0.5 bg-[#2563EB] text-white text-[10px] font-bold rounded-full tabular-nums">
            {activeFiltersCount}
          </span>
        )}
      </div>

      {/* Vehicle Type Dropdown */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('type')}
          className={`flex items-center justify-between space-x-2 cc-focus bg-[#F9FAFB] border px-3 py-2 rounded-[12px] text-[12px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6] transition-colors min-w-[125px] ${
            filters.type !== 'All Types' ? 'border-[#C7D2FE] bg-[#EFF4FF] text-[#2563EB]' : 'border-[#E5E7EB]'
          }`}
        >
          <span className="truncate">{filters.type}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {openDropdown === 'type' && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-1.5 w-48 bg-white border border-border-gray rounded-xl shadow-xl z-40 overflow-hidden p-1 space-y-0.5"
              >
                {vehicleTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSelect('type', type)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>{type}</span>
                    {filters.type === type && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Vehicle Status Dropdown */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('status')}
          className={`flex items-center justify-between space-x-2 cc-focus bg-[#F9FAFB] border px-3 py-2 rounded-[12px] text-[12px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6] transition-colors min-w-[130px] ${
            filters.status !== 'All Statuses' ? 'border-[#C7D2FE] bg-[#EFF4FF] text-[#2563EB]' : 'border-[#E5E7EB]'
          }`}
        >
          <span className="truncate">{filters.status}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {openDropdown === 'status' && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-1.5 w-48 bg-white border border-border-gray rounded-xl shadow-xl z-40 overflow-hidden p-1 space-y-0.5"
              >
                {vehicleStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleSelect('status', status)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>{status}</span>
                    {filters.status === status && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Region Dropdown */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('region')}
          className={`flex items-center justify-between space-x-2 cc-focus bg-[#F9FAFB] border px-3 py-2 rounded-[12px] text-[12px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6] transition-colors min-w-[125px] ${
            filters.region !== 'All Regions' ? 'border-[#C7D2FE] bg-[#EFF4FF] text-[#2563EB]' : 'border-[#E5E7EB]'
          }`}
        >
          <span className="truncate">{filters.region}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === 'region' ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {openDropdown === 'region' && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-1.5 w-48 bg-white border border-border-gray rounded-xl shadow-xl z-40 overflow-hidden p-1 space-y-0.5"
              >
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => handleSelect('region', region)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>{region}</span>
                    {filters.region === region && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Searchable Driver Dropdown */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown('driver')}
          className={`flex items-center justify-between space-x-2 cc-focus bg-[#F9FAFB] border px-3 py-2 rounded-[12px] text-[12px] font-semibold text-[#4B5563] hover:bg-[#F3F4F6] transition-colors min-w-[140px] ${
            filters.driver !== 'All Drivers' ? 'border-[#C7D2FE] bg-[#EFF4FF] text-[#2563EB]' : 'border-[#E5E7EB]'
          }`}
        >
          <span className="truncate">{filters.driver}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === 'driver' ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {openDropdown === 'driver' && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpenDropdown(null)} />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-1.5 w-56 bg-white border border-border-gray rounded-xl shadow-xl z-40 overflow-hidden p-1.5"
              >
                <div className="relative mb-1.5">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search drivers..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-border-gray rounded-lg text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary/45"
                  />
                  {driverSearch && (
                    <button 
                      onClick={() => setDriverSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {filteredDrivers.map((driver) => (
                    <button
                      key={driver}
                      onClick={() => {
                        handleSelect('driver', driver);
                        setDriverSearch('');
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>{driver}</span>
                      {filters.driver === driver && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                  {filteredDrivers.length === 0 && (
                    <div className="text-center py-3 text-xs text-slate-400 font-medium">
                      No drivers match query
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 ml-auto">
        {activeFiltersCount > 0 && (
          <button
            onClick={() => {
              onReset();
              setDriverSearch('');
            }}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
