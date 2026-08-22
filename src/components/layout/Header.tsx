import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  SlidersHorizontal, 
  Layers, 
  Flame, 
  Sparkles, 
  User, 
  Building2, 
  Key, 
  Heart,
  Plus,
  Loader2
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    userRole, 
    setUserRole, 
    filterState, 
    setFilterState, 
    setIsFilterModalOpen, 
    favorites, 
    mapVisualMode, 
    setMapVisualMode,
    activeView,
    setActiveView,
    setIsWizardModalOpen,
    filteredProperties,
    searchAddress
  } = useApp();

  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!filterState.search.trim()) return;

    setIsSearching(true);
    if (activeView !== 'MAPA') {
      setActiveView('MAPA');
    }

    const found = await searchAddress(filterState.search);
    setIsSearching(false);

    if (!found) {
      // Still filters local properties if geocoding returns no specific city/street match
      console.log('Filtro textual aplicado aos imóveis cadastrados.');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-cyber-darkest/90 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setActiveView('MAPA')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <img 
            src="/logo.png" 
            alt="LOCASH" 
            className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(0,242,254,0.4)] transform group-hover:scale-105 transition-transform duration-300 shrink-0" 
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white font-mono flex items-center">
                LOCA<span className="text-cyber-cyan">SH</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 uppercase tracking-widest">
                IMOBILIÁRIA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              {filteredProperties.length} IMÓVEIS MAPEADOS
            </p>
          </div>
        </button>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-2 hidden md:block">
        <div className="relative group">
          <input
            type="text"
            placeholder="Buscar localização..."
            value={filterState.search}
            onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
            className="w-full bg-slate-900/85 text-sm text-slate-200 placeholder-slate-500 pl-4 pr-24 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all font-sans"
          />
          <div className="absolute inset-y-1 right-1 flex items-center gap-1.5">
            <button
              type="submit"
              className="px-3 py-1.5 flex items-center justify-center rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-neon-cyan transition-all transform active:scale-95 group"
              title="Buscar no mapa (ou pressione Enter)"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Search className="w-4 h-4 text-slate-950 stroke-[2.8]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Filtros avançados"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyber-cyan" />
            </button>
          </div>
        </div>
      </form>

      {/* Action Controls & Layer Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Map Layers Mode Pill (When on Map view) */}
        {activeView === 'MAPA' && (
          <div className="hidden lg:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMapVisualMode('NORMAL')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                mapVisualMode === 'NORMAL' 
                  ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold border border-cyber-cyan/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Visão Padrão"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mapa</span>
            </button>
            <button
              onClick={() => setMapVisualMode('BEAMS_3D')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                mapVisualMode === 'BEAMS_3D' 
                  ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Feixes 3D nos Destaques"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Feixes 3D</span>
            </button>
            <button
              onClick={() => setMapVisualMode('HEATMAP')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                mapVisualMode === 'HEATMAP' 
                  ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mapa de Calor de Demanda"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Heatmap</span>
            </button>
          </div>
        )}

        {/* Landlord Quick Add Property Button */}
        {userRole === 'LANDLORD' && (
          <button
            onClick={() => setIsWizardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-neon-cyan transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Anunciar Imóvel</span>
          </button>
        )}

        {/* Favorites button for Tenant */}
        {userRole === 'TENANT' && (
          <button
            onClick={() => setActiveView('FAVORITOS')}
            className={`relative p-2 rounded-xl border transition-all ${
              activeView === 'FAVORITOS' 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-red-400'
            }`}
            title="Meus Favoritos"
          >
            <Heart className="w-4 h-4" fill={favorites.length > 0 ? "currentColor" : "none"} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
        )}

        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyber-cyan"
          title="Abrir Filtros"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Role Switcher Pill */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setUserRole('TENANT');
              if (activeView === 'DASHBOARD_LOCADOR' || activeView === 'MEUS_IMOVEIS') {
                setActiveView('MAPA');
              }
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              userRole === 'TENANT'
                ? 'bg-gradient-to-r from-blue-600/40 to-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Locatário</span>
          </button>
          
          <button
            onClick={() => {
              setUserRole('LANDLORD');
              setActiveView('DASHBOARD_LOCADOR');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              userRole === 'LANDLORD'
                ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/30 text-cyber-purple border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Locador</span>
          </button>
        </div>
      </div>
    </header>
  );
};
