import React from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  UserPlus, 
  Route, 
  Wrench, 
  Fuel, 
  CheckCircle,
  Clock 
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'vehicle_registered' | 'driver_added' | 'trip_started' | 'maintenance_created' | 'fuel_logged' | 'trip_completed';
  title: string;
  desc: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const activityEvents: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'trip_completed',
    title: 'Trip #TR-7611 Completed',
    desc: 'Asset #TRK-544 arrived safely at Dallas Hub',
    time: '24 mins ago',
    icon: CheckCircle,
    color: '#22C55E',
    bgColor: '#DCFCE7',
  },
  {
    id: 'act-2',
    type: 'maintenance_created',
    title: 'Maintenance Created',
    desc: 'Volvo VNL (#TRK-892) registered for engine diagnostics',
    time: '1.2 hours ago',
    icon: Wrench,
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
  {
    id: 'act-3',
    type: 'fuel_logged',
    title: 'Fuel Logged',
    desc: '120 Gallons ($410.50) added to Asset #TRK-201',
    time: '2.5 hours ago',
    icon: Fuel,
    color: '#2563EB',
    bgColor: '#DBEAFE',
  },
  {
    id: 'act-4',
    type: 'trip_started',
    title: 'Trip #TR-8802 Dispatched',
    desc: 'Asset #TRK-892 left Boston Hub bound for JFK New York',
    time: '4 hours ago',
    icon: Route,
    color: '#2563EB',
    bgColor: '#DBEAFE',
  },
  {
    id: 'act-5',
    type: 'driver_added',
    title: 'Driver Assigned',
    desc: 'Sarah Davis assigned to Freightliner Cascadia (#TRK-201)',
    time: '6 hours ago',
    icon: UserPlus,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: 'act-6',
    type: 'vehicle_registered',
    title: 'New Asset Registered',
    desc: 'Peterbilt 579 (Asset #TRK-544) added to MidWest Fleet',
    time: '1 day ago',
    icon: Truck,
    color: '#2563EB',
    bgColor: '#DBEAFE',
  }
];

export const ActivityTimeline: React.FC = () => {
  return (
    <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm select-none h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-50 text-primary">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-dark">Recent Activity</h3>
            <p className="text-[10px] text-slate-500 font-medium">Real-time dispatch timeline logs</p>
          </div>
        </div>

        <div className="relative pl-6 space-y-4 pt-1 text-left">
          {/* Vertical blue connector line */}
          <div className="absolute top-2 left-2.5 w-0.5 bottom-6 bg-slate-100 border-l-2 border-primary/20 border-dotted" />

          {activityEvents.map((evt, idx) => {
            const Icon = evt.icon;
            return (
              <motion.div 
                key={evt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="relative flex items-start space-x-3 group"
              >
                {/* Node icon circle */}
                <div 
                  className="absolute -left-6.5 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm transition-all duration-300 group-hover:scale-110 z-10"
                  style={{ backgroundColor: evt.bgColor, color: evt.color }}
                >
                  <Icon className="w-3 h-3" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-[11px] font-bold text-text-dark group-hover:text-primary transition-colors leading-tight">
                      {evt.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold font-mono shrink-0">
                      {evt.time}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    {evt.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border-gray/50 text-center">
        <span 
          onClick={() => alert('Full operational audit logs opened.')}
          className="text-[9.5px] font-black uppercase text-primary hover:underline cursor-pointer"
        >
          View Full Audit Trail
        </span>
      </div>
    </div>
  );
};
