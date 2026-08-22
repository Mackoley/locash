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
  Compass,
  ChevronDown,
  LogOut,
  ShieldCheck
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
    currentUser,
    logout,
    userLocation
  } = useApp();

  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasJustSelectedRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
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

    if (hasJustSelectedRef.current) {
      setShowSuggestions(false);
      return;
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (hasJustSelectedRef.current) {
        setShowSuggestions(false);
        return;
      }

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

      // 2. Fetch Photon Geocoding API (Fast, CORS-ready, Proximity-biased)
      let apiMatches: AddressSuggestion[] = [];
      try {
        const latLonBias = userLocation ? `&lat=${userLocation.lat}&lon=${userLocation.lng}` : '';
        const photonRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}${latLonBias}&limit=8&lang=default`
        );
        if (photonRes.ok) {
          const photonData = await photonRes.json();
          if (photonData.features && photonData.features.length > 0) {
            apiMatches = photonData.features.map((feat: any, idx: number) => {
              const [lng, lat] = feat.geometry.coordinates;
              const p = feat.properties || {};
              const street = p.street || p.name || '';
              const houseNum = p.housenumber ? `, nº ${p.housenumber}` : '';
              const district = p.district ? ` - ${p.district}` : '';
              const city = p.city || '';
              const state = p.state || '';
              const postcode = p.postcode ? ` • CEP ${p.postcode}` : '';

              let mainTitle = '';
              if (p.street) {
                mainTitle = `${p.street}${houseNum}${district}`;
              } else if (p.name) {
                mainTitle = `${p.name}${district}`;
              } else if (district) {
                mainTitle = `${p.district}${city ? `, ${city}` : ''}`;
              } else {
                mainTitle = `${city || 'Localização'}${state ? ` - ${state}` : ''}`;
              }

              let subDetail = [city, state].filter(Boolean).join(' - ');
              if (postcode) subDetail += postcode;
              if (!subDetail) subDetail = 'Brasil';

              const dist = userLocation
                ? calculateDistanceKm(userLocation.lat, userLocation.lng, lat, lng)
                : undefined;

              return {
                id: `photon-${idx}-${p.osm_id || Math.random()}`,
                name: mainTitle,
                subtext: subDetail,
                lat,
                lng,
                distanceKm: dist,
                isLocalProperty: false
              };
            });
          }
        }
      } catch (err) {
        console.warn('Erro na busca Photon:', err);
      }

      // 3. Fallback to Nominatim if Photon returned no matches
      if (apiMatches.length === 0) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            apiMatches = data.map((item: any) => {
              const itemLat = parseFloat(item.lat);
              const itemLng = parseFloat(item.lon);
              const dist = userLocation 
                ? calculateDistanceKm(userLocation.lat, userLocation.lng, itemLat, itemLng)
                : undefined;

              const parts = item.display_name.split(',');
              const mainName = parts[0]?.trim() || item.display_name;
              const sub = parts.slice(1, 4).join(',').trim();

              return {
                id: `geo-${item.place_id}`,
                name: mainName,
                subtext: sub || 'Brasil',
                lat: itemLat,
                lng: itemLng,
                distanceKm: dist,
                isLocalProperty: false
              };
            });
          }
        } catch (err) {
          console.warn('Erro na busca Nominatim:', err);
        }
      }

      // Combine and SORT strictly by closest distance to user
      const combined = [...localMatches, ...apiMatches];
      if (userLocation) {
        combined.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
      }

      const topResults = combined.slice(0, 6);
      setSuggestions(topResults);

      if (hasJustSelectedRef.current) {
        setShowSuggestions(false);
      } else {
        const isFocused = document.activeElement === inputRef.current;
        setShowSuggestions(isFocused && topResults.length > 0);
      }

      setIsSuggesting(false);
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filterState.search, properties, userLocation]);

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    hasJustSelectedRef.current = true;
    setFilterState(prev => ({ ...prev, search: suggestion.name }));
    setShowSuggestions(false);
    
    // Blur search input so mobile keyboard dismisses and dropdown closes
    if (inputRef.current) {
      inputRef.current.blur();
    }

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

    hasJustSelectedRef.current = true;
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }

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

          {/* User Profile Trigger & Dropdown Menu */}
          <div ref={profileDropdownRef} className="relative shrink-0">
            <button
              onClick={() => setIsProfileDropdownOpen(prev => !prev)}
              className={`p-1 sm:px-2.5 sm:py-1 rounded-xl border transition-all flex items-center gap-2 shadow-sm shrink-0 group cursor-pointer ${
                isProfileDropdownOpen
                  ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-500/20 text-white'
                  : userRole === 'LANDLORD'
                    ? 'bg-purple-950/50 hover:bg-purple-900/70 border-purple-500/40 text-purple-200'
                    : 'bg-cyan-950/50 hover:bg-cyan-900/70 border-cyan-500/40 text-cyan-200'
              }`}
              title="Menu do Usuário"
            >
              {currentUser?.avatarUrl ? (
                <div className="relative">
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-cyan-400 shadow-sm"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950"></span>
                </div>
              ) : (
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center ${
                  userRole === 'LANDLORD' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {userRole === 'LANDLORD' ? <Building className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
              )}

              <div className="flex flex-col text-left max-w-[100px] sm:max-w-[130px]">
                <span className="text-[11px] font-bold font-sans leading-tight truncate">
                  {currentUser?.name || (userRole === 'LANDLORD' ? 'Locador (Admin)' : 'Inquilino')}
                </span>
                <span className="text-[9px] text-slate-400 font-mono leading-none truncate">
                  {userRole === 'LANDLORD' ? '🏢 Locador' : '🏠 Inquilino'}
                </span>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isProfileDropdownOpen ? 'rotate-180 text-cyan-400' : 'group-hover:text-slate-200'
              }`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 glass-panel border border-cyan-500/40 rounded-2xl bg-slate-950/98 shadow-[0_15px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-fade-in backdrop-blur-2xl">
                {/* User Info Header */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-2">
                  <div className="flex items-center gap-2.5">
                    {currentUser?.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name} 
                        className="w-9 h-9 rounded-full object-cover border border-cyan-400/80 shadow-md"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyber-cyan flex items-center justify-center font-bold text-sm">
                        {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {currentUser?.name || 'Usuário LOCASH'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {currentUser?.email || 'conta@locash.com'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">Perfil Ativo:</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      userRole === 'LANDLORD' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {userRole === 'LANDLORD' ? '🏢 LOCADOR' : '🏠 INQUILINO'}
                    </span>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="space-y-1">
                  {/* Meu Perfil */}
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-cyan-500/15 flex items-center gap-2.5 transition-all group cursor-pointer"
                  >
                    <User className="w-4 h-4 text-cyber-cyan group-hover:scale-110 transition-transform" />
                    <span>Meu Perfil</span>
                  </button>

                  {/* Context Action depending on fixed account role */}
                  {userRole === 'LANDLORD' ? (
                    <button
                      onClick={() => {
                        setActiveView('DASHBOARD_LOCADOR');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-purple-500/15 flex items-center gap-2.5 transition-all group cursor-pointer"
                    >
                      <Building className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                      <span>Painel de Gestão</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveView('CENTRAL_LOCACAO');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-cyan-500/15 flex items-center gap-2.5 transition-all group cursor-pointer"
                    >
                      <Key className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span>Minha Locação</span>
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="my-1.5 border-t border-slate-800/80" />

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/15 flex items-center gap-2.5 transition-all group cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                  <span>Sair da Conta (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= TIER 2: DEDICATED FULL-WIDTH ADDRESS SEARCH BAR (EXCLUSIVO DO MAPA) ================= */}
      {activeView === 'MAPA' && (
        <div className="px-2.5 sm:px-6 py-2 bg-slate-950/60 border-t border-slate-800/40 animate-fade-in">
          <div ref={searchContainerRef} className="w-full max-w-4xl mx-auto relative">
          <form onSubmit={handleSearchSubmit} className="relative group flex items-center w-full">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-cyber-cyan">
              <MapPin className="w-4 h-4" />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              placeholder="Digite o endereço, rua, avenida, bairro ou cidade..."
              value={filterState.search}
              onClick={() => {
                hasJustSelectedRef.current = false;
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onFocus={() => {
                hasJustSelectedRef.current = false;
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onChange={(e) => {
                hasJustSelectedRef.current = false;
                setFilterState(prev => ({ ...prev, search: e.target.value }));
                setShowSuggestions(true);
              }}
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
      )}
    </header>
  );
};
