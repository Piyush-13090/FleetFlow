import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Heart,
  Inbox
} from 'lucide-react';

export interface TableRowData {
  id: string;
  vehicle: string;
  vehicleType: string;
  driver: string;
  driverAvatar?: string;
  route: string;
  status: 'Available' | 'On Trip' | 'Maintenance' | 'Delayed' | 'Completed';
  cargo: string;
  eta: string;
  health: number; // percentage health 0-100
  region: string;
}

interface OperationsTableProps {
  rows: TableRowData[];
  isLoading: boolean;
  onViewDetails: (row: TableRowData) => void;
  onEditRow: (row: TableRowData) => void;
  onDeleteRow: (id: string) => void;
  onCreateTripClick: () => void;
}

export const OperationsTable: React.FC<OperationsTableProps> = ({
  rows,
  isLoading,
  onViewDetails,
  onEditRow,
  onDeleteRow,
  onCreateTripClick,
}) => {
  const getStatusBadge = (status: TableRowData['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 shrink-0" />
            Available
          </span>
        );
      case 'On Trip':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 shrink-0 animate-pulse" />
            On Trip
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 shrink-0" />
            Maintenance
          </span>
        );
      case 'Delayed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 shrink-0 animate-ping" style={{ animationDuration: '2s' }} />
            Delayed
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1 shrink-0" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getHealthIndicator = (health: number) => {
    let color = 'text-emerald-500';
    if (health < 75 && health >= 60) color = 'text-amber-500';
    if (health < 60) color = 'text-rose-500';

    return (
      <div className="flex items-center space-x-1.5">
        <Heart className={`w-3.5 h-3.5 fill-current ${color}`} />
        <span className="text-[11px] font-semibold text-slate-700 font-mono">{health}%</span>
      </div>
    );
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="bg-white border border-border-gray rounded-2xl p-5 shadow-sm mt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="w-48 h-5 rounded bg-slate-100 animate-pulse" />
          <div className="w-24 h-8 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="space-y-3.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 border-b border-border-gray/50">
              <div className="w-1/4 h-4 rounded bg-slate-100 animate-pulse" />
              <div className="w-1/6 h-4 rounded bg-slate-100 animate-pulse" />
              <div className="w-1/5 h-4 rounded bg-slate-100 animate-pulse" />
              <div className="w-12 h-5 rounded bg-slate-100 animate-pulse" />
              <div className="w-10 h-4 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State View
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-border-gray rounded-2xl p-10 shadow-sm mt-6 text-center select-none">
        <div className="max-w-md mx-auto py-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-6 shadow-sm">
            <Inbox className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-bold text-text-dark">No Active Trips</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            There are no active trips matching your current query. Create your first dispatch or reset filters to start tracking operations.
          </p>
          <button
            onClick={onCreateTripClick}
            className="mt-6 px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            Create Trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-gray rounded-2xl shadow-sm mt-6 overflow-hidden select-none">
      <div className="px-5 py-4 border-b border-border-gray/70 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-dark">Operations Overview</h3>
          <p className="text-[10px] text-slate-500 font-medium">Real-time status of dispatch activities</p>
        </div>
        <div className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-border-gray px-2 py-1 rounded-lg">
          Showing {rows.length} Active Records
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-border-gray/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-5">Vehicle</th>
              <th className="py-3 px-5">Driver</th>
              <th className="py-3 px-5">Current Route</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Cargo</th>
              <th className="py-3 px-5">ETA</th>
              <th className="py-3 px-5">Health</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-gray/50">
            {rows.map((row) => (
              <motion.tr
                key={row.id}
                whileHover={{ backgroundColor: '#F8FAFC/60' }}
                className="text-xs hover:bg-slate-50/40 transition-colors group"
              >
                {/* Vehicle Column */}
                <td className="py-3.5 px-5 font-semibold text-text-dark">
                  <div className="flex flex-col">
                    <span className="font-bold leading-none">{row.vehicle}</span>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">{row.vehicleType}</span>
                  </div>
                </td>

                {/* Driver Column */}
                <td className="py-3.5 px-5 text-slate-600">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-black shrink-0">
                      {row.driver.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-semibold text-slate-700">{row.driver}</span>
                  </div>
                </td>

                {/* Route Column */}
                <td className="py-3.5 px-5 font-mono text-[11px] text-slate-600 font-medium">
                  {row.route}
                </td>

                {/* Status Column */}
                <td className="py-3.5 px-5">
                  {getStatusBadge(row.status)}
                </td>

                {/* Cargo Column */}
                <td className="py-3.5 px-5 text-slate-700 font-semibold truncate max-w-[130px]">
                  {row.cargo}
                </td>

                {/* ETA Column */}
                <td className="py-3.5 px-5 text-slate-600 font-semibold font-mono">
                  {row.eta}
                </td>

                {/* Health Score Column */}
                <td className="py-3.5 px-5">
                  {getHealthIndicator(row.health)}
                </td>

                {/* Actions Column */}
                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onViewDetails(row)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditRow(row)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteRow(row.id)}
                      className="p-1.5 text-slate-400 hover:text-danger-red hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
