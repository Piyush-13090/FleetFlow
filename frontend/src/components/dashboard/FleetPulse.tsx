import { motion, useReducedMotion } from 'framer-motion';
import { Route, Users, Wrench, Activity } from 'lucide-react';
import { CountUp } from '../ui/CountUp';

interface KpiData {
  activeVehicles: number;
  availableVehicles: number;
  inMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
}

/** Signature Overview hero: animated fleet-utilization gauge + live pulse metrics. */
export const FleetPulse: React.FC<{ data: KpiData }> = ({ data }) => {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, data.fleetUtilization));

  // Semicircle gauge geometry
  const R = 74;
  const C = Math.PI * R; // half-circumference
  const offset = C * (1 - pct / 100);

  const stats = [
    { icon: Route, label: 'Active Trips', value: data.activeTrips, tint: '#EFF4FF', color: '#2563EB' },
    { icon: Users, label: 'Drivers On Duty', value: data.driversOnDuty, tint: '#ECFDF5', color: '#059669' },
    { icon: Wrench, label: 'In Maintenance', value: data.inMaintenance, tint: '#FEF2F2', color: '#DC2626' },
  ];

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white cc-shadow-sm">
      <div className="pointer-events-none absolute -top-24 -left-16 w-[360px] h-[360px] rounded-full bg-[#2563EB]/[0.05] blur-[90px]" />
      <div className="relative flex flex-col lg:flex-row items-center gap-8 p-6 sm:p-8">
        {/* Gauge */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="relative w-[180px] h-[104px]">
            <svg viewBox="0 0 180 104" className="w-full h-full">
              <path d="M16 96 A 74 74 0 0 1 164 96" fill="none" stroke="#EEF1F4" strokeWidth="14" strokeLinecap="round" />
              <motion.path
                d="M16 96 A 74 74 0 0 1 164 96"
                fill="none"
                stroke="#2563EB"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={C}
                initial={{ strokeDashoffset: reduce ? offset : C }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.3, ease: [0.2, 0.8, 0.2, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <div className="cc-display text-[34px] font-bold text-[#0A0A0A] leading-none">
                <CountUp to={pct} suffix="%" />
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mt-1">Utilization</div>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">Fleet Command</div>
            <div className="cc-display text-[22px] font-bold text-[#0A0A0A] mt-1 leading-tight">
              {data.activeVehicles + data.availableVehicles} assets<br />under command
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium text-[#059669] bg-[#ECFDF5] border border-[#C7F0DC] px-2.5 py-1 rounded-full">
              <span className="relative flex w-1.5 h-1.5">
                {!reduce && <span className="absolute inline-flex w-full h-full rounded-full bg-[#16A34A] opacity-60 animate-ping" />}
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              </span>
              All systems operational
            </div>
          </div>
        </div>

        {/* Live metrics */}
        <div className="flex-1 w-full grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-[14px] border border-[#EEF1F4] bg-[#FBFCFD] p-4">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3" style={{ backgroundColor: s.tint, color: s.color }}>
                  <Icon className="w-4.5 h-4.5" strokeWidth={1.9} />
                </div>
                <div className="cc-display text-[24px] font-bold text-[#0A0A0A] leading-none">
                  <CountUp to={s.value} />
                </div>
                <div className="text-[12px] text-[#6B7280] mt-1.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Pending pill */}
        <div className="hidden xl:flex flex-col items-center justify-center px-6 border-l border-[#EEF1F4] self-stretch">
          <Activity className="w-5 h-5 text-[#9CA3AF] mb-2" />
          <div className="cc-display text-[24px] font-bold text-[#0A0A0A] leading-none"><CountUp to={data.pendingTrips} /></div>
          <div className="text-[11px] text-[#9CA3AF] mt-1.5 text-center">Pending<br />dispatch</div>
        </div>
      </div>
    </div>
  );
};
