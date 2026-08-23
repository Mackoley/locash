import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyType } from '../../types';
import * as maplibregl from 'maplibre-gl';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Building2, 
  MapPin, 
  DollarSign, 
  Layers, 
  Image as ImageIcon, 
  ShieldCheck,
  Search,
  Loader2,
  CheckCircle2,
  Navigation,
  Crosshair
} from 'lucide-react';

export const PropertyWizardModal: React.FC = () => {
  const { isWizardModalOpen, setIsWizardModalOpen, addProperty, setActiveView, userLocation, setSearchTarget } = useApp();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTAMENTO');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rentPrice, setRentPrice] = useState<number>(3500);
  const [condoFee, setCondoFee] = useState<number>(600);
  const [propertyTax, setPropertyTax] = useState<number>(200);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [parkingSpaces, setParkingSpaces] = useState<number>(1);
  const [area, setArea] = useState<number>(75);
  const [furnished, setFurnished] = useState<boolean>(true);
  const [petsAllowed, setPetsAllowed] = useState<boolean>(true);
  
  // Real Address & Geocoding State
  const [neighborhood, setNeighborhood] = useState('Pinheiros');
  const [publicAddress, setPublicAddress] = useState('Rua dos Pinheiros, 500');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [latitude, setLatitude] = useState<number>(-23.5630);
  const [longitude, setLongitude] = useState<number>(-46.6850);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodedAddressName, setGeocodedAddressName] = useState<string>('Rua dos Pinheiros, Pinheiros, São Paulo - SP');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80');

  // Mini Map Picker Refs
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<maplibregl.Map | null>(null);
  const miniMapMarkerRef = useRef<maplibregl.Marker | null>(null);

  const totalSteps = 6;

  // Auto-sync initial position with userLocation when wizard opens
  useEffect(() => {
    if (isWizardModalOpen && userLocation) {
      setLatitude(userLocation.lat);
      setLongitude(userLocation.lng);
      reverseGeocodeCoordinates(userLocation.lat, userLocation.lng);
    }
  }, [isWizardModalOpen]);

  // Initialize Interactive Mini-Map when reaching Step 2 safely
  useEffect(() => {
    if (!isWizardModalOpen || currentStep !== 2) {
      if (miniMapInstanceRef.current) {
        try {
          miniMapInstanceRef.current.remove();
        } catch (_) {}
        miniMapInstanceRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!miniMapContainerRef.current) return;

      try {
        if (miniMapInstanceRef.current) {
          miniMapInstanceRef.current.remove();
          miniMapInstanceRef.current = null;
        }

        const validLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : -23.5630;
        const validLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : -46.6850;

        const map = new maplibregl.Map({
          container: miniMapContainerRef.current,
          style: {
            version: 8,
            sources: {
              'carto-dark-tiles': {
                type: 'raster',
                tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
                tileSize: 256
              }
            },
            layers: [{ id: 'carto-dark', type: 'raster', source: 'carto-dark-tiles' }]
          },
          center: [validLng, validLat],
          zoom: 15,
          attributionControl: false
        });

        // Create Custom Draggable Pin Element
        const pinEl = document.createElement('div');
        pinEl.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: grab;">
            <div style="background: rgba(13, 21, 39, 0.95); border: 2px solid #00f2fe; color: #00f2fe; padding: 4px 8px; border-radius: 8px; font-weight: 800; font-size: 10px; font-family: monospace; box-shadow: 0 0 15px #00f2fe;">
              📍 ARRASTE OU CLIQUE
            </div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #00f2fe; box-shadow: 0 0 12px #00f2fe; border: 2px solid #ffffff; margin-top: 2px;"></div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: pinEl, draggable: true, anchor: 'bottom' })
          .setLngLat([validLng, validLat])
          .addTo(map);

        // On Pin Dragged
        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          setLatitude(lngLat.lat);
          setLongitude(lngLat.lng);
          setGeocodedAddressName(`Ponto exato (${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)})`);
        });

        // On Click Anywhere on the Mini-Map
        map.on('click', (e) => {
          marker.setLngLat(e.lngLat);
          setLatitude(e.lngLat.lat);
          setLongitude(e.lngLat.lng);
          setGeocodedAddressName(`Ponto marcado (${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)})`);
        });

        miniMapInstanceRef.current = map;
        miniMapMarkerRef.current = marker;
      } catch (err) {
        console.warn('Erro ao inicializar mini-mapa:', err);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (miniMapInstanceRef.current) {
        try {
          miniMapInstanceRef.current.remove();
        } catch (_) {}
        miniMapInstanceRef.current = null;
      }
    };
  }, [currentStep, isWizardModalOpen]);

  if (!isWizardModalOpen) return null;

  // Real-Time Geocoding for Landlord Address Input (Photon + Nominatim)
  const handleGeocodeAddress = async () => {
    const fullQuery = `${publicAddress}, ${neighborhood}, ${city}, ${state}`.trim();
    setIsGeocoding(true);
    try {
      // 1. Fast Photon geocoding
      const photonRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(fullQuery)}&limit=1`);
      if (photonRes.ok) {
        const photonData = await photonRes.json();
        if (photonData.features && photonData.features.length > 0) {
          const [lng, lat] = photonData.features[0].geometry.coordinates;
          const p = photonData.features[0].properties;
          setLatitude(lat);
          setLongitude(lng);
          setGeocodedAddressName([p.name || p.street, p.district, p.city].filter(Boolean).join(', '));
          setIsGeocoding(false);

          if (miniMapInstanceRef.current && miniMapMarkerRef.current) {
            miniMapMarkerRef.current.setLngLat([lng, lat]);
            miniMapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 16 });
          }
          return;
        }
      }

      // 2. Nominatim Fallback
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        setLatitude(newLat);
        setLongitude(newLng);
        setGeocodedAddressName(item.display_name);
        setIsGeocoding(false);

        if (miniMapInstanceRef.current && miniMapMarkerRef.current) {
          miniMapMarkerRef.current.setLngLat([newLng, newLat]);
          miniMapInstanceRef.current.flyTo({ center: [newLng, newLat], zoom: 16 });
        }
      }
    } catch (e) {
      console.error('Erro ao geolocalizar imóvel:', e);
    }
    setIsGeocoding(false);
  };

  // Map of Brazilian States to standard UFs
  const stateToUf: Record<string, string> = {
    'Bahia': 'BA', 'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Minas Gerais': 'MG',
    'Paraná': 'PR', 'Rio Grande do Sul': 'RS', 'Santa Catarina': 'SC', 'Pernambuco': 'PE',
    'Ceará': 'CE', 'Goiás': 'GO', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
    'Maranhão': 'MA', 'Amazonas': 'AM', 'Pará': 'PA', 'Paraíba': 'PB',
    'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Alagoas': 'AL', 'Piauí': 'PI',
    'Rio Grande do Norte': 'RN', 'Sergipe': 'SE', 'Rondônia': 'RO', 'Tocantins': 'TO',
    'Acre': 'AC', 'Amapá': 'AP', 'Roraima': 'RR'
  };

  // Reverse Geocode (Coordinates -> Full Address Form Fields)
  const reverseGeocodeCoordinates = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      // 1. Primary: Nominatim Reverse Geocoding with pt-BR address details
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' }
      });
      
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        
        const road = addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || addr.avenue || '';
        const houseNumber = addr.house_number || '';
        const fullStreet = road ? (houseNumber ? `${road}, ${houseNumber}` : road) : '';
        
        const neigh = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || addr.district || '';
        const cityName = addr.city || addr.town || addr.municipality || addr.village || '';
        const stateName = addr.state || '';
        const uf = stateToUf[stateName] || stateName;

        if (fullStreet) setPublicAddress(fullStreet);
        if (neigh) setNeighborhood(neigh);
        if (cityName) setCity(cityName);
        if (uf) setState(uf);

        const displayName = [fullStreet || road, neigh, cityName, uf].filter(Boolean).join(', ');
        setGeocodedAddressName(displayName || data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        
        // Auto-update suggested title if empty or default
        if (!title || title.startsWith('Apartamento em') || title.startsWith('Casa em') || title.startsWith('Imóvel em') || title.startsWith('Studio em')) {
          setTitle(`${propertyType} em ${neigh || cityName || 'Localização Nobre'}`);
        }
        setIsGeocoding(false);
        return;
      }
    } catch (e) {
      console.warn('Falha no Nominatim reverse, tentando Photon fallback:', e);
    }

    // 2. Fallback: Photon Reverse Geocoding
    try {
      const photonRes = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
      if (photonRes.ok) {
        const pData = await photonRes.json();
        if (pData.features && pData.features[0]) {
          const p = pData.features[0].properties || {};
          const street = [p.street, p.housenumber].filter(Boolean).join(', ') || p.name || '';
          const neigh = p.district || p.suburb || '';
          const cityName = p.city || '';
          const stateName = p.state || '';
          const uf = stateToUf[stateName] || stateName;

          if (street) setPublicAddress(street);
          if (neigh) setNeighborhood(neigh);
          if (cityName) setCity(cityName);
          if (uf) setState(uf);
          setGeocodedAddressName([street, neigh, cityName, uf].filter(Boolean).join(', '));
        }
      }
    } catch (_) {}
    
    setIsGeocoding(false);
  };

  // Set Location to Landlord's Current Location and Auto-Fill Address Fields
  const handleUseCurrentLocation = () => {
    setIsGeocoding(true);
    if (userLocation) {
      setLatitude(userLocation.lat);
      setLongitude(userLocation.lng);
      if (miniMapInstanceRef.current && miniMapMarkerRef.current) {
        miniMapMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
        miniMapInstanceRef.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 16 });
      }
      reverseGeocodeCoordinates(userLocation.lat, userLocation.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          if (miniMapInstanceRef.current && miniMapMarkerRef.current) {
            miniMapMarkerRef.current.setLngLat([lng, lat]);
            miniMapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 16 });
          }
          reverseGeocodeCoordinates(lat, lng);
        },
        (err) => {
          console.warn('Erro ao obter GPS:', err);
          setIsGeocoding(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsGeocoding(false);
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : -23.5630;
    const finalLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : -46.6850;

    const createdProp = {
      ownerId: 'landlord-1',
      ownerName: 'Locador LOCASH',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      title: title.trim() || `${propertyType} em ${neighborhood}`,
      description: description.trim() || `Excelente ${propertyType.toLowerCase()} em ${neighborhood}. Localização privilegiada com fácil acesso.`,
      propertyType,
      status: 'DISPONÍVEL' as const,
      rentPrice: Number(rentPrice) || 3500,
      condoFee: Number(condoFee) || 0,
      propertyTax: Number(propertyTax) || 0,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      parkingSpaces: Number(parkingSpaces) || 0,
      area: Number(area) || 50,
      furnished,
      petsAllowed,
      latitude: finalLat,
      longitude: finalLng,
      publicAddress: publicAddress.trim() || `${neighborhood}, ${city}`,
      neighborhood: neighborhood.trim() || 'Centro',
      city: city.trim() || 'São Paulo',
      state: state.trim() || 'SP',
      featured: true,
      verified: true,
      images: [
        imageUrl.trim() || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80'
      ],
      demandScore: 92,
      pricePerSqm: Math.round((Number(rentPrice) || 3500) / (Number(area) || 50))
    };

    addProperty(createdProp);
    setSearchTarget({ lat: finalLat, lng: finalLng, name: createdProp.publicAddress });
    setIsWizardModalOpen(false);
    setCurrentStep(1);
    setActiveView('MAPA');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#080d1a] border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(0,242,254,0.2)] flex flex-col justify-between overflow-hidden my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 glass-panel flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan flex items-center justify-center font-mono font-bold text-xs">
              {currentStep}/{totalSteps}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Cadastrar Novo Imóvel
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Georreferenciamento e Mapeamento Satelital 3D
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsWizardModalOpen(false);
              setCurrentStep(1);
            }}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body with Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* STEP 1: Tipo & Título */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-cyber-cyan flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                1. Tipo de Imóvel e Título
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['APARTAMENTO', 'CASA', 'KITNET', 'SOBRADO', 'COMERCIAL', 'SÍTIO', 'CHÁCARA', 'OUTROS'] as PropertyType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`p-3 rounded-2xl border text-center transition-all font-mono font-bold text-xs ${
                      propertyType === type
                        ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-neon-cyan'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-slate-400 block font-medium">Título do Anúncio</label>
                <input
                  type="text"
                  placeholder="Ex: Studio Cyberpunk Decorado com Vista Panorâmica"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Localização e Mini-Mapa */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-cyber-cyan flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  2. Localização Exata & Endereço
                </h4>
              </div>

              {/* Botão de Localização Automática com GPS / IA */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isGeocoding}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyber-cyan border border-cyan-400/50 flex items-center justify-center gap-2 font-bold text-xs shadow-[0_0_25px_rgba(0,242,254,0.2)] transition-all"
              >
                {isGeocoding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyber-cyan" />
                    <span>Identificando rua, bairro e cidade pelo GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 text-cyber-cyan animate-pulse" />
                    <span>📍 Usar Minha Localização Atual (Preenchimento Automático)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 block text-xs">Endereço Público</label>
                  <input
                    type="text"
                    value={publicAddress}
                    onChange={(e) => setPublicAddress(e.target.value)}
                    placeholder="Rua, Avenida, Número..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block text-xs">Bairro</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block text-xs">Cidade</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block text-xs">Estado (UF)</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGeocodeAddress}
                  disabled={isGeocoding}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyber-cyan hover:bg-slate-800 text-xs font-mono font-bold flex items-center justify-center gap-2"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Localizando endereço...
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      Ajustar no Mapa pelo Endereço
                    </>
                  )}
                </button>
              </div>

              {/* Interactive Mini-Map Container */}
              <div className="space-y-1.5">
                <div className="h-44 sm:h-52 w-full rounded-2xl overflow-hidden border border-cyan-500/40 relative bg-slate-950">
                  <div ref={miniMapContainerRef} className="w-full h-full" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  📍 {geocodedAddressName}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Valores Financeiros */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-cyber-cyan flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                3. Valores e Custos
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 block">Aluguel Mensal (R$)</label>
                  <input
                    type="number"
                    value={rentPrice}
                    onChange={(e) => setRentPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block">Condomínio (R$)</label>
                  <input
                    type="number"
                    value={condoFee}
                    onChange={(e) => setCondoFee(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block">IPTU Mensal (R$)</label>
                  <input
                    type="number"
                    value={propertyTax}
                    onChange={(e) => setPropertyTax(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-mono">Total Mensal Estimado:</span>
                <span className="text-base font-extrabold text-cyber-cyan font-mono">
                  R$ {(rentPrice + condoFee + propertyTax).toLocaleString('pt-BR')}/mês
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Características */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-cyber-cyan flex items-center gap-2">
                <Layers className="w-4 h-4" />
                4. Cômodos e Estrutura
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 block">Quartos</label>
                  <input
                    type="number"
                    min={0}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block">Banheiros</label>
                  <input
                    type="number"
                    min={1}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block">Vagas Garagem</label>
                  <input
                    type="number"
                    min={0}
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block">Área Útil (m²)</label>
                  <input
                    type="number"
                    min={10}
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFurnished(!furnished)}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                    furnished ? 'bg-cyan-500/20 border-cyan-500 text-cyber-cyan' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {furnished ? 'Mobiliado: Sim' : 'Mobiliado: Não'}
                </button>

                <button
                  type="button"
                  onClick={() => setPetsAllowed(!petsAllowed)}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                    petsAllowed ? 'bg-cyan-500/20 border-cyan-500 text-cyber-cyan' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {petsAllowed ? 'Aceita Pets: Sim' : 'Aceita Pets: Não'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Fotos & Descrição */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-cyber-cyan flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                5. Fotos e Descrição
              </h4>

              <div className="space-y-1.5">
                <label className="text-slate-400 block">URL da Foto Principal</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 block">Descrição Completa</label>
                <textarea
                  rows={3}
                  placeholder="Descreva os diferenciais, vista, condomínio e acabamentos..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-cyber-cyan focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Revisão e Publicação */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3">
                <div className="flex items-center gap-2 text-cyber-emerald font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Revisão Final Pronta para Publicação no Mapa Real</span>
                </div>

                <div className="text-xs space-y-1.5 text-slate-300">
                  <p><b>Imóvel:</b> {title || `${propertyType} em ${neighborhood}`}</p>
                  <p><b>Endereço:</b> {publicAddress} ({neighborhood} - {city})</p>
                  <p className="text-cyber-cyan"><b>Localização Exata:</b> Lat {latitude.toFixed(5)}, Lng {longitude.toFixed(5)}</p>
                  <p><b>Aluguel:</b> R$ {rentPrice.toLocaleString('pt-BR')}/mês</p>
                  <p><b>Área:</b> {area}m² • {bedrooms} quartos • {bathrooms} banheiros</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 glass-panel flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : <div />}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={async () => {
                if (currentStep === 2 && !latitude) {
                  await handleGeocodeAddress();
                }
                setCurrentStep(prev => prev + 1);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-neon-cyan transition-all"
            >
              <span>Avançar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-emerald hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs shadow-neon-cyan transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publicar no Mapa 3D</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
