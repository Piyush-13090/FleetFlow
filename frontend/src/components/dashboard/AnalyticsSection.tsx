import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Maximize2, 
  BarChart, 
  PieChart 
} from 'lucide-react';

interface AnalyticsSectionProps {
  onShowToast: (msg: string) => void;
}

// Chart dataset ranges
const datasetOptions = {
  '7D': [
    { label: 'Mon', value: 78 },
    { label: 'Tue', value: 82 },
    { label: 'Wed', value: 85 },
    { label: 'Thu', value: 80 },
    { label: 'Fri', value: 84 },
    { label: 'Sat', value: 72 },
    { label: 'Sun', value: 79 },
  ],
  '30D': [
    { label: 'W1', value: 75 },
    { label: 'W2', value: 81 },
    { label: 'W3', value: 84 },
    { label: 'W4', value: 88 },
  ],
  '3M': [
    { label: 'Apr', value: 76 },
    { label: 'May', value: 83 },
    { label: 'Jun', value: 86 },
  ]
};

type DatasetKey = keyof typeof datasetOptions;

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ onShowToast }) => {
  const [zoomRange, setZoomRange] = useState<DatasetKey>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredDonutIdx, setHoveredDonutIdx] = useState<number | null>(null);

  const activeData = datasetOptions[zoomRange];

  // Area Chart Dimensions
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Max value for Y scale
  const maxY = 100;
  const minY = 50; // starts at 50 to emphasize trend variations

  // Get point coordinates
  const points = activeData.map((d, i) => {
    const x = paddingX + (i / (activeData.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d.value - minY) / (maxY - minY)) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  // SVG Area path generator
  let linePath = '';
  let areaPath = '';
  if (points.length > 0) {
    // Generate smooth line path
    linePath = `M ${points[0].x},${points[0].y} `;
    for (let i = 1; i < points.length; i++) {
      // Bezier curve calculations for smooth line
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      linePath += `C ${cpX1},${cpY1} ${cpX2},${cpY2} ${points[i].x},${points[i].y} `;
    }

    // Connect to bottom coordinates for Area fill
    areaPath = `${linePath} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;
  }

  // Donut Chart Calculations
  const donutSegments = [
    { label: 'Available', value: 98, percentage: 55, color: '#22C55E' },
    { label: 'On Trip', value: 42, percentage: 30, color: '#2563EB' },
    { label: 'In Shop', value: 17, percentage: 12, color: '#EF4444' },
    { label: 'Retired', value: 5, percentage: 3, color: '#64748B' },
  ];

  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  
  let accumulatedPercentage = 0;

  const handleExport = (type: 'CSV' | 'PNG') => {
    onShowToast(`Exporting Fleet Utilization as ${type}...`);
    setTimeout(() => {
      onShowToast(`Success! Fleet-Utilization-Report.${type.toLowerCase()} downloaded.`);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none mt-6">
      {/* 2-Column Area Chart */}
      <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-primary">
                <BarChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-dark">Fleet Utilization Trend</h3>
                <p className="text-[10px] text-slate-500 font-medium">Real-time daily resource activity</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Zoom Buttons */}
              <div className="flex bg-slate-50 p-1 border border-border-gray rounded-xl">
                {(['7D', '30D', '3M'] as DatasetKey[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setZoomRange(range);
                      setHoveredIndex(null);
                    }}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                      zoomRange === range ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-1.5">
                <button
                  onClick={() => handleExport('CSV')}
                  className="p-1.5 border border-border-gray hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Export CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onShowToast('Visual scale expanded to fullscreen')}
                  className="p-1.5 border border-border-gray hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Expand Visual View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Interactive Chart Canvas */}
        <div className="relative w-full h-[240px] flex items-center justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="chartGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[50, 60, 70, 80, 90, 100].map((gridVal, i) => {
              const yVal = paddingY + chartHeight - ((gridVal - minY) / (maxY - minY)) * chartHeight;
              return (
                <g key={i}>
                  <line 
                    x1={paddingX} 
                    y1={yVal} 
                    x2={width - paddingX} 
                    y2={yVal} 
                    stroke="#F1F5F9" 
                    strokeWidth="1.25" 
                  />
                  <text 
                    x={paddingX - 10} 
                    y={yVal + 3} 
                    textAnchor="end" 
                    className="fill-slate-400 font-mono text-[9px] font-semibold"
                  >
                    {gridVal}%
                  </text>
                </g>
              );
            })}

            {/* SVG Paths */}
            {points.length > 0 && (
              <>
                {/* Area Gradient */}
                <motion.path 
                  d={areaPath} 
                  fill="url(#chartGlowGrad)" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
                
                {/* Bezier Line */}
                <motion.path 
                  d={linePath} 
                  fill="none" 
                  stroke="#2563EB" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />

                {/* Point Nodes */}
                {points.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === i ? 6 : 4}
                    fill={hoveredIndex === i ? '#FFFFFF' : '#2563EB'}
                    stroke={hoveredIndex === i ? '#2563EB' : '#FFFFFF'}
                    strokeWidth="2"
                    className="transition-all duration-150 cursor-pointer"
                  />
                ))}

                {/* Hover Guide lines */}
                {hoveredIndex !== null && (
                  <line
                    x1={points[hoveredIndex].x}
                    y1={paddingY}
                    x2={points[hoveredIndex].x}
                    y2={height - paddingY}
                    stroke="#3B82F6"
                    strokeWidth="1.25"
                    strokeDasharray="4 4"
                    className="pointer-events-none"
                  />
                )}
              </>
            )}

            {/* Bottom Labels */}
            {points.map((pt, i) => (
              <text
                key={i}
                x={pt.x}
                y={height - paddingY + 16}
                textAnchor="middle"
                className="fill-slate-500 font-semibold text-[9.5px]"
              >
                {pt.label}
              </text>
            ))}

            {/* Interactive Vertical Hotspot Slices */}
            {points.map((pt, i) => {
              const rectWidth = chartWidth / (points.length - 1);
              const rectX = pt.x - rectWidth / 2;
              return (
                <rect
                  key={i}
                  x={rectX}
                  y={paddingY}
                  width={rectWidth}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Interactive HTML Tooltip inside SVG wrapper */}
          <AnimatePresence>
            {hoveredIndex !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bg-text-dark/95 backdrop-blur-md text-white p-3 rounded-xl shadow-lg border border-slate-700 pointer-events-none text-left z-20 flex flex-col"
                style={{
                  left: `${points[hoveredIndex].x - 50}px`,
                  top: `${points[hoveredIndex].y - 70}px`,
                }}
              >
                <span className="text-[9px] uppercase font-bold text-slate-400 leading-none">{points[hoveredIndex].label} Timeline</span>
                <span className="text-sm font-black mt-1 leading-none text-blue-300">
                  {points[hoveredIndex].value}%
                </span>
                <span className="text-[9px] font-semibold text-slate-300 mt-1">Utilization Index</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 1-Column Donut Chart */}
      <div className="bg-white border border-border-gray p-5 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 rounded-lg bg-blue-50 text-primary">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-dark">Vehicle Status</h3>
              <p className="text-[10px] text-slate-500 font-medium">Distribution of fleet assets</p>
            </div>
          </div>
        </div>

        {/* Donut SVG Rendering */}
        <div className="relative w-full h-[180px] flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90 overflow-visible">
            {donutSegments.map((seg, idx) => {
              const strokeDashoffset = donutCircumference - (seg.percentage / 100) * donutCircumference;
              const rotation = (accumulatedPercentage / 100) * 360;
              accumulatedPercentage += seg.percentage;

              const isHovered = hoveredDonutIdx === idx;

              return (
                <motion.circle
                  key={idx}
                  cx="80"
                  cy="80"
                  r={donutRadius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? 12 : 9}
                  strokeDasharray={donutCircumference}
                  initial={{ strokeDashoffset: donutCircumference }}
                  animate={{ 
                    strokeDashoffset,
                    strokeWidth: isHovered ? 12 : 9
                  }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                  style={{
                    transformOrigin: '80px 80px',
                    transform: `rotate(${rotation}deg)`,
                  }}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredDonutIdx(idx)}
                  onMouseLeave={() => setHoveredDonutIdx(null)}
                />
              );
            })}
          </svg>

          {/* Text labels at the center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hoveredDonutIdx !== null ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {donutSegments[hoveredDonutIdx].label}
                </span>
                <span className="text-lg font-black text-text-dark">
                  {donutSegments[hoveredDonutIdx].percentage}%
                </span>
                <span className="text-[9px] font-semibold text-slate-500">
                  {donutSegments[hoveredDonutIdx].value} Assets
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Fleet
                </span>
                <span className="text-xl font-black text-text-dark">
                  162
                </span>
                <span className="text-[9px] font-semibold text-primary">
                  100% Active
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border-gray/50">
          {donutSegments.map((seg, idx) => (
            <div 
              key={idx} 
              className={`flex items-center space-x-2 p-1.5 rounded-xl transition-colors cursor-pointer ${
                hoveredDonutIdx === idx ? 'bg-slate-50/80 font-bold' : ''
              }`}
              onMouseEnter={() => setHoveredDonutIdx(idx)}
              onMouseLeave={() => setHoveredDonutIdx(null)}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold text-text-dark truncate leading-none">{seg.label}</div>
                <span className="text-[9px] text-slate-400 block mt-0.5">{seg.value} Vehicles ({seg.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
