import React from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyCard } from './PropertyCard';
import { Compass, Heart, SlidersHorizontal, Map } from 'lucide-react';

interface PropertyExplorerListProps {
  onlyFavorites?: boolean;
}

export const PropertyExplorerList: React.FC<PropertyExplorerListProps> = ({ onlyFavorites = false }) => {
  const { filteredProperties, properties, favorites, setIsFilterModalOpen, setActiveView } = useApp();

  const list = onlyFavorites 
    ? properties.filter(p => favorites.includes(p.id))
    : filteredProperties;

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full no-scrollbar pb-20 md:pb-8">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800/80 bg-[#091022]/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyber-cyan border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)] shrink-0">
            {onlyFavorites ? (
              <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            ) : (
              <Compass className="w-5 h-5 text-cyber-cyan" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
                {onlyFavorites ? 'MEUS FAVORITOS' : 'CATÁLOGO DE IMÓVEIS'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                {list.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {onlyFavorites 
                ? 'Imóveis salvos para acompanhamento e agendamento de visitas' 
                : 'Explore oportunidades residenciais e comerciais com filtros avançados'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!onlyFavorites && (
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold font-mono border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyber-cyan" />
              <span>Filtrar</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('MAPA')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs font-mono shadow-sm hover:shadow-neon-cyan transition-all transform active:scale-95 cursor-pointer"
          >
            <Map className="w-4 h-4 stroke-[2.5]" />
            <span>Ver no Mapa</span>
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      {list.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center glass-panel rounded-3xl border-slate-800 space-y-3 font-mono">
          <p className="text-slate-400 text-sm">
            {onlyFavorites 
              ? 'Você ainda não favoritou nenhum imóvel.' 
              : 'Nenhum imóvel encontrado com os filtros selecionados.'}
          </p>
          <button
            onClick={() => setActiveView('MAPA')}
            className="px-5 py-2.5 rounded-xl bg-cyber-cyan text-slate-950 font-bold text-xs shadow-neon-cyan"
          >
            Voltar ao Mapa
          </button>
        </div>
      )}
    </div>
  );
};
