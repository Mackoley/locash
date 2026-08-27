import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PropertyType, PropertyStatus } from '../../types';
import * as maplibregl from 'maplibre-gl';
import { 
  X, 
  Building2, 
  MapPin, 
  DollarSign, 
  Layers, 
  Image as ImageIcon, 
  ShieldCheck, 
  Search, 
  Loader2, 
  Trash2, 
  Save, 
  Crosshair, 
  Armchair, 
  Dog,
  ChevronDown,
  Check
} from 'lucide-react';

import { PropertyPhotoUploader } from './PropertyPhotoUploader';

export const PropertyEditModal: React.FC = () => {
  const { editingProperty, setEditingProperty, editProperty, deleteProperty, setSelectedProperty } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTAMENTO');
  const [status, setStatus] = useState<PropertyStatus>('DISPONÍVEL');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [rentPrice, setRentPrice] = useState<number>(3500);
  const [condoFee, setCondoFee] = useState<number>(600);
  const [propertyTax, setPropertyTax] = useState<number>(200);
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [parkingSpaces, setParkingSpaces] = useState<number>(1);
  const [area, setArea] = useState<number>(75);
  const [furnished, setFurnished] = useState<boolean>(true);
  const [petsAllowed, setPetsAllowed] = useState<boolean>(true);
  const [neighborhood, setNeighborhood] = useState('');
  const [publicAddress, setPublicAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState<number>(-23.5630);
  const [longitude, setLongitude] = useState<number>(-46.6850);
  const [images, setImages] = useState<string[]>([]);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<maplibregl.Map | null>(null);
  const miniMapMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Pre-fill form when editingProperty changes
  useEffect(() => {
    if (!editingProperty) return;

    setTitle(editingProperty.title);
    setDescription(editingProperty.description);
    setPropertyType(editingProperty.propertyType);
    setStatus(editingProperty.status);
    setRentPrice(editingProperty.rentPrice);
    setCondoFee(editingProperty.condoFee);
    setPropertyTax(editingProperty.propertyTax);
    setBedrooms(editingProperty.bedrooms);
    setBathrooms(editingProperty.bathrooms);
    setParkingSpaces(editingProperty.parkingSpaces);
    setArea(editingProperty.area);
    setFurnished(editingProperty.furnished);
    setPetsAllowed(editingProperty.petsAllowed);
    setNeighborhood(editingProperty.neighborhood);
    setPublicAddress(editingProperty.publicAddress);
    setCity(editingProperty.city);
    setState(editingProperty.state);
    setLatitude(editingProperty.latitude);
    setLongitude(editingProperty.longitude);
    setImages(Array.isArray(editingProperty.images) && editingProperty.images.length > 0 ? editingProperty.images : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80']);
  }, [editingProperty]);

  // Mini-map initialization for location adjustment
  useEffect(() => {
    if (!editingProperty || !miniMapContainerRef.current) return;

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
            'google-roadmap-tiles': {
              type: 'raster',
              tiles: [
                'https://mt0.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}',
                'https://mt1.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}',
                'https://mt2.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}',
                'https://mt3.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}'
              ],
              tileSize: 256,
              maxzoom: 21
            }
          },
          layers: [{ id: 'google-roadmap-layer', type: 'raster', source: 'google-roadmap-tiles' }]
        },
        center: [editingProperty.longitude, editingProperty.latitude],
        zoom: 15,
        attributionControl: false
      });

      const pinEl = document.createElement('div');
      pinEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: grab; filter: drop-shadow(0 0 10px rgba(0,242,254,0.8));">
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #00f2fe; box-shadow: 0 0 14px #00f2fe, 0 0 6px #ffffff; border: 3px solid #ffffff; transition: transform 0.2s;"></div>
          <div style="width: 3px; height: 12px; background: #00f2fe; border-radius: 2px;"></div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: pinEl, draggable: true, anchor: 'bottom' })
        .setLngLat([editingProperty.longitude, editingProperty.latitude])
        .addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setLatitude(lngLat.lat);
        setLongitude(lngLat.lng);
      });

      map.on('click', (e) => {
        marker.setLngLat(e.lngLat);
        setLatitude(e.lngLat.lat);
        setLongitude(e.lngLat.lng);
      });

      miniMapInstanceRef.current = map;
      miniMapMarkerRef.current = marker;
    }, 200);

    return () => {
      clearTimeout(timer);
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [editingProperty]);

  if (!editingProperty) return null;

  const stateToUf: Record<string, string> = {
    'Bahia': 'BA', 'São Paulo': 'SP', 'Rio de Janeiro': 'RJ', 'Minas Gerais': 'MG',
    'Paraná': 'PR', 'Rio Grande do Sul': 'RS', 'Santa Catarina': 'SC', 'Pernambuco': 'PE',
    'Ceará': 'CE', 'Goiás': 'GO', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
    'Maranhão': 'MA', 'Amazonas': 'AM', 'Pará': 'PA', 'Paraíba': 'PB',
    'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Alagoas': 'AL', 'Piauí': 'PI',
    'Rio Grande do Norte': 'RN', 'Sergipe': 'SE', 'Rondônia': 'RO', 'Tocantins': 'TO',
    'Acre': 'AC', 'Amapá': 'AP', 'Roraima': 'RR'
  };

  const reverseGeocodeCoordinates = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' }
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.street || addr.pedestrian || addr.footway || addr.avenue || '';
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
        setIsGeocoding(false);
        return;
      }
    } catch (e) {
      console.warn('Erro no reverse geocoding:', e);
    }
    setIsGeocoding(false);
  };

  const handleUseCurrentLocation = () => {
    setIsGeocoding(true);
    if (navigator.geolocation) {
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

  const handleGeocodeSearch = async () => {
    const fullQuery = `${publicAddress}, ${neighborhood}, ${city}, ${state}`.trim();
    if (!fullQuery) return;

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
        if (miniMapInstanceRef.current && miniMapMarkerRef.current) {
          miniMapMarkerRef.current.setLngLat([newLng, newLat]);
          miniMapInstanceRef.current.flyTo({ center: [newLng, newLat], zoom: 16 });
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsGeocoding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    editProperty(editingProperty.id, {
      title,
      description,
      propertyType,
      status,
      rentPrice,
      condoFee,
      propertyTax,
      bedrooms,
      bathrooms,
      parkingSpaces,
      area,
      furnished,
      petsAllowed,
      neighborhood,
      publicAddress,
      city,
      state,
      latitude,
      longitude,
      images: images.length > 0 ? images : editingProperty.images
    });

    setEditingProperty(null);
    alert('✅ Informações do imóvel atualizadas com sucesso!');
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir o imóvel "${editingProperty.title}"?`)) {
      deleteProperty(editingProperty.id);
      setEditingProperty(null);
      alert('🗑️ Imóvel excluído da plataforma.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-cyber-darkest border border-cyan-500/40 rounded-3xl shadow-neon-cyan flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 glass-panel flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyber-cyan border border-cyber-cyan/40">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Editar Imóvel
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                ID #{editingProperty.id.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditingProperty(null)}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs font-mono no-scrollbar flex-1">
          {/* Title, Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-400 font-bold">Título do Imóvel</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-sans text-sm focus:border-cyber-cyan focus:outline-none"
              />
            </div>

            {/* Custom In-Place Dropdown for Tipo */}
            <div className="space-y-1 relative">
              <label className="text-slate-400 font-bold">Tipo</label>
              <button
                type="button"
                onClick={() => {
                  setIsTypeDropdownOpen(!isTypeDropdownOpen);
                  setIsStatusDropdownOpen(false);
                }}
                className="w-full bg-slate-900 border border-slate-700 hover:border-cyan-500/60 rounded-xl p-2.5 text-white text-xs flex items-center justify-between transition-all cursor-pointer font-bold"
              >
                <span className="truncate">{propertyType}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 shrink-0 ml-1 ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-40 p-1.5 rounded-xl bg-[#091022]/98 border border-cyan-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-xl space-y-1 max-h-48 overflow-y-auto no-scrollbar animate-fade-in">
                  {(['APARTAMENTO', 'CASA', 'KITNET', 'SOBRADO', 'COMERCIAL', 'OUTROS'] as PropertyType[]).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => {
                        setPropertyType(t);
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        propertyType === t 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <span>{t}</span>
                      {propertyType === t && <Check className="w-3 h-3 text-cyan-400 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom In-Place Dropdown for Status */}
            <div className="space-y-1 relative">
              <label className="text-slate-400 font-bold">Status</label>
              <button
                type="button"
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsTypeDropdownOpen(false);
                }}
                className="w-full bg-slate-900 border border-slate-700 hover:border-cyan-500/60 rounded-xl p-2.5 text-white text-xs flex items-center justify-between transition-all cursor-pointer font-bold font-mono"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    status === 'DISPONÍVEL' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' :
                    status === 'ALUGADO' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' :
                    status === 'EM NEGOCIAÇÃO' ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]' :
                    'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                  }`} />
                  <span className="truncate">{status}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 shrink-0 ml-1 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-40 p-1.5 rounded-xl bg-[#091022]/98 border border-cyan-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-xl space-y-1 animate-fade-in">
                  {(['DISPONÍVEL', 'ALUGADO', 'EM NEGOCIAÇÃO', 'RESERVADO'] as PropertyStatus[]).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => {
                        setStatus(st);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left py-2 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-between cursor-pointer ${
                        status === st 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          st === 'DISPONÍVEL' ? 'bg-emerald-400' :
                          st === 'ALUGADO' ? 'bg-blue-400' :
                          st === 'EM NEGOCIAÇÃO' ? 'bg-purple-400' :
                          'bg-amber-400'
                        }`} />
                        <span>{st}</span>
                      </div>
                      {status === st && <Check className="w-3 h-3 text-cyan-400 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Financial Values (3 columns in a single line) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold text-[11px] sm:text-xs truncate block">Aluguel (R$/mês)</label>
              <input
                type="number"
                required
                value={rentPrice}
                onChange={(e) => setRentPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 sm:p-2.5 text-cyber-emerald font-bold text-xs sm:text-sm focus:border-cyber-cyan focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold text-[11px] sm:text-xs truncate block">Condomínio (R$)</label>
              <input
                type="number"
                value={condoFee}
                onChange={(e) => setCondoFee(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 sm:p-2.5 text-white text-xs sm:text-sm focus:border-cyber-cyan focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold text-[11px] sm:text-xs truncate block">IPTU (R$)</label>
              <input
                type="number"
                value={propertyTax}
                onChange={(e) => setPropertyTax(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 sm:p-2.5 text-white text-xs sm:text-sm focus:border-cyber-cyan focus:outline-none"
              />
            </div>
          </div>

          {/* Characteristics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="space-y-1">
              <label className="text-slate-400">Quartos</label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-bold text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Banheiros</label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-bold text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Vagas</label>
              <input
                type="number"
                value={parkingSpaces}
                onChange={(e) => setParkingSpaces(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-bold text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Área (m²)</label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFurnished(!furnished)}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer font-bold text-xs ${
                furnished 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-neon-cyan' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Armchair className={`w-4 h-4 ${furnished ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{furnished ? 'Mobiliado' : 'Sem Mobília'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPetsAllowed(!petsAllowed)}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all cursor-pointer font-bold text-xs ${
                petsAllowed 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-neon-cyan' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Dog className={`w-4 h-4 ${petsAllowed ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{petsAllowed ? 'Aceita Pets' : 'Não Aceita Pets'}</span>
            </button>
          </div>

          {/* Address & Mini-map */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-slate-400 font-bold block">Endereço e Posição no Mapa</label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isGeocoding}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyber-cyan border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              >
                {isGeocoding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />}
                <span>Usar meu GPS</span>
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={publicAddress}
                onChange={(e) => setPublicAddress(e.target.value)}
                placeholder="Rua, Avenida, Número..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-sans text-sm focus:border-cyber-cyan focus:outline-none"
              />
              <button
                type="button"
                onClick={handleGeocodeSearch}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow-neon-cyan transition-all transform active:scale-95 shrink-0 cursor-pointer"
              >
                {isGeocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>Buscar</span>
              </button>
            </div>

            <div className="space-y-1.5 mt-2">
              <div 
                ref={miniMapContainerRef} 
                className="w-full h-44 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-inner relative bg-slate-950"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                  <span>📍</span> Arraste o pino ou clique no mapa para reposicionar
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">Descrição</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-cyber-cyan focus:outline-none font-sans"
            />
          </div>

          {/* Photo Gallery Uploader with Compression & Cloud/Base64 Storage */}
          <PropertyPhotoUploader 
            images={images} 
            onChange={setImages} 
            propertyId={editingProperty.id} 
          />

          {/* Submit and Delete Action Buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 font-bold text-xs transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.25)] active:scale-95 cursor-pointer group/del"
              title="Excluir este imóvel permanentemente"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover/del:scale-110 transition-transform" />
              <span>Excluir Imóvel</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-800 hover:border-slate-700 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all duration-200 shadow-[0_0_20px_rgba(0,242,254,0.3)] hover:shadow-[0_0_30px_rgba(0,242,254,0.5)] active:scale-95 cursor-pointer group/save"
              >
                <Save className="w-3.5 h-3.5 text-slate-950 stroke-[2.5] group-hover/save:scale-110 transition-transform" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
