import React, { useState } from 'react';
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
  MoreVertical
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

  const filtered = properties.filter(p => statusFilter === 'TODOS' ? true : p.status === statusFilter);

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full no-scrollbar pb-20 md:pb-8">
      {/* Header & Status Metrics Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-cyber-cyan" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
              MEUS IMÓVEIS ({landlordStats.totalProperties})
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono">
            <span className="text-cyber-emerald">🟢 {landlordStats.availableCount} Disponíveis</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyber-red">🔴 {landlordStats.rentedCount} Alugados</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyber-purple">🟣 {landlordStats.negotiatingCount} Negociação</span>
          </div>
        </div>

        <button
          onClick={() => setIsWizardModalOpen(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-neon-cyan transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Novo Imóvel</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {(['TODOS', 'DISPONÍVEL', 'ALUGADO', 'EM NEGOCIAÇÃO', 'RESERVADO'] as (PropertyStatus | 'TODOS')[]).map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl border transition-all ${
              statusFilter === st
                ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Properties Grid */}
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
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setEditingProperty(prop)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyber-cyan text-xs font-bold font-mono border border-cyber-cyan/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => setSelectedProperty(prop)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Detalhes</span>
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
