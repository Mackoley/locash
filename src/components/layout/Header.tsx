import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  User, 
  Key, 
  Heart,
  Plus,
  Loader2,
  MapPin,
  Building,
  Navigation
} from 'lucide-react';

interface AddressSuggestion {
  id: string;
  name: string;
  subtext: string;
  lat: number;
  lng: number;
  isLocalProperty?: boolean;
}

export const Header: React.FC = () => {
  const { 
    userRole, 
    setUserRole, 
    filterState, 
    setFilterState, 
    favorites, 
    activeView,
    setActiveView,
    setIsWizardModalOpen,
    filteredProperties,
    properties,
    searchAddress,
    setSearchTarget,
    setIsAuthModalOpen
  } = useApp();

  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time debounced address autocomplete
  useEffect(() => {
    const query = filterState.search.trim();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSuggesting(true);
      const queryLower = query.toLowerCase();

      // 1. Match local properties and neighborhoods first
      const localMatches: AddressSuggestion[] = [];
      const seenNames = new Set<string>();

      properties.forEach(p => {
        const titleMatch = p.title.toLowerCase().includes(queryLower);
        const neighborhoodMatch = p.neighborhood.toLowerCase().includes(queryLower);
        const addressMatch = p.publicAddress.toLowerCase().includes(queryLower);

        if ((titleMatch || neighborhoodMatch || addressMatch) && !seenNames.has(p.neighborhood)) {
          seenNames.add(p.neighborhood);
          localMatches.push({
            id: `local-${p.id}`,
            name: `${p.neighborhood}, ${p.city}`,
            subtext: `${p.title} • R$ ${p.rentPrice.toLocaleString('pt-BR')}/mês`,
            lat: p.latitude,
            lng: p.longitude,
            isLocalProperty: true
          });
        }
      });

      // 2. Fetch Nominatim Geocoding API suggestions for Brazil
      let apiMatches: AddressSuggestion[] = [];
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=4&addressdetails=1`,
          { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } }
        );
        if (res.ok) {
          const data = await res.json();
          apiMatches = data.map((item: any) => {
            const parts = item.display_name.split(',');
            const mainName = parts[0]?.trim() || item.display_name;
            const sub = parts.slice(1, 4).join(',').trim();
            return {
              id: `geo-${item.place_id}`,
              name: mainName,
              subtext: sub || 'Brasil',
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              isLocalProperty: false
            };
          });
        }
      } catch (err) {
        console.warn('Erro na busca de sugestões geográficas:', err);
      }

      const combined = [...localMatches, ...apiMatches].slice(0, 5);
      setSuggestions(combined);
      setShowSuggestions(combined.length > 0);
      setIsSuggesting(false);
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filterState.search, properties]);

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setFilterState(prev => ({ ...prev, search: suggestion.name }));
    setShowSuggestions(false);
    
    if (activeView !== 'MAPA') {
      setActiveView('MAPA');
    }

    setSearchTarget({
      lat: suggestion.lat,
      lng: suggestion.lng,
      name: suggestion.name
    });
  };

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!filterState.search.trim()) return;

    setShowSuggestions(false);
    setIsSearching(true);
    if (activeView !== 'MAPA') {
      setActiveView('MAPA');
    }

    await searchAddress(filterState.search);
    setIsSearching(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-cyber-darkest/95 px-2 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3">
      {/* Brand & Logo (Icon Only for maximum search bar space) */}
      <div className="flex items-center shrink-0">
        <button 
          onClick={() => setActiveView('MAPA')}
          className="group focus:outline-none p-0.5"
          title="LOCASH Imobiliária - Ir para o Mapa"
        >
          <img 
            src="/logo.png" 
            alt="LOCASH" 
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_12px_rgba(0,242,254,0.5)] transform group-hover:scale-105 transition-transform duration-300 shrink-0" 
          />
        </button>
      </div>

      {/* Global Address Search Bar with Real-Time Suggestions Dropdown */}
      <div ref={searchContainerRef} className="flex-1 max-w-lg mx-1 sm:mx-3 min-w-0 relative">
        <form onSubmit={handleSearchSubmit} className="relative group flex items-center">
          <input
            type="text"
            placeholder="Buscar rua, bairro ou cidade..."
            value={filterState.search}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
            className="w-full bg-slate-900/90 text-xs sm:text-sm text-slate-100 placeholder-slate-400 pl-3 sm:pl-3.5 pr-9 sm:pr-10 py-1.5 sm:py-2 rounded-xl border border-slate-700/70 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all font-sans shadow-inner"
          />
          <div className="absolute inset-y-1 right-1 flex items-center">
            <button
              type="submit"
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-neon-cyan transition-all transform active:scale-95 shrink-0"
              title="Buscar no mapa (ou pressione Enter)"
            >
              {isSearching || isSuggesting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
              ) : (
                <Search className="w-3.5 h-3.5 text-slate-950 stroke-[2.8]" />
              )}
            </button>
          </div>
        </form>

        {/* Real-time Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 glass-panel border border-cyan-500/40 rounded-2xl bg-slate-950/98 shadow-[0_10px_35px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-fade-in backdrop-blur-2xl">
            <div className="p-1.5 flex items-center justify-between border-b border-slate-800/80 px-3 bg-slate-900/40">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Navigation className="w-3 h-3 text-cyber-cyan" />
                Sugestões de Endereço
              </span>
              <span className="text-[9px] font-mono text-cyber-cyan font-bold">
                {suggestions.length} ENCONTRADOS
              </span>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto no-scrollbar">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full px-3.5 py-2.5 text-left flex items-center gap-3 hover:bg-cyan-500/10 transition-colors group cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                    item.isLocalProperty 
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-cyber-emerald shadow-sm' 
                      : 'bg-cyan-500/15 border-cyan-500/30 text-cyber-cyan shadow-sm'
                  }`}>
                    {item.isLocalProperty ? (
                      <Building className="w-3.5 h-3.5" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-cyber-cyan transition-colors truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                      {item.subtext}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-cyber-cyan transition-colors shrink-0 font-mono">
                    Ir ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        {/* Landlord Add Property Button */}
        {userRole === 'LANDLORD' && (
          <button
            onClick={() => setIsWizardModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-neon-cyan transition-all transform active:scale-95 shrink-0"
            title="Cadastrar Novo Imóvel"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden md:inline">Anunciar</span>
          </button>
        )}

        {/* Favorites Counter Shortcut */}
        {userRole === 'TENANT' && (
          <button
            onClick={() => setActiveView('FAVORITOS')}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all relative shrink-0 ${
              activeView === 'FAVORITOS' 
                ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm' 
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-red-400'
            }`}
            title="Meus Favoritos"
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={favorites.length > 0 ? "currentColor" : "none"} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-extrabold flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
        )}

        {/* Role Switcher Pill */}
        <div className="flex items-center bg-slate-950 p-0.5 sm:p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => {
              setUserRole('TENANT');
              if (activeView === 'DASHBOARD_LOCADOR' || activeView === 'MEUS_IMOVEIS') {
                setActiveView('MAPA');
              }
            }}
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              userRole === 'TENANT'
                ? 'bg-gradient-to-r from-blue-600/40 to-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Modo Locatário"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Locatário</span>
          </button>
          
          <button
            onClick={() => {
              setUserRole('LANDLORD');
              setActiveView('DASHBOARD_LOCADOR');
            }}
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              userRole === 'LANDLORD'
                ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/30 text-cyber-purple border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Modo Locador"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Locador</span>
          </button>
        </div>

        {/* Auth / Login Modal Trigger Button */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-500/20 hover:from-blue-600/40 hover:to-cyan-500/40 border border-cyan-500/40 text-cyber-cyan hover:text-white transition-all flex items-center gap-1 shadow-sm shrink-0 group"
          title="Fazer Login ou Criar Conta"
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold font-mono hidden md:inline">Entrar</span>
        </button>
      </div>
    </header>
  );
};
