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
  const { isWizardModalOpen, setIsWizardModalOpen, addProperty, setActiveView, userLocation } = useApp();
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
  const [publicAddress, setPublicAddress] = useState('Rua dos Pinheiros, Pinheiros, São Paulo');
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

  if (!isWizardModalOpen) return null;

  const totalSteps = 6;

  // Initialize Interactive Mini-Map when reaching Step 2
  useEffect(() => {
    if (currentStep !== 2 || !miniMapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!miniMapContainerRef.current) return;

      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }

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
        center: [longitude, latitude],
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
        .setLngLat([longitude, latitude])
        .addTo(map);

      // On Pin Dragged
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setLatitude(lngLat.lat);
        setLongitude(lngLat.lng);
        setGeocodedAddressName(`Ponto exato selecionado no mapa (${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)})`);
      });

      // On Click Anywhere on the Mini-Map
      map.on('click', (e) => {
        marker.setLngLat(e.lngLat);
        setLatitude(e.lngLat.lat);
        setLongitude(e.lngLat.lng);
        setGeocodedAddressName(`Ponto marcado no mapa (${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)})`);
      });

      miniMapInstanceRef.current = map;
      miniMapMarkerRef.current = marker;
    }, 150);

    return () => {
      clearTimeout(timer);
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [currentStep]);

  // Real-Time Geocoding for Landlord Address Input
  const handleGeocodeAddress = async (): Promise<{ lat: number; lng: number; displayName: string }> => {
    const fullQuery = `${publicAddress}, ${neighborhood}, ${city}, ${state}`.trim();
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`, {
        headers: { 'Accept-Language': 'pt-BR' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        setLatitude(newLat);
        setLongitude(newLng);
        setGeocodedAddressName(item.display_name);
        setIsGeocoding(false);

        // Update Mini-Map if active
        if (miniMapInstanceRef.current && miniMapMarkerRef.current) {
          miniMapMarkerRef.current.setLngLat([newLng, newLat]);
          miniMapInstanceRef.current.flyTo({ center: [newLng, newLat], zoom: 16 });
        }

        return { lat: newLat, lng: newLng, displayName: item.display_name };
      } else {
        const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${publicAddress}, ${city}`)}&limit=1`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.length > 0) {
          const item = fallbackData[0];
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

          return { lat: newLat, lng: newLng, displayName: item.display_name };
        }
      }
    } catch (e) {
      console.error('Erro ao geolocalizar imóvel:', e);
    }
    setIsGeocoding(false);
    return { lat: latitude || -23.5630, lng: longitude || -46.6850, displayName: geocodedAddressName };
  };

  // Set Location to Landlord's Current Location
  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setLatitude(userLocation.lat);
      setLongitude(userLocation.lng);
      setGeocodedAddressName(`Sua localização atual (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`);
      if (miniMapInstanceRef.current && miniMapMarkerRef.current) {
        miniMapMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
        miniMapInstanceRef.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 16 });
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setGeocodedAddressName(`Sua localização atual (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        if (miniMapInstanceRef.current && miniMapMarkerRef.current) {
          miniMapMarkerRef.current.setLngLat([lng, lat]);
          miniMapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 16 });
        }
      });
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalLat = latitude || -23.5630;
    const finalLng = longitude || -46.6850;

    const createdProp = {
      ownerId: 'landlord-1',
      ownerName: 'João Carlos Silva',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      title: title || `${propertyType} em ${neighborhood}`,
      description: description || `Excelente ${propertyType.toLowerCase()} em ${neighborhood}. Localização privilegiada com fácil acesso e comodidades.`,
      propertyType,
      status: 'DISPONÍVEL' as const,
      rentPrice: rentPrice || 3500,
      condoFee: condoFee || 0,
      propertyTax: propertyTax || 0,
      bedrooms: bedrooms || 1,
      bathrooms: bathrooms || 1,
      parkingSpaces: parkingSpaces || 0,
      area: area || 50,
      furnished,
      petsAllowed,
      latitude: finalLat,
      longitude: finalLng,
      publicAddress: publicAddress || `${neighborhood}, ${city}`,
      neighborhood: neighborhood || 'Centro',
      city: city || 'São Paulo',
      state: state || 'SP',
      featured: true,
      verified: true,
      images: [
        imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80'
      ],
      demandScore: 92,
      pricePerSqm: Math.round((rentPrice || 3500) / (area || 50))
    };

    addProperty(createdProp);
    setIsWizardModalOpen(false);
    setCurrentStep(1);
    setActiveView('MAPA');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-cyber-darkest border border-cyan-500/40 rounded-3xl shadow-neon-cyan flex flex-col justify-between overflow-hidden"
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
            onClick={() => setIsWizardModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1">
          <div 
            className="bg-gradient-to-r from-cyber-cyan to-blue-500 h-full transition-all duration-300 shadow-neon-cyan"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5 text-xs font-mono">
          {/* STEP 1: Tipo & Título */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-cyber-cyan flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                1. Selecione o Tipo e Identificação
              </h4>

              <div className="space-y-2">
                <label className="text-slate-400 block">Tipo do Imóvel</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['APARTAMENTO', 'CASA', 'KITNET', 'SOBRADO', 'COMERCIAL', 'OUTROS'] as PropertyType[]).map(t => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setPropertyType(t)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        propertyType === t 
                          ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-neon-cyan' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 block">Título do Anúncio</label>
                <input
                  type="text"
                  placeholder="Ex: Apartamento Alto Padrão próximo ao Metrô"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-cyber-cyan focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Localização & Marcação Interativa no Mapa */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-cyber-cyan flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  2. Localização Exata no Mapa
                </h4>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-1 text-[11px] font-bold text-cyber-emerald bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Usar Meu GPS</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 block">Buscar Endereço (Rua e Número)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Av. Paulista, 1578 ou Rua Oscar Freire, 800"
                    value={publicAddress}
                    onChange={(e) => setPublicAddress(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:border-cyber-cyan focus:outline-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleGeocodeAddress}
                    className="px-4 py-2 rounded-xl bg-cyber-cyan/20 hover:bg-cyber-cyan/30 text-cyber-cyan font-bold border border-cyber-cyan/40 flex items-center gap-1.5 transition-colors shrink-0"
                    title="Buscar coordenadas no mapa"
                  >
                    {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Buscar</span>
                  </button>
                </div>
              </div>

              {/* Interactive Mini-Map for Pinpointing Position */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1 text-cyber-cyan font-bold">
                    <Crosshair className="w-3.5 h-3.5" />
                    Clique ou arraste o pino para marcar a posição exata:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
                  </span>
                </div>

                <div 
                  ref={miniMapContainerRef} 
                  className="w-full h-48 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-inner relative bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400">Bairro</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Cidade</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Estado</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Valores Financeiros */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-cyber-cyan flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                3. Valores e Custos da Locação
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 block">Aluguel (R$/mês)</label>
                  <input
                    type="number"
                    value={rentPrice}
                    onChange={(e) => setRentPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-base focus:border-cyber-cyan focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block">Condomínio (R$)</label>
                  <input
                    type="number"
                    value={condoFee}
                    onChange={(e) => setCondoFee(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-base focus:border-cyber-cyan focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block">IPTU Mensal (R$)</label>
                  <input
                    type="number"
                    value={propertyTax}
                    onChange={(e) => setPropertyTax(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-base focus:border-cyber-cyan focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
                <span className="text-slate-400">Total Mensal Estimado:</span>
                <span className="text-xl font-extrabold text-cyber-emerald font-mono">
                  R$ {(rentPrice + condoFee + propertyTax).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Características */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-bold text-cyber-cyan flex items-center gap-2">
                <Layers className="w-4 h-4" />
                4. Características do Imóvel
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400">Quartos</label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Banheiros</label>
                  <input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Vagas</label>
                  <input
                    type="number"
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Área (m²)</label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFurnished(!furnished)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    furnished ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {furnished ? '✓ Mobiliado' : 'Sem Mobília'}
                </button>

                <button
                  type="button"
                  onClick={() => setPetsAllowed(!petsAllowed)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    petsAllowed ? 'bg-cyber-emerald/20 border-cyber-emerald text-cyber-emerald font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {petsAllowed ? '✓ Aceita Pets' : 'Não Aceita Pets'}
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
