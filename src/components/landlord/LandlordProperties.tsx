import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Property, PropertyStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';
import { 
  Building, 
  Plus, 
  Eye, 
  Users, 
  Sliders, 
  ExternalLink, 
  Edit, 
  CheckCircle, 
  MoreVertical, 
  TrendingUp, 
  Sparkles, 
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  KeyRound,
  Clock,
  ShieldAlert,
  Layers
} from 'lucide-react';

export const LandlordProperties: React.FC = () => {
  const { 
    properties, 
    landlordStats, 
    setIsWizardModalOpen, 
    setSelectedProperty, 
    updatePropertyStatus,
    setEditingProperty
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'TODOS'>('TODOS');
  const [animDirection, setAnimDirection] = useState<'left' | 'right' | null>(null);

  // Swipe / Drag Gesture State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filterOptions = [
    {
      id: 'TODOS' as const,
      label: 'Todos os Imóveis',
      count: properties.length,
      theme: {
        glow: 'shadow-[0_0_25px_rgba(0,242,254,0.25)]',
        border: 'border-cyan-500/40 hover:border-cyan-400',
        bg: 'bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-blue-950/40',
        dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(0,242,254,0.9)]',
        text: 'text-cyan-300',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        activeDot: 'bg-cyan-400 shadow-[0_0_8px_rgba(0,242,254,0.9)]'
      }
    },
    {
      id: 'DISPONÍVEL' as const,
      label: 'Disponíveis',
      count: properties.filter(p => p.status === 'DISPONÍVEL').length,
      theme: {
        glow: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]',
        border: 'border-emerald-500/40 hover:border-emerald-400',
        bg: 'bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-950/90',
        dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]',
        text: 'text-emerald-300',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        activeDot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
      }
    },
    {
      id: 'ALUGADO' as const,
      label: 'Alugados',
      count: properties.filter(p => p.status === 'ALUGADO').length,
      theme: {
        glow: 'shadow-[0_0_25px_rgba(59,130,246,0.25)]',
        border: 'border-blue-500/40 hover:border-blue-400',
        bg: 'bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-indigo-950/40',
        dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]',
        text: 'text-blue-300',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        activeDot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]'
      }
    },
    {
      id: 'EM NEGOCIAÇÃO' as const,
      label: 'Em Negociação',
      count: properties.filter(p => p.status === 'EM NEGOCIAÇÃO').length,
      theme: {
        glow: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]',
        border: 'border-purple-500/40 hover:border-purple-400',
        bg: 'bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-pink-950/40',
        dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.9)]',
        text: 'text-purple-300',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        activeDot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.9)]'
      }
    },
    {
      id: 'RESERVADO' as const,
      label: 'Reservados',
      count: properties.filter(p => p.status === 'RESERVADO').length,
      theme: {
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
        border: 'border-amber-500/40 hover:border-amber-400',
        bg: 'bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-orange-950/40',
        dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]',
        text: 'text-amber-300',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        activeDot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
      }
    }
  ];

  const currentIndex = filterOptions.findIndex(f => f.id === statusFilter);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const currentOpt = filterOptions[activeIndex];
  const Icon = currentOpt.icon;

  const navigateFilter = (direction: 'next' | 'prev') => {
    setAnimDirection(direction === 'next' ? 'right' : 'left');
    const newIndex = direction === 'next' 
      ? (activeIndex + 1) % filterOptions.length
      : (activeIndex - 1 + filterOptions.length) % filterOptions.length;
    
    setStatusFilter(filterOptions[newIndex].id);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 40) {
      navigateFilter('prev');
    } else if (diff < -40) {
      navigateFilter('next');
    }
    setTouchStartX(null);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || mouseStartX === null) return;
    const diff = e.clientX - mouseStartX;
    if (diff > 40) {
      navigateFilter('prev');
    } else if (diff < -40) {
      navigateFilter('next');
    }
    setIsDragging(false);
    setMouseStartX(null);
  };

  const filtered = properties.filter(p => statusFilter === 'TODOS' ? true : p.status === statusFilter);

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full no-scrollbar pb-20 md:pb-8">
      {/* Cockpit Banner Header & Compact Futuristic Metrics HUD Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c162d]/95 via-[#081022]/98 to-[#050a17]/99 border border-cyan-500/30 p-3 sm:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl group">
        {/* Cyber Neon Ambient Glow in Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10 group-hover:bg-cyan-500/15 transition-all duration-700" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Title, Tag & Telemetry */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/25 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.25)] shrink-0">
                <Building className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                  Meus Imóveis
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-mono text-[10.5px] font-bold shadow-[0_0_8px_rgba(0,242,254,0.15)]">
                  {landlordStats.totalProperties} unidades
                </span>
              </div>
            </div>

            {/* Futuristic Telemetry Status Pills Grid (Compact) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Disponíveis */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.06)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse shrink-0" />
                <div className="min-w-0 flex items-baseline gap-1.5">
                  <p className="text-xs sm:text-sm font-bold font-mono text-emerald-300 leading-none">
                    {landlordStats.availableCount}
                  </p>
                  <p className="text-[9.5px] font-mono text-emerald-400/80 truncate">
                    Disponíveis
                  </p>
                </div>
              </div>

              {/* Alugados / Ocupados */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-blue-950/40 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.06)]">
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.9)] shrink-0" />
                <div className="min-w-0 flex items-baseline gap-1.5">
                  <p className="text-xs sm:text-sm font-bold font-mono text-blue-300 leading-none">
                    {landlordStats.rentedCount}
                  </p>
                  <p className="text-[9.5px] font-mono text-blue-400/80 truncate">
                    Alugados
                  </p>
                </div>
              </div>

              {/* Em Negociação */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.06)]">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.9)] shrink-0" />
                <div className="min-w-0 flex items-baseline gap-1.5">
                  <p className="text-xs sm:text-sm font-bold font-mono text-purple-300 leading-none">
                    {landlordStats.negotiatingCount}
                  </p>
                  <p className="text-[9.5px] font-mono text-purple-400/80 truncate">
                    Negociação
                  </p>
                </div>
              </div>

              {/* Taxa de Ocupação */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.06)]">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <div className="min-w-0 flex items-baseline gap-1.5">
                  <p className="text-xs sm:text-sm font-bold font-mono text-cyan-300 leading-none">
                    {landlordStats.occupancyRate}%
                  </p>
                  <p className="text-[9.5px] font-mono text-cyan-400/80 truncate">
                    Ocupação
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Button */}
          <div className="flex md:justify-end shrink-0">
            <button
              onClick={() => setIsWizardModalOpen(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_18px_rgba(0,242,254,0.3)] hover:shadow-[0_0_25px_rgba(0,242,254,0.45)] transform active:scale-95 transition-all cursor-pointer group/btn"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3] group-hover/btn:rotate-90 transition-transform duration-200" />
              <span>Cadastrar Novo Imóvel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Minimalist Single-Option Swipeable Filter Dial */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className={`relative overflow-hidden rounded-2xl border ${currentOpt.theme.border} ${currentOpt.theme.bg} ${currentOpt.theme.glow} py-2 px-3 transition-all duration-300 select-none cursor-grab active:cursor-grabbing backdrop-blur-xl group`}
      >
        {/* Discreet Left Navigation Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigateFilter('prev');
          }}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-xl bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800/60 hover:border-cyan-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer group/arrow"
          title="Filtro anterior"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover/arrow:text-cyan-300 group-hover/arrow:-translate-x-0.5 transition-transform" />
        </button>

        {/* Center: Filter Name + Small Count & Active Indicator */}
        <div className="flex flex-col items-center justify-center text-center px-10 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${currentOpt.theme.dot} animate-pulse`} />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-sans">
              {currentOpt.label}
            </h2>
            <span className={`px-2 py-0.2 rounded-md text-xs font-mono font-bold ${currentOpt.theme.badge}`}>
              {currentOpt.count}
            </span>
          </div>

          {/* Small Bottom Indicative Bar / Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            {filterOptions.map((opt, idx) => (
              <button
                key={opt.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusFilter(opt.id);
                }}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeIndex
                    ? `w-5 ${opt.theme.activeDot}`
                    : 'w-1.5 bg-slate-700/50 hover:bg-slate-500'
                }`}
                title={opt.label}
              />
            ))}
          </div>
        </div>

        {/* Discreet Right Navigation Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigateFilter('next');
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-xl bg-slate-950/40 hover:bg-slate-900/80 border border-slate-800/60 hover:border-cyan-500/40 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer group/arrow"
          title="Próximo filtro"
        >
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover/arrow:text-cyan-300 group-hover/arrow:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Properties Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#081022]/60 p-8 space-y-3">
          <Building className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhum imóvel encontrado neste filtro</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não há imóveis com o status <strong className="text-cyan-400">{currentOpt.label}</strong> no momento.
          </p>
          <button
            onClick={() => setStatusFilter('TODOS')}
            className="mt-2 py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold font-mono transition-all"
          >
            Ver Todos os Imóveis ({properties.length})
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((prop) => (
            <GlassCard key={prop.id} glow="none" className="flex flex-col justify-between group">
              {/* Image & Status */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge status={prop.status} size="sm" />
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-cyber-cyan">
                    {prop.neighborhood} • {prop.city}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-1 mt-0.5">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {prop.area}m² • {prop.bedrooms} quartos • {prop.parkingSpaces} vagas
                  </p>
                </div>

                {/* Price & Telemetry */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500">Aluguel</span>
                    <p className="font-extrabold text-white">
                      R$ {prop.rentPrice.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1" title="Visualizações">
                      <Eye className="w-3.5 h-3.5 text-cyber-cyan" />
                      {prop.viewsCount}
                    </span>
                    <span className="flex items-center gap-1" title="Interessados">
                      <Users className="w-3.5 h-3.5 text-cyber-emerald" />
                      {prop.contactCount}
                    </span>
                  </div>
                </div>

                {/* Status Quick Changer according to PRD #9 */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Alterar Status do Imóvel:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => updatePropertyStatus(prop.id, 'DISPONÍVEL')}
                      className={`py-1 px-2 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                        prop.status === 'DISPONÍVEL' 
                          ? 'bg-emerald-500/20 text-cyber-emerald border-emerald-500/50' 
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      DISPONÍVEL
                    </button>
                    <button
                      onClick={() => updatePropertyStatus(prop.id, 'ALUGADO')}
                      className={`py-1 px-2 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                        prop.status === 'ALUGADO' 
                          ? 'bg-red-500/20 text-cyber-red border-red-500/50' 
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      ALUGADO
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2.5">
                  <button
                    onClick={() => setEditingProperty(prop)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-slate-900/90 to-slate-800/90 hover:from-cyan-950/50 hover:to-blue-950/50 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-[0_0_15px_rgba(0,242,254,0.2)] active:scale-95 group/edit cursor-pointer"
                    title="Editar dados e fotos do imóvel"
                  >
                    <Edit className="w-3.5 h-3.5 text-cyan-400 group-hover/edit:scale-110 transition-transform" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => setSelectedProperty(prop)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,242,254,0.25)] hover:shadow-[0_0_25px_rgba(0,242,254,0.45)] active:scale-95 group/view cursor-pointer"
                    title="Abrir ficha completa do imóvel"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-950 group-hover/view:translate-x-0.5 group-hover/view:-translate-y-0.5 transition-transform stroke-[2.5]" />
                    <span>Ver Detalhes</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
