import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'purple' | 'none';
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
  hoverEffect = false
}) => {
  const getGlowStyles = () => {
    switch (glow) {
      case 'cyan':
        return 'border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(0,242,254,0.12)]';
      case 'blue':
        return 'border-blue-500/30 hover:border-blue-400/60 shadow-[0_0_20px_rgba(30,136,229,0.12)]';
      case 'emerald':
        return 'border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_20px_rgba(0,240,170,0.12)]';
      case 'amber':
        return 'border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.12)]';
      case 'purple':
        return 'border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.12)]';
      default:
        return 'border-slate-800/80 hover:border-slate-700/80';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl bg-cyber-card/85 backdrop-blur-xl border 
        transition-all duration-300
        ${getGlowStyles()}
        ${hoverEffect ? 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Subtle top subtle edge highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
