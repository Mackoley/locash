import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  MapPin, 
  Building, 
  Navigation, 
  X, 
  Loader2,
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
  const R = 6371;
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
    return `${Math.round(distKm * 1000)}m`;
  }
  return `${distKm.toFixed(1)} km`;
};

const getCategoryEmoji = (name: string, subtext: string = ''): string => {
  const t = `${name} ${subtext}`.toLowerCase();
  if (t.includes('pizza')) return '🍕';
  if (t.includes('farmacia') || t.includes('farmácia') || t.includes('drogaria') || t.includes('medic') || t.includes('remedio') || t.includes('remédio')) return '💊';
  if (t.includes('supermercado') || t.includes('mercado') || t.includes('mercadinho') || t.includes('mercearia') || t.includes('atacadao') || t.includes('atacadão') || t.includes('hipermercado')) return '🛒';
  if (t.includes('padaria') || t.includes('panificadora') || t.includes('pão') || t.includes('pao')) return '🥖';
  if (t.includes('posto') || t.includes('combustivel') || t.includes('combustível') || t.includes('gasolina') || t.includes('etanol') || t.includes('gnv') || t.includes('ipiranga') || t.includes('shell') || t.includes('petrobras') || t.includes('br distribuidora')) return '⛽';
  if (t.includes('hospital') || t.includes('upa') || t.includes('clinica') || t.includes('clínica') || t.includes('saude') || t.includes('saúde') || t.includes('pronto socorro') || t.includes('medico') || t.includes('médico')) return '🏥';
  if (t.includes('restaurante') || t.includes('lanchonete') || t.includes('burger') || t.includes('hamburguer') || t.includes('hambúrguer') || t.includes('comida') || t.includes('churrascaria') || t.includes('sushi') || t.includes('bar') || t.includes('boteco') || t.includes('choperia')) return '🍽️';
  if (t.includes('academia') || t.includes('fitness') || t.includes('crossfit') || t.includes('gym') || t.includes('treino')) return '🏋️';
  if (t.includes('banco') || t.includes('caixa') || t.includes('loterica') || t.includes('lotérica') || t.includes('bradesco') || t.includes('itau') || t.includes('itaú') || t.includes('santander') || t.includes('nubank') || t.includes('banco do brasil')) return '🏦';
  if (t.includes('escola') || t.includes('colegio') || t.includes('colégio') || t.includes('faculdade') || t.includes('universidade')) return '🎓';
  if (t.includes('pet') || t.includes('veterin') || t.includes('animal') || t.includes('racao') || t.includes('ração')) return '🐾';
  return '';
};

export const FloatingSearchBar: React.FC = () => {
  const { 
    filterState, 
    setFilterState, 
    properties, 
    searchAddress, 
    setSearchTarget, 
    userLocation,
    activeView,
    setActiveView
  } = useApp();

  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasJustSelectedRef = useRef<boolean>(false);
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

      // A. Check if query is a Google Maps URL
      if (query.includes('google.com/maps') || query.includes('goo.gl/maps') || query.includes('maps.app.goo.gl')) {
        const coordMatch = query.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        const placeMatch = query.match(/\/place\/([^/@]+)/);
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lng = parseFloat(coordMatch[2]);
          const placeName = placeMatch ? decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')) : 'Local do Google Maps';
          localMatches.unshift({
            id: `gmaps-url-${lat}-${lng}`,
            name: `📍 ${placeName}`,
            subtext: `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)} • Google Maps`,
            lat,
            lng,
            distanceKm: userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, lat, lng) : undefined,
            isLocalProperty: false
          });
        }
      }

      // B. Check if query is raw Coordinates
      const rawCoords = query.trim().match(/^(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)$/);
      if (rawCoords) {
        const lat = parseFloat(rawCoords[1]);
        const lng = parseFloat(rawCoords[2]);
        localMatches.unshift({
          id: `coords-${lat}-${lng}`,
          name: `📍 Coordenadas GPS (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
          subtext: 'Ir direto para esta coordenada no mapa',
          lat,
          lng,
          distanceKm: userLocation ? calculateDistanceKm(userLocation.lat, userLocation.lng, lat, lng) : undefined,
          isLocalProperty: false
        });
      }

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

      // 2. Fetch Multi-source (Photon + Nominatim) with strict proximity bias to user location
      let apiMatches: AddressSuggestion[] = [];
      const latLonBias = userLocation ? `&lat=${userLocation.lat}&lon=${userLocation.lng}` : '';
      const viewboxBias = userLocation 
        ? `&viewbox=${userLocation.lng - 0.25},${userLocation.lat + 0.25},${userLocation.lng + 0.25},${userLocation.lat - 0.25}&bounded=0`
        : '';

      try {
        const [photonRes, nominatimRes] = await Promise.allSettled([
          fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}${latLonBias}&limit=8&lang=default`),
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}${viewboxBias}&countrycodes=br&limit=7&addressdetails=1`)
        ]);

        if (photonRes.status === 'fulfilled' && photonRes.value.ok) {
          const photonData = await photonRes.value.json();
          if (photonData.features) {
            photonData.features.forEach((feat: any, idx: number) => {
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

              const fullKey = `${mainTitle}-${subDetail}`.toLowerCase();
              if (!seenNames.has(fullKey)) {
                seenNames.add(fullKey);
                apiMatches.push({
                  id: `photon-${idx}-${lat}`,
                  name: mainTitle,
                  subtext: subDetail,
                  lat,
                  lng,
                  distanceKm: dist,
                  isLocalProperty: false
                });
              }
            });
          }
        }

        if (nominatimRes.status === 'fulfilled' && nominatimRes.value.ok) {
          const nomData = await nominatimRes.value.json();
          if (Array.isArray(nomData)) {
            nomData.forEach((item: any, idx: number) => {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              const addr = item.address || {};
              const road = addr.road || addr.pedestrian || addr.suburb || item.name || '';
              const houseNumber = addr.house_number ? `, nº ${addr.house_number}` : '';
              const district = addr.neighbourhood || addr.suburb || addr.city_district ? ` - ${addr.neighbourhood || addr.suburb || addr.city_district}` : '';
              const city = addr.city || addr.town || addr.municipality || addr.village || '';
              const state = addr.state || '';

              let mainTitle = road ? `${road}${houseNumber}${district}` : (item.display_name.split(',')[0] || 'Local');
              let subDetail = [city, state].filter(Boolean).join(' - ') || 'Brasil';

              const dist = userLocation
                ? calculateDistanceKm(userLocation.lat, userLocation.lng, lat, lng)
                : undefined;

              const fullKey = `${mainTitle}-${subDetail}`.toLowerCase();
              if (!seenNames.has(fullKey)) {
                seenNames.add(fullKey);
                apiMatches.push({
                  id: `nom-${idx}-${lat}`,
                  name: mainTitle,
                  subtext: subDetail,
                  lat,
                  lng,
                  distanceKm: dist,
                  isLocalProperty: false
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn('Erro ao buscar sugestões externas:', err);
      }

      // 3. Proximity-Based Sorting Rule
      const sorted = [...localMatches, ...apiMatches].sort((a, b) => {
        if (a.isLocalProperty && !b.isLocalProperty) return -1;
        if (!a.isLocalProperty && b.isLocalProperty) return 1;

        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        if (a.distanceKm !== undefined) return -1;
        if (b.distanceKm !== undefined) return 1;
        return 0;
      });

      setSuggestions(sorted);
      setShowSuggestions(sorted.length > 0);
      setIsSuggesting(false);
    }, 280);
  }, [filterState.search, properties, userLocation]);

  const handleSelectSuggestion = (sug: AddressSuggestion) => {
    hasJustSelectedRef.current = true;
    setShowSuggestions(false);
    setSuggestions([]);
    setIsSuggesting(false);

    if (inputRef.current) {
      inputRef.current.blur();
    }

    setFilterState(prev => ({ ...prev, search: sug.name }));
    setSearchTarget({
      lat: sug.lat,
      lng: sug.lng,
      name: `${sug.name}, ${sug.subtext}`
    });

    if (activeView !== 'MAPA') {
      setActiveView('MAPA');
    }

    setTimeout(() => {
      hasJustSelectedRef.current = false;
    }, 800);
  };

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = filterState.search.trim();
    if (!query) return;

    hasJustSelectedRef.current = true;
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }

    setIsSearching(true);
    if (activeView !== 'MAPA') {
      setActiveView('MAPA');
    }

    try {
      // 1. Direct coordinate check
      const coordMatch = query.match(/^(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        setSearchTarget({ lat, lng, name: `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})` });
        setIsSearching(false);
        return;
      }

      // 2. Google Maps URL
      if (query.includes('google.com/maps') || query.includes('goo.gl/maps') || query.includes('maps.app.goo.gl')) {
        const coordMatch = query.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        const placeMatch = query.match(/\/place\/([^/@]+)/);
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1]);
          const lng = parseFloat(coordMatch[2]);
          const placeName = placeMatch ? decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')) : 'Local do Google Maps';
          setSearchTarget({ lat, lng, name: placeName });
          setIsSearching(false);
          return;
        }
      }

      // 3. Geocode search
      await searchAddress(query);
    } finally {
      setIsSearching(false);
      setTimeout(() => {
        hasJustSelectedRef.current = false;
      }, 800);
    }
  };

  const handleClearSearch = () => {
    hasJustSelectedRef.current = true;
    setFilterState(prev => ({ ...prev, search: '' }));
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchTarget(null);
    inputRef.current?.focus();
    setTimeout(() => {
      hasJustSelectedRef.current = false;
    }, 300);
  };

  return (
    <div 
      ref={searchContainerRef} 
      className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:w-[540px] max-w-[620px] transition-all duration-300 group"
    >
      {/* Floating Translucent Bar that solidifies on Hover or Focus */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex items-center w-full rounded-2xl bg-[#090f1f]/65 hover:bg-[#080e1d]/95 focus-within:bg-[#070c1a]/98 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/70 focus-within:border-cyan-400 shadow-[0_8px_32px_rgba(0,0,0,0.6)] focus-within:shadow-[0_0_35px_rgba(0,242,254,0.35)] transition-all duration-300 px-3.5 py-2 sm:py-2.5 gap-2.5"
      >
        <div className="relative flex items-center justify-center text-cyan-400 shrink-0">
          {isSearching || isSuggesting ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          ) : (
            <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={filterState.search}
          onChange={(e) => {
            hasJustSelectedRef.current = false;
            const val = e.target.value;
            setFilterState(prev => ({ ...prev, search: val }));
          }}
          onFocus={() => {
            if (suggestions.length > 0 && !hasJustSelectedRef.current) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Buscar endereço, rua, bairro ou cidade..."
          className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-slate-400 font-sans min-w-0"
        />

        {filterState.search && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
            title="Limpar busca"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="submit"
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm hover:shadow-neon-cyan transition-all transform active:scale-95 shrink-0 cursor-pointer"
        >
          <span>Buscar</span>
        </button>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 inset-x-0 rounded-2xl bg-[#070d1d]/98 border border-cyan-500/40 shadow-[0_15px_50px_rgba(0,0,0,0.85)] overflow-hidden z-50 backdrop-blur-2xl animate-fade-in max-h-[380px] overflow-y-auto no-scrollbar">
          <div className="p-2 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider font-mono flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Sugestões em Tempo Real ({suggestions.length})
            </span>
            {userLocation && (
              <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                <Navigation className="w-2.5 h-2.5 text-emerald-400" />
                Ordenado por proximidade GPS
              </span>
            )}
          </div>

          <div className="p-1.5 space-y-1">
            {suggestions.map((sug) => {
              const emoji = getCategoryEmoji(sug.name, sug.subtext);
              const distBadge = formatDistance(sug.distanceKm);

              return (
                <button
                  key={sug.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer group ${
                    sug.isLocalProperty 
                      ? 'bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30' 
                      : 'hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    sug.isLocalProperty 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                      : 'bg-slate-900 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800 border border-slate-800'
                  }`}>
                    {emoji ? (
                      <span className="text-sm leading-none">{emoji}</span>
                    ) : sug.isLocalProperty ? (
                      <Building className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold truncate ${
                        sug.isLocalProperty ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'
                      }`}>
                        {sug.name}
                      </span>
                      {sug.isLocalProperty && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold font-mono rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                          Imóvel
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-400 truncate mt-0.5 font-sans">
                      {sug.subtext}
                    </p>
                  </div>

                  {distBadge && (
                    <div className="flex flex-col items-end shrink-0 ml-1">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                        {distBadge}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
