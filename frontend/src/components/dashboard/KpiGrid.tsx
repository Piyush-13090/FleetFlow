import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  CheckCircle2, 
  Wrench, 
  Route, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';

interface KpiData {
  activeVehicles: number;
  availableVehicles: number;
  inMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
}

interface KpiGridProps {
  data: KpiData;
  isLoading: boolean;
}

const CountUp: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setCount(0);
      return;
    }
    const end = value;
    const duration = 800; // ms
    const range = end;
    const startTime = performance.now();

    let animationFrameId: number;

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * range);

      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <>{count}{suffix}</>;
};

// Generates simple aesthetic sparkline path
const Sparkline: React.FC<{ dataPoints: number[]; color: string }> = ({ dataPoints, color }) => {
  const width = 100;
  const height = 28;
  const max = Math.max(...dataPoints);
  const min = Math.min(...dataPoints);
  const range = max - min || 1;

  const points = dataPoints.map((val, idx) => {
    const x = (idx / (dataPoints.length - 1)) * width;
    const y = height - 2 - ((val - min) / range) * (height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const pathD = `M ${points}`;
  
  // Create gradient area
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="select-none pointer-events-none">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.00" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const KpiGrid: React.FC<KpiGridProps> = ({ data, isLoading }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } }
  };

  // Skeleton loading view
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div 
            key={idx} 
            className="p-5 bg-white border border-[#E5E7EB] rounded-[16px] cc-shadow-sm h-[120px] flex flex-col justify-between relative overflow-hidden"
          >
            {/* Shimmer animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent -translate-x-full animate-shimmer" 
                 style={{ animationDuration: '1.5s' }} />
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
              <div className="w-12 h-4 rounded bg-slate-100" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="w-2/3 h-6 rounded bg-slate-100" />
              <div className="w-1/2 h-3 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Cards layout configurations
  const cards = [
    {
      title: 'Active Vehicles',
      metric: data.activeVehicles,
      desc: 'Currently operational',
      trend: '+8%',
      trendUp: true,
      icon: Truck,
      color: '#2563EB',
      bgColor: '#DBEAFE',
      sparkData: [130, 134, 131, 140, 138, 142, 145]
    },
    {
      title: 'Available Vehicles',
      metric: data.availableVehicles,
      desc: 'Ready for dispatch',
      trend: '+3%',
      trendUp: true,
      icon: CheckCircle2,
      color: '#22C55E',
      bgColor: '#DCFCE7',
      sparkData: [92, 94, 96, 95, 98, 97, 98]
    },
    {
      title: 'Vehicles In Maintenance',
      metric: data.inMaintenance,
      desc: 'Service ongoing',
      trend: '-2%',
      trendUp: false, // negative is good for maintenance counts
      icon: Wrench,
      color: '#EF4444',
      bgColor: '#FEE2E2',
      sparkData: [21, 19, 18, 20, 19, 18, 17]
    },
    {
      title: 'Active Trips',
      metric: data.activeTrips,
      desc: 'Currently dispatched',
      trend: '+11%',
      trendUp: true,
      icon: Route,
      color: '#2563EB',
      bgColor: '#DBEAFE',
      sparkData: [32, 35, 34, 38, 37, 40, 42]
    },
    {
      title: 'Pending Trips',
      metric: data.pendingTrips,
      desc: 'Awaiting dispatch',
      trend: 'Normal',
      trendUp: null,
      icon: Clock,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      sparkData: [11, 15, 12, 14, 13, 15, 13]
    },
    {
      title: 'Drivers On Duty',
      metric: data.driversOnDuty,
      desc: 'Currently driving',
      trend: '+6%',
      trendUp: true,
      icon: Users,
      color: '#2563EB',
      bgColor: '#DBEAFE',
      sparkData: [59, 61, 60, 62, 63, 64, 65]
    }
  ];

  // Circular progress math
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.fleetUtilization / 100) * circumference;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.015, borderColor: '#2563EB' }}
            className="p-5 bg-white border border-[#E5E7EB] rounded-[16px] flex flex-col justify-between cc-shadow-sm hover:cc-shadow-md transition-all duration-300 relative group cursor-pointer"
          >
            {/* Header row */}
            <div className="flex justify-between items-start">
              <div 
                className="p-2 rounded-xl shrink-0 transition-colors duration-300"
                style={{ backgroundColor: card.bgColor, color: card.color }}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              
              {card.trendUp !== null && (
                <div className={`flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  card.trendUp 
                    ? 'bg-[#ECFDF5] text-[#059669]' 
                    : 'bg-[#FEF2F2] text-[#DC2626]'
                }`}>
                  {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{card.trend}</span>
                </div>
              )}
            </div>

            {/* Metric row */}
            <div className="mt-4 flex justify-between items-end">
              <div>
                <h3 className="cc-display text-[26px] font-bold text-[#0A0A0A] tracking-tight leading-none tabular-nums">
                  <CountUp value={card.metric} />
                </h3>
                <p className="text-[10px] uppercase font-bold text-[#9CA3AF] mt-1.5 tracking-[0.12em]">
                  {card.title}
                </p>
                <span className="text-[10px] text-slate-500 block font-medium mt-0.5 leading-none">
                  {card.desc}
                </span>
              </div>

              {/* Sparkline trend chart */}
              <div className="w-20 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                <Sparkline dataPoints={card.sparkData} color={card.color} />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Fleet Utilization Card with Circular Progress Ring */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -5, scale: 1.015, borderColor: '#2563EB' }}
        className="p-5 bg-white border border-[#E5E7EB] rounded-[16px] flex items-center justify-between cc-shadow-sm hover:cc-shadow-md transition-all duration-300 relative group cursor-pointer sm:col-span-2 lg:col-span-1"
      >
        <div className="space-y-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="pt-2">
            <h3 className="cc-display text-[26px] font-bold text-[#0A0A0A] tracking-tight leading-none tabular-nums">
              <CountUp value={data.fleetUtilization} suffix="%" />
            </h3>
            <p className="text-[10px] uppercase font-bold text-[#9CA3AF] mt-1.5 tracking-[0.12em]">
              Fleet Utilization
            </p>
            <span className="text-[10px] text-slate-500 block font-medium mt-0.5 leading-none">
              Asset utilization index
            </span>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Foreground progress circle */}
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-primary"
              strokeWidth="5.5"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-text-dark">
            {data.fleetUtilization}%
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
