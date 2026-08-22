import React from 'react';
import { PropertyStatus } from '../../types';

interface BadgeProps {
  status: PropertyStatus | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', size = 'md' }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'DISPONÍVEL':
        return 'bg-emerald-500/15 text-cyber-emerald border-emerald-500/40 shadow-[0_0_10px_rgba(0,240,170,0.25)]';
      case 'RESERVADO':
        return 'bg-amber-500/15 text-cyber-amber border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]';
      case 'EM NEGOCIAÇÃO':
        return 'bg-purple-500/15 text-cyber-purple border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.25)]';
      case 'ALUGADO':
        return 'bg-red-500/15 text-cyber-red border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.25)]';
      case 'PAGO':
      case 'RESOLVIDA':
      case 'ACTIVE':
        return 'bg-emerald-500/15 text-cyber-emerald border-emerald-500/40';
      case 'PENDENTE':
      case 'EM ANDAMENTO':
      case 'EM ANÁLISE':
        return 'bg-amber-500/15 text-cyber-amber border-amber-500/40';
      case 'ATRASADO':
      case 'URGENTE':
      case 'ALTA':
        return 'bg-red-500/15 text-cyber-red border-red-500/40';
      case 'ABERTA':
      case 'APROVADA':
        return 'bg-cyan-500/15 text-cyber-cyan border-cyan-500/40';
      default:
        return 'bg-slate-800/60 text-slate-300 border-slate-700';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'DISPONÍVEL': return 'bg-cyber-emerald shadow-[0_0_6px_#00f0aa]';
      case 'RESERVADO': return 'bg-cyber-amber shadow-[0_0_6px_#f59e0b]';
      case 'EM NEGOCIAÇÃO': return 'bg-cyber-purple shadow-[0_0_6px_#a855f7]';
      case 'ALUGADO': return 'bg-cyber-red shadow-[0_0_6px_#ef4444]';
      case 'PAGO':
      case 'RESOLVIDA':
      case 'ACTIVE':
        return 'bg-cyber-emerald';
      case 'PENDENTE':
      case 'EM ANDAMENTO':
      case 'EM ANÁLISE':
        return 'bg-cyber-amber';
      default:
        return 'bg-cyber-cyan';
    }
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wider'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md uppercase transition-all duration-200 ${sizeClasses[size]} ${getStatusStyles()} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${getDotColor()}`} />
      {status}
    </span>
  );
};
