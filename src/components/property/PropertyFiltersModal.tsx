import React from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyType, PropertyStatus } from '../../types';
import { X, RotateCcw, Check } from 'lucide-react';

const PROPERTY_TYPES: (PropertyType | 'TODOS')[] = [
  'TODOS',
  'APARTAMENTO',
  'CASA',
  'KITNET',
  'SOBRADO',
  'COMERCIAL',
  'SÍTIO',
  'CHÁCARA',
  'OUTROS'
];

const PROPERTY_STATUSES: (PropertyStatus | 'TODOS')[] = [
  'TODOS',
  'DISPONÍVEL',
  'RESERVADO',
  'EM NEGOCIAÇÃO',
  'ALUGADO'
];

export const PropertyFiltersModal: React.FC = () => {
  const { 
    isFilterModalOpen, 
    setIsFilterModalOpen, 
    filterState, 
    setFilterState, 
    resetFilters,
    filteredProperties 
  } = useApp();

  if (!isFilterModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="w-full max-w-xl max-h-[90vh] bg-cyber-darkest border border-slate-800 rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between glass-panel">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <span>FILTROS AVANÇADOS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30">
                {filteredProperties.length} encontrados
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors border border-slate-800"
              title="Limpar todos os filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Body */}
        <div className="p-5 space-y-5 overflow-y-auto no-scrollbar flex-1 text-xs">
          {/* Property Type Pills */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
              Tipo do Imóvel
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterState(prev => ({ ...prev, propertyType: type }))}
                  className={`px-3 py-1.5 rounded-xl border font-mono font-medium transition-all ${
                    filterState.propertyType === type
                      ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan shadow-neon-cyan font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
              Status da Locação
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_STATUSES.map(status => (
                <button
                  key={status}
                  onClick={() => setFilterState(prev => ({ ...prev, status }))}
                  className={`px-3 py-1.5 rounded-xl border font-mono font-medium transition-all ${
                    filterState.status === status
                      ? 'bg-blue-600/30 text-blue-400 border-blue-500 shadow-neon-blue font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between font-mono">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Faixa de Aluguel Máximo
              </label>
              <span className="text-sm font-extrabold text-cyber-emerald">
                Até R$ {filterState.maxPrice.toLocaleString('pt-BR')}/mês
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="25000"
              step="500"
              value={filterState.maxPrice}
              onChange={(e) => setFilterState(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>R$ 1.000</span>
              <span>R$ 12.000</span>
              <span>R$ 25.000+</span>
            </div>
          </div>

          {/* Bedrooms & Parking Spaces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                Quartos (Mínimo)
              </label>
              <div className="flex gap-1">
                {(['ANY', 1, 2, 3, 4] as const).map(num => (
                  <button
                    key={String(num)}
                    onClick={() => setFilterState(prev => ({ ...prev, bedrooms: num }))}
                    className={`flex-1 py-1.5 rounded-xl border font-mono font-medium transition-all ${
                      filterState.bedrooms === num
                        ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {num === 'ANY' ? 'Todos' : `${num}+`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                Vagas de Garagem
              </label>
              <div className="flex gap-1">
                {(['ANY', 1, 2, 3] as const).map(num => (
                  <button
                    key={String(num)}
                    onClick={() => setFilterState(prev => ({ ...prev, parkingSpaces: num }))}
                    className={`flex-1 py-1.5 rounded-xl border font-mono font-medium transition-all ${
                      filterState.parkingSpaces === num
                        ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan font-bold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {num === 'ANY' ? 'Todas' : `${num}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Furnished & Pets Allowed Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setFilterState(prev => ({ 
                ...prev, 
                furnished: prev.furnished === true ? null : true 
              }))}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                filterState.furnished === true
                  ? 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <span>Apenas Mobiliados</span>
              {filterState.furnished === true && <Check className="w-4 h-4 text-cyber-cyan" />}
            </button>

            <button
              onClick={() => setFilterState(prev => ({ 
                ...prev, 
                petsAllowed: prev.petsAllowed === true ? null : true 
              }))}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                filterState.petsAllowed === true
                  ? 'bg-cyber-emerald/15 text-cyber-emerald border-cyber-emerald/50 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <span>Aceita Animais (Pets)</span>
              {filterState.petsAllowed === true && <Check className="w-4 h-4 text-cyber-emerald" />}
            </button>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
              Ordenar Resultados
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'RECENTES', label: 'Mais Recentes' },
                { id: 'MENOR_PRECO', label: 'Menor Preço' },
                { id: 'MAIOR_PRECO', label: 'Maior Preço' },
                { id: 'POPULARES', label: 'Mais Vistos' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterState(prev => ({ ...prev, sortBy: opt.id as any }))}
                  className={`py-2 px-2 rounded-xl border text-center font-mono transition-all ${
                    filterState.sortBy === opt.id
                      ? 'bg-slate-800 text-white border-cyber-cyan font-bold'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 glass-panel flex gap-3">
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase font-mono shadow-neon-cyan transition-all"
          >
            Aplicar Filtros ({filteredProperties.length} Imóveis)
          </button>
        </div>
      </div>
    </div>
  );
};
