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
  Dog
} from 'lucide-react';

export const PropertyEditModal: React.FC = () => {
  const { editingProperty, setEditingProperty, editProperty, deleteProperty, setSelectedProperty } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTAMENTO');
  const [status, setStatus] = useState<PropertyStatus>('DISPONÍVEL');
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
  const [imageUrl, setImageUrl] = useState('');
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
    setImageUrl(editingProperty.images[0] || '');
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
            'carto-dark-tiles': {
              type: 'raster',
              tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
              tileSize: 256
            }
          },
          layers: [{ id: 'carto-dark', type: 'raster', source: 'carto-dark-tiles' }]
        },
        center: [editingProperty.longitude, editingProperty.latitude],
        zoom: 15,
        attributionControl: false
      });

      const pinEl = document.createElement('div');
      pinEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: grab;">
          <div style="background: rgba(13, 21, 39, 0.95); border: 2px solid #00f2fe; color: #00f2fe; padding: 4px 8px; border-radius: 8px; font-weight: 800; font-size: 10px; font-family: monospace; box-shadow: 0 0 15px #00f2fe;">
            📍 ARRASTE PARA REPOSICIONAR
          </div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #00f2fe; box-shadow: 0 0 12px #00f2fe; border: 2px solid #ffffff; margin-top: 2px;"></div>
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
      images: imageUrl ? [imageUrl, ...editingProperty.images.slice(1)] : editingProperty.images
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
          {/* Status Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold uppercase block">Status da Locação</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['DISPONÍVEL', 'RESERVADO', 'EM NEGOCIAÇÃO', 'ALUGADO'] as PropertyStatus[]).map(st => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    status === st 
                      ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-neon-cyan' 
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Tipo</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-cyber-cyan focus:outline-none"
              >
                <option value="APARTAMENTO">APARTAMENTO</option>
                <option value="CASA">CASA</option>
                <option value="KITNET">KITNET</option>
                <option value="SOBRADO">SOBRADO</option>
                <option value="COMERCIAL">COMERCIAL</option>
                <option value="OUTROS">OUTROS</option>
              </select>
            </div>
          </div>

          {/* Financial Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Aluguel (R$/mês)</label>
              <input
                type="number"
                required
                value={rentPrice}
                onChange={(e) => setRentPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-cyber-emerald font-bold text-sm focus:border-cyber-cyan focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Condomínio (R$)</label>
              <input
                type="number"
                value={condoFee}
                onChange={(e) => setCondoFee(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyber-cyan focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">IPTU (R$)</label>
              <input
                type="number"
                value={propertyTax}
                onChange={(e) => setPropertyTax(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-cyber-cyan focus:outline-none"
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
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                furnished ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <Armchair className="w-4 h-4" />
              <span>{furnished ? 'Mobiliado' : 'Sem Mobília'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPetsAllowed(!petsAllowed)}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                petsAllowed ? 'bg-cyber-emerald/20 border-cyber-emerald text-cyber-emerald font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <Dog className="w-4 h-4" />
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
                className="px-3.5 py-2 rounded-xl bg-cyber-cyan/20 hover:bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/40 flex items-center gap-1 font-bold"
              >
                {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Buscar</span>
              </button>
            </div>

            <div 
              ref={miniMapContainerRef} 
              className="w-full h-40 rounded-2xl overflow-hidden border border-cyan-500/40 shadow-inner relative bg-slate-950 mt-2"
            />
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

          {/* Photo URL */}
          <div className="space-y-1">
            <label className="text-slate-400 font-bold">URL da Imagem Principal</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:border-cyber-cyan focus:outline-none"
            />
          </div>

          {/* Submit and Delete Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-cyber-red border border-red-500/40 font-bold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Imóvel</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold shadow-neon-cyan transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
