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
      <div className="glass-panel p-5 rounded-3xl border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {onlyFavorites ? (
              <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            ) : (
              <Compass className="w-5 h-5 text-cyber-cyan" />
            )}
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
              {onlyFavorites ? `MEUS FAVORITOS (${list.length})` : `CATÁLOGO DE IMÓVEIS (${list.length})`}
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {onlyFavorites 
              ? 'Imóveis salvos para acompanhamento e agendamento de visitas' 
              : 'Explore oportunidades residenciais e comerciais com filtros avançados'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!onlyFavorites && (
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold font-mono border border-slate-800 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyber-cyan" />
              <span>Filtrar</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('MAPA')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyber-cyan/20 hover:bg-cyber-cyan/30 text-cyber-cyan text-xs font-bold font-mono border border-cyber-cyan/40 transition-colors shadow-sm"
          >
            <Map className="w-4 h-4" />
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
