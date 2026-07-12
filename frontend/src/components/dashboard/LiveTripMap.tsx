import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Compass, 
  Info,
  Clock
} from 'lucide-react';

interface ActiveTrip {
  id: string;
  vehicle: string;
  driver: string;
  source: string;
  destination: string;
  cargo: string;
  eta: string;
  distanceRemaining: number; // in miles
  status: 'Available' | 'On Trip' | 'Maintenance' | 'Delayed' | 'Completed';
  coordinates: { x: number; y: number }[]; // keyframes along route path
}

const activeTripsMock: ActiveTrip[] = [
  {
    id: 'TR-8802',
    vehicle: 'Volvo VNL (Asset #TRK-892)',
    driver: 'Robert Johnson',
    source: 'Boston Hub (BOS-1)',
    destination: 'New York Logistics (JFK-5)',
    cargo: 'Medical Equipment',
    eta: '1.2 Hours',
    distanceRemaining: 68,
    status: 'On Trip',
    coordinates: [
      { x: 100, y: 80 },
      { x: 160, y: 90 },
      { x: 220, y: 120 },
      { x: 260, y: 160 },
      { x: 290, y: 210 }
    ]
  },
  {
    id: 'TR-9114',
    vehicle: 'Freightliner Cascadia (#TRK-201)',
    driver: 'Sarah Davis',
    source: 'Chicago Depot (CHI-3)',
    destination: 'Minneapolis Terminal (MSP-2)',
    cargo: 'Consumer Electronics',
    eta: '3.8 Hours',
    distanceRemaining: 215,
    status: 'Delayed',
    coordinates: [
      { x: 420, y: 60 },
      { x: 450, y: 100 },
      { x: 430, y: 150 },
      { x: 390, y: 190 },
      { x: 360, y: 220 }
    ]
  },
  {
    id: 'TR-7761',
    vehicle: 'Peterbilt 579 (Asset #TRK-544)',
    driver: 'John Doe',
    source: 'Houston Freight (HOU-4)',
    destination: 'Dallas Distribution (DAL-1)',
    cargo: 'Automotive Parts',
    eta: '0.4 Hours',
    distanceRemaining: 18,
    status: 'On Trip',
    coordinates: [
      { x: 180, y: 250 },
      { x: 170, y: 220 },
      { x: 155, y: 185 },
      { x: 150, y: 140 }
    ]
  }
];

export const LiveTripMap: React.FC = () => {
  const [selectedTrip, setSelectedTrip] = useState<ActiveTrip>(activeTripsMock[0]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // SVG dimensions for map
  const mapWidth = 620;
  const mapHeight = 280;

  return (
    <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm select-none mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-primary">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-dark">Live Trip Monitor</h3>
            <p className="text-[10px] text-slate-500 font-medium">Real-time dispatch tracking and telemetry</p>
          </div>
        </div>

        {/* Route Selector tab buttons */}
        <div className="flex space-x-1.5 bg-slate-50 p-1 border border-border-gray rounded-xl self-start sm:self-auto">
          {activeTripsMock.map((trip) => (
            <button
              key={trip.id}
              onClick={() => setSelectedTrip(trip)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                selectedTrip.id === trip.id 
                  ? 'bg-white text-primary shadow-sm border border-slate-100' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {trip.id}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Map Card */}
        <div className="lg:col-span-2 relative bg-slate-900 border border-slate-950 rounded-xl overflow-hidden h-[280px] flex items-center justify-center shadow-inner">
          {/* Compass Rose overlay */}
          <div className="absolute top-4 left-4 pointer-events-none opacity-20 text-slate-400">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="20" cy="20" r="16" strokeDasharray="3 3" />
              <line x1="20" y1="4" x2="20" y2="36" />
              <line x1="4" y1="20" x2="36" y2="20" />
              <polygon points="20,10 23,20 20,17 17,20" fill="currentColor" />
              <polygon points="20,30 23,20 20,23 17,20" fill="currentColor" />
            </svg>
          </div>

          <svg 
            viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
            className="w-full h-full object-cover opacity-90"
          >
            {/* Styled Abstract Map Roads Grid */}
            <g className="opacity-15 stroke-slate-600" strokeWidth="0.75" fill="none">
              <path d="M-10,40 C100,50 200,30 350,60 T700,50" />
              <path d="M-10,120 C150,110 300,150 450,110 T700,120" />
              <path d="M-10,210 C180,240 320,190 480,230 T700,210" />
              
              <path d="M120,-10 C90,80 140,160 110,220 T130,300" />
              <path d="M280,-10 C310,90 270,180 300,240 T280,300" />
              <path d="M490,-10 C460,70 520,150 480,210 T500,300" />
            </g>

            {/* Static Hub Nodes */}
            <g className="fill-slate-700 stroke-slate-500" strokeWidth="1.5">
              <circle cx="100" cy="80" r="4.5" />
              <circle cx="420" cy="60" r="4.5" />
              <circle cx="180" cy="250" r="4.5" />
              <circle cx="290" cy="210" r="4.5" />
              <circle cx="360" cy="220" r="4.5" />
              <circle cx="150" cy="140" r="4.5" />
            </g>

            {/* Inactive trip paths (faint blue) */}
            {activeTripsMock.map((trip) => {
              if (trip.id === selectedTrip.id) return null;
              
              // Generate path string
              const pathD = `M ${trip.coordinates.map(c => `${c.x},${c.y}`).join(' L ')}`;
              return (
                <path
                  key={trip.id}
                  d={pathD}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="1.75"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Active Selected Trip Path (glowing dashed line) */}
            {(() => {
              const pathD = `M ${selectedTrip.coordinates.map(c => `${c.x},${c.y}`).join(' L ')}`;
              return (
                <>
                  {/* Outer glow stroke */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="5"
                    strokeOpacity="0.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Main solid path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Dashed motion layer */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#DBEAFE"
                    strokeWidth="2.5"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-map-dash"
                  />
                </>
              );
            })()}

            {/* Source Pin */}
            {(() => {
              const start = selectedTrip.coordinates[0];
              return (
                <g transform={`translate(${start.x}, ${start.y})`}>
                  <circle r="7" fill="#2563EB" fillOpacity="0.2" className="animate-ping" style={{ animationDuration: '3s' }} />
                  <circle r="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                </g>
              );
            })()}

            {/* Destination Pin */}
            {(() => {
              const end = selectedTrip.coordinates[selectedTrip.coordinates.length - 1];
              return (
                <g transform={`translate(${end.x}, ${end.y})`}>
                  <circle r="9" fill="#22C55E" fillOpacity="0.25" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                  <circle r="5" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2" />
                </g>
              );
            })()}

            {/* Animated Moving Vehicle Marker along the coordinates */}
            {(() => {
              const xCoords = selectedTrip.coordinates.map(c => c.x);
              const yCoords = selectedTrip.coordinates.map(c => c.y);
              
              return (
                <motion.g
                  animate={{
                    x: xCoords,
                    y: yCoords
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 15,
                    ease: 'easeInOut'
                  }}
                  onMouseEnter={() => setHoveredNode(selectedTrip.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer"
                >
                  {/* Outer pulse indicator */}
                  <circle cx="0" cy="0" r="10" fill={selectedTrip.status === 'Delayed' ? '#F59E0B' : '#2563EB'} fillOpacity="0.25" className="animate-pulse" />
                  
                  {/* Truck dot marker */}
                  <circle 
                    cx="0" 
                    cy="0" 
                    r="6.5" 
                    fill={selectedTrip.status === 'Delayed' ? '#F59E0B' : '#2563EB'} 
                    stroke="#FFFFFF" 
                    strokeWidth="2" 
                  />
                  
                  {/* Mini Direction Pointer */}
                  <polygon points="-3,-9 0,-14 3,-9" fill="#FFFFFF" className="transform rotate-45" />
                </motion.g>
              );
            })()}
          </svg>

          {/* Hover Vehicle Alert */}
          <AnimatePresence>
            {hoveredNode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute bg-slate-950/95 border border-slate-800 text-white p-3 rounded-lg shadow-xl text-[10px] pointer-events-none z-10 bottom-4 left-4 space-y-1 w-48"
              >
                <div className="font-bold text-blue-400 flex items-center">
                  <Navigation className="w-3 h-3 mr-1 rotate-45" />
                  Telemetry Locked
                </div>
                <div className="text-slate-300 font-semibold">{selectedTrip.vehicle}</div>
                <div className="text-slate-400">Driver: {selectedTrip.driver}</div>
                <div className="text-slate-400 mt-1">Speed: 64 mph (GPS lock)</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detailed Dispatch Info Panel */}
        <div className="bg-slate-50 border border-border-gray p-4 rounded-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-gray/70">
              <span className="text-[11px] font-black text-slate-800 tracking-tight uppercase">Trip Details</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                selectedTrip.status === 'Delayed' 
                  ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                {selectedTrip.status === 'Delayed' ? <AlertTriangle className="w-3 h-3 mr-0.5" /> : <TrendingUp className="w-3 h-3 mr-0.5" />}
                <span>{selectedTrip.status}</span>
              </span>
            </div>

            <div className="space-y-3">
              {/* Route checkpoints */}
              <div className="relative pl-6 space-y-4">
                {/* Connecting timeline line */}
                <div className="absolute top-1.5 left-2 w-0.5 h-10 bg-slate-300 border-dashed border-l border-slate-400" />

                <div className="relative text-left">
                  <MapPin className="absolute -left-6 top-0 w-4 h-4 text-primary" />
                  <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Origin Hub</span>
                  <span className="text-[11px] font-semibold text-text-dark leading-none">{selectedTrip.source}</span>
                </div>

                <div className="relative text-left">
                  <MapPin className="absolute -left-6 top-0 w-4 h-4 text-success-green" />
                  <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Destination Hub</span>
                  <span className="text-[11px] font-semibold text-text-dark leading-none">{selectedTrip.destination}</span>
                </div>
              </div>

              {/* Cargo & ETA grids */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-gray/70 text-left">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Cargo Payload</span>
                  <span className="text-[11px] font-bold text-slate-700">{selectedTrip.cargo}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">GPS ETA Lock</span>
                  <span className="text-[11px] font-bold text-slate-700 flex items-center">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                    {selectedTrip.eta}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Active Driver</span>
                  <span className="text-[11px] font-bold text-slate-700">{selectedTrip.driver}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Dist. Remaining</span>
                  <span className="text-[11px] font-bold text-slate-700">{selectedTrip.distanceRemaining} miles</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => alert(`Full dispatch command telemetry for ${selectedTrip.id} opened.`)}
            className="w-full mt-4 py-2 bg-white hover:bg-slate-100/50 border border-border-gray text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm group"
          >
            <Info className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            <span>Open Command Terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
