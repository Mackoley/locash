import React from 'react';

interface GaugeChartProps {
  value: number; // 0 to 100
  title: string;
  subtitle?: string;
  size?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  title,
  subtitle = 'Taxa Global',
  size = 180
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Arc is 240 degrees (semi-open circle like in the cockpit reference photo)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(Math.max(value, 0), 100)) / 100;

  return (
    <div className="flex flex-col items-center justify-center p-3 relative">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform rotate-[135deg]"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          
          {/* Active Gradient Meter */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00f2fe" />
              <stop offset="50%" stop-color="#3b82f6" />
              <stop offset="100%" stop-color="#00f0aa" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#00f2fe" flood-opacity="0.8"/>
            </filter>
          </defs>
          
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Gauge Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-3xl font-extrabold text-white tracking-tighter font-mono flex items-baseline">
            {value}
            <span className="text-sm font-semibold text-cyber-cyan ml-0.5">%</span>
          </span>
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-medium mt-0.5">
            {subtitle}
          </span>
        </div>
      </div>
      
      <p className="text-xs font-semibold text-slate-300 tracking-wide mt-1 uppercase text-center">
        {title}
      </p>
    </div>
  );
};
