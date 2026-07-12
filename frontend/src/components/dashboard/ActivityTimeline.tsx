import React, { useState, useEffect } from 'react';
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
import { apiFetch } from '../../lib/api';

interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  desc: string;
  time: string;
  color?: string;
  bgColor?: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'vehicle_registered':
    case 'vehicle_removed': return Truck;
    case 'driver_registered':
    case 'driver_removed':
    case 'driver_added': return UserPlus;
    case 'trip_started': return Route;
    case 'maintenance_created':
    case 'maintenance_completed': return Wrench;
    case 'fuel_logged': return Fuel;
    case 'trip_completed': return CheckCircle;
    default: return Clock;
  }
};

const getColors = (evt: ActivityEvent) => {
  if (evt.color && evt.bgColor) return { color: evt.color, bgColor: evt.bgColor };
  switch (evt.type) {
    case 'trip_completed':
    case 'maintenance_completed':
      return { color: '#22C55E', bgColor: '#DCFCE7' };
    case 'maintenance_created':
    case 'vehicle_removed':
    case 'driver_removed':
      return { color: '#EF4444', bgColor: '#FEE2E2' };
    case 'fuel_logged':
    case 'trip_started':
      return { color: '#2563EB', bgColor: '#DBEAFE' };
    case 'driver_added':
    case 'driver_registered':
    case 'vehicle_registered':
    default:
      return { color: '#3B82F6', bgColor: '#EFF6FF' };
  }
};

export const ActivityTimeline: React.FC = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadActivities = async () => {
    try {
      const res = await apiFetch('/api/fleet/activity');
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return (
    <div className="bg-white border border-[#E5E7EB] p-5 rounded-[16px] cc-shadow-sm select-none">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-[#EFF4FF] border border-[#DBE6FF] text-[#2563EB] flex items-center justify-center">
            <Clock className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-[15px] cc-display font-semibold text-[#0A0A0A] leading-tight">Recent Activity</h3>
            <p className="text-[11px] text-[#6B7280]">Real-time dispatch timeline logs</p>
          </div>
        </div>
<<<<<<< HEAD

        <div className="relative pl-6 space-y-4 pt-1 text-left min-h-[150px]">
          {/* Vertical blue connector line */}
          <div className="absolute top-2 left-2.5 w-0.5 bottom-6 bg-slate-100 border-l-2 border-primary/20 border-dotted" />

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-xs font-semibold text-slate-400">
              Syncing activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-xs font-semibold text-slate-400">
              No recent activity.
            </div>
          ) : (
            activities.slice(0, 6).map((evt, idx) => {
              const Icon = getIcon(evt.type);
              const { color, bgColor } = getColors(evt);
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
                    style={{ backgroundColor: bgColor, color: color }}
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
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border-gray/50 text-center">
        <span 
=======
        <button
>>>>>>> fc83281 (Resolve merge conflicts after pull)
          onClick={() => alert('Full operational audit logs opened.')}
          className="cc-focus text-[11px] font-semibold text-[#2563EB] hover:underline hidden sm:block"
        >
          View Full Audit Trail
        </button>
      </div>

      {/* Event grid — fills the wide column */}
      <div className="grid sm:grid-cols-2 gap-3 text-left">
        {activityEvents.map((evt, idx) => {
          const Icon = evt.icon;
          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-[12px] border border-[#EEF1F4] bg-[#FBFCFD] hover:bg-white hover:border-[#E5E7EB] transition-colors group"
            >
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: evt.bgColor, color: evt.color }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-[13px] cc-display font-semibold text-[#0A0A0A] leading-tight truncate">
                    {evt.title}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] font-medium shrink-0 tabular-nums">{evt.time}</span>
                </div>
                <p className="text-[12px] text-[#6B7280] leading-snug mt-0.5">{evt.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
