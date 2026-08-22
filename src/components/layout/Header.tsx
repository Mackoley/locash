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
  Navigation,
  X,
  Compass
} from 'lucide-react';

interface AddressSuggestion {
  id: string;
  name: string;
  subtext: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  isLocalProperty?: boolean;
}

// Haversine formula to compute geodesic distance in KM
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (distKm?: number): string | null => {
  if (distKm === undefined || isNaN(distKm)) return null;
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m de você`;
  }
  return `${distKm.toFixed(1)} km de você`;
};

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
    setIsAuthModalOpen,
    userLocation
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

  // Real-time debounced address autocomplete with GPS Proximity Rule
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

      // 1. Match local properties and calculate exact distance
      const localMatches: AddressSuggestion[] = [];
      const seenNames = new Set<string>();

      properties.forEach(p => {
        const titleMatch = p.title.toLowerCase().includes(queryLower);
        const neighborhoodMatch = p.neighborhood.toLowerCase().includes(queryLower);
        const addressMatch = p.publicAddress.toLowerCase().includes(queryLower);

        if ((titleMatch || neighborhoodMatch || addressMatch) && !seenNames.has(p.id)) {
          seenNames.add(p.id);
          const dist = userLocation 
            ? calculateDistanceKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude)
            : undefined;

          localMatches.push({
            id: `local-${p.id}`,
            name: `${p.publicAddress} - ${p.neighborhood}`,
            subtext: `${p.city} - ${p.state} • ${p.title} • R$ ${p.rentPrice.toLocaleString('pt-BR')}/mês`,
            lat: p.latitude,
            lng: p.longitude,
            distanceKm: dist,
            isLocalProperty: true
          });
        }
      });

      // 2. Fetch Nominatim Geocoding API with Proximity Viewbox biasing
      let apiMatches: AddressSuggestion[] = [];
      try {
        const viewboxParam = userLocation
          ? `&viewbox=${userLocation.lng - 0.9},${userLocation.lat + 0.9},${userLocation.lng + 0.9},${userLocation.lat - 0.9}&bounded=0`
          : '';

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=7&addressdetails=1${viewboxParam}`,
          { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } }
        );

        if (res.ok) {
          const data = await res.json();
          apiMatches = data.map((item: any) => {
            const addr = item.address || {};
            const road = addr.road || addr.street || addr.pedestrian || addr.footway || addr.avenue || '';
            const houseNum = addr.house_number ? `, nº ${addr.house_number}` : '';
            const district = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || '';
            const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
            const state = addr.state || '';
            const postcode = addr.postcode ? ` • CEP ${addr.postcode}` : '';

            // Construct Full Main Street & Neighborhood Title
            let mainTitle = '';
            if (road) {
              mainTitle = `${road}${houseNum}${district ? ` - ${district}` : ''}`;
            } else if (district) {
              mainTitle = `${district}${city ? `, ${city}` : ''}`;
            } else if (city) {
              mainTitle = `${city}${state ? ` - ${state}` : ''}`;
            } else {
              mainTitle = item.display_name.split(',').slice(0, 2).join(', ').trim();
            }

            // Construct Full City, State, CEP & Country Subtitle
            let subDetail = '';
            if (city && state) {
              subDetail = `${city} - ${state}${postcode} • Brasil`;
            } else if (state) {
              subDetail = `${state}${postcode} • Brasil`;
            } else {
              subDetail = item.display_name.split(',').slice(1, 5).join(', ').trim();
            }

            const itemLat = parseFloat(item.lat);
            const itemLng = parseFloat(item.lon);
            const dist = userLocation 
              ? calculateDistanceKm(userLocation.lat, userLocation.lng, itemLat, itemLng)
              : undefined;

            return {
              id: `geo-${item.place_id}`,
              name: mainTitle,
              subtext: subDetail,
              lat: itemLat,
              lng: itemLng,
              distanceKm: dist,
              isLocalProperty: false
            };
          });
        }
      } catch (err) {
        console.warn('Erro na busca de sugestões geográficas:', err);
      }

      // Combine and SORT strictly by closest distance to user
      const combined = [...localMatches, ...apiMatches];
      if (userLocation) {
        combined.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
      }

      const topResults = combined.slice(0, 6);
      setSuggestions(topResults);
      setShowSuggestions(topResults.length > 0);
      setIsSuggesting(false);
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filterState.search, properties, userLocation]);

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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-cyber-darkest/95 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
      {/* ================= TIER 1: BRAND LOGO + USER ACTIONS & ROLES ================= */}
      <div className="px-2.5 sm:px-6 py-2 flex items-center justify-between gap-2 border-b border-slate-800/50">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button 
            onClick={() => setActiveView('MAPA')}
            className="flex items-center gap-2 sm:gap-2.5 group text-left focus:outline-none"
            title="Ir para o Mapa"
          >
            <img 
              src="/logo.png" 
              alt="LOCASH" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_12px_rgba(0,242,254,0.5)] transform group-hover:scale-105 transition-transform duration-300 shrink-0" 
            />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-lg tracking-wider text-white font-mono flex items-center">
                LOCA<span className="text-cyber-cyan">SH</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 uppercase tracking-widest">
                IMOBILIÁRIA
              </span>
            </div>
          </button>
        </div>

        {/* Action Controls & User Roles */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Landlord Add Property Button */}
          {userRole === 'LANDLORD' && (
            <button
              onClick={() => setIsWizardModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-neon-cyan transition-all transform active:scale-95 shrink-0"
              title="Cadastrar Novo Imóvel"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Anunciar</span>
            </button>
          )}

          {/* Favorites Shortcut */}
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
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                userRole === 'TENANT'
                  ? 'bg-gradient-to-r from-blue-600/40 to-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/40 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Locatário"
            >
              <User className="w-3.5 h-3.5" />
              <span className="text-xs">Locatário</span>
            </button>
            
            <button
              onClick={() => {
                setUserRole('LANDLORD');
                setActiveView('DASHBOARD_LOCADOR');
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                userRole === 'LANDLORD'
                  ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/30 text-cyber-purple border border-purple-500/40 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Modo Locador"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="text-xs">Locador</span>
            </button>
          </div>

          {/* Auth / Login Trigger Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-500/20 hover:from-blue-600/40 hover:to-cyan-500/40 border border-cyan-500/40 text-cyber-cyan hover:text-white transition-all flex items-center gap-1 shadow-sm shrink-0 group"
            title="Fazer Login ou Criar Conta"
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold font-mono">Entrar</span>
          </button>
        </div>
      </div>

      {/* ================= TIER 2: DEDICATED FULL-WIDTH ADDRESS SEARCH BAR ================= */}
      <div className="px-2.5 sm:px-6 py-2 bg-slate-950/60">
        <div ref={searchContainerRef} className="w-full max-w-4xl mx-auto relative">
          <form onSubmit={handleSearchSubmit} className="relative group flex items-center w-full">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-cyber-cyan">
              <MapPin className="w-4 h-4" />
            </div>
            
            <input
              type="text"
              placeholder="Digite o endereço, rua, avenida, bairro ou cidade..."
              value={filterState.search}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
              className="w-full bg-slate-900/95 text-xs sm:text-sm text-slate-100 placeholder-slate-400 pl-10 pr-20 py-2 sm:py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all font-sans shadow-inner"
            />
            
            <div className="absolute inset-y-1 right-1 flex items-center gap-1">
              {filterState.search && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterState(prev => ({ ...prev, search: '' }));
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="submit"
                className="px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-neon-cyan transition-all transform active:scale-95 shrink-0"
                title="Buscar no mapa (ou pressione Enter)"
              >
                {isSearching || isSuggesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5 text-slate-950 stroke-[2.8]" />
                    <span className="hidden sm:inline">Buscar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Real-time Full-Width Autocomplete Suggestions Dropdown (Sorted by Proximity) */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 glass-panel border border-cyan-500/40 rounded-2xl bg-slate-950/98 shadow-[0_12px_40px_rgba(0,0,0,0.85)] overflow-hidden z-50 animate-fade-in backdrop-blur-2xl">
              <div className="p-2 flex items-center justify-between border-b border-slate-800/80 px-4 bg-slate-900/50">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyber-cyan" />
                  Sugestões por Proximidade GPS
                </span>
                <span className="text-[9px] font-mono text-cyber-cyan font-bold">
                  {suggestions.length} MAIS PRÓXIMOS
                </span>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto no-scrollbar">
                {suggestions.map((item) => {
                  const distanceLabel = formatDistance(item.distanceKm);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full px-4 py-3 text-left flex items-center gap-3.5 hover:bg-cyan-500/10 transition-colors group cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        item.isLocalProperty 
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-cyber-emerald shadow-sm' 
                          : 'bg-cyan-500/15 border-cyan-500/30 text-cyber-cyan shadow-sm'
                      }`}>
                        {item.isLocalProperty ? (
                          <Building className="w-4 h-4" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyber-cyan transition-colors truncate">
                            {item.name}
                          </span>
                          {distanceLabel && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyber-cyan border border-cyan-500/30 shrink-0">
                              📍 {distanceLabel}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
                          {item.subtext}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 group-hover:text-cyber-cyan transition-colors shrink-0 font-mono flex items-center gap-1 font-bold">
                        Ir ➔
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
