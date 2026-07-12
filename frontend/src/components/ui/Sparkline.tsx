/** Minimal SVG sparkline (line + optional soft area). */
export const Sparkline: React.FC<{
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  area?: boolean;
}> = ({ data, color = '#2563EB', width = 96, height = 28, area = false }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 2 - ((v - min) / range) * (height - 6);
    return [x, y] as const;
  });
  const line = 'M ' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L ');
  const areaD = `${line} L ${width},${height} L 0,${height} Z`;
  const gid = `sl-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="select-none pointer-events-none">
      {area && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gid})`} />
        </>
      )}
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
