import React from 'react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = 'cyan'
}) => {
  const getAccentGradient = () => {
    switch (accentColor) {
      case 'cyan': return 'from-cyber-cyan to-blue-500 text-cyber-cyan';
      case 'emerald': return 'from-cyber-emerald to-teal-500 text-cyber-emerald';
      case 'amber': return 'from-cyber-amber to-orange-500 text-cyber-amber';
      case 'purple': return 'from-cyber-purple to-indigo-500 text-cyber-purple';
      default: return 'from-cyber-blue to-cyan-500 text-cyber-blue';
    }
  };

  return (
    <GlassCard glow={accentColor} className="p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white mt-1.5 tracking-tight font-mono">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-700/50 ${getAccentGradient()}`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={`flex items-center gap-1 font-semibold ${trend.isPositive ? 'text-cyber-emerald' : 'text-cyber-red'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
};
