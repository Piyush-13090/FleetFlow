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

  const loadActivities = async () => {
    try {
      const res = await apiFetch('/api/fleet/activity');
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch (err) {
      console.error('Failed to load activities', err);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const displayEvents: ActivityEvent[] = activities.length > 0 ? activities : [
    { id: '1', type: 'trip_completed', title: 'Trip TR-1001 Completed', desc: 'Driver Alex completed trip from Boston to New York.', time: '10 mins ago' },
    { id: '2', type: 'maintenance_created', title: 'Maintenance Ticket MA-909 Created', desc: 'Work order opened for Ford Transit oil change.', time: '30 mins ago' },
    { id: '3', type: 'trip_started', title: 'Trip TR-8802 Dispatched', desc: 'Driver Robert Johnson dispatched on route BOS-Hub ➔ JFK-NY.', time: '2 hours ago' },
    { id: '4', type: 'vehicle_registered', title: 'New Vehicle Registered', desc: 'Ford Transit (#Van-05) added to East Coast fleet.', time: '1 day ago' }
  ];

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
        <button
          onClick={() => alert('Full operational audit logs opened.')}
          className="cc-focus text-[11.5px] font-semibold text-[#2563EB] hover:underline cursor-pointer border-none bg-transparent p-0"
        >
          View Full Audit Trail
        </button>
      </div>

      {/* Event grid — fills the wide column */}
      <div className="grid sm:grid-cols-2 gap-3 text-left">
        {displayEvents.map((evt, idx) => {
          const Icon = getIcon(evt.type);
          const { color, bgColor } = getColors(evt);
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
                style={{ backgroundColor: bgColor, color: color }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-[12px] font-bold text-[#0A0A0A] leading-tight truncate">
                    {evt.title}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] font-medium shrink-0 tabular-nums">{evt.time}</span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">{evt.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
